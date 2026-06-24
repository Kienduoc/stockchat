'use client';

import LiveDashboard from '@/components/LiveDashboard';
import AppShell from '@/components/AppShell';

export default function AppPage() {
  return (
    <AppShell>
      <LiveDashboard />
    </AppShell>
  );
}
