import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getLevel } from '@/lib/levels';

// Bảng xếp hạng Cao thủ: điểm = (lượt "Đúng" - lượt "Sai") nhận được trên các tin đã đăng
export async function GET() {
  try {
    // Lấy posts (để map post -> tác giả + avatar) và toàn bộ verdict
    const [postsRes, verdictsRes] = await Promise.all([
      supabase.from('posts').select('id, author_name, author_avatar').limit(5000),
      supabase.from('post_verdicts').select('post_id, verdict').limit(20000),
    ]);

    const posts = postsRes.data || [];
    const verdicts = verdictsRes.data || [];

    interface Stat {
      name: string;
      avatar: string | null;
      posts: number;
      trueVotes: number;
      falseVotes: number;
    }
    const stats = new Map<string, Stat>();
    const postAuthor = new Map<string, { name: string; avatar: string | null }>();

    for (const p of posts) {
      postAuthor.set(p.id, { name: p.author_name, avatar: p.author_avatar });
      let s = stats.get(p.author_name);
      if (!s) {
        s = { name: p.author_name, avatar: p.author_avatar, posts: 0, trueVotes: 0, falseVotes: 0 };
        stats.set(p.author_name, s);
      }
      s.posts += 1;
      if (p.author_avatar && !s.avatar) s.avatar = p.author_avatar;
    }

    for (const v of verdicts) {
      const author = postAuthor.get(v.post_id);
      if (!author) continue;
      const s = stats.get(author.name);
      if (!s) continue;
      if (v.verdict === 'true') s.trueVotes += 1;
      else s.falseVotes += 1;
    }

    const leaderboard = [...stats.values()]
      .map((s) => {
        const points = s.trueVotes - s.falseVotes;
        const totalVotes = s.trueVotes + s.falseVotes;
        const accuracy = totalVotes ? Math.round((s.trueVotes / totalVotes) * 100) : 0;
        const level = getLevel(points);
        return {
          name: s.name,
          avatar: s.avatar,
          posts: s.posts,
          points,
          trueVotes: s.trueVotes,
          falseVotes: s.falseVotes,
          accuracy,
          level: level.name,
          levelIcon: level.icon,
          levelColor: level.color,
        };
      })
      .filter((r) => r.posts > 0)
      .sort((a, b) => b.points - a.points || b.accuracy - a.accuracy)
      .slice(0, 100);

    return NextResponse.json({ data: leaderboard });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
