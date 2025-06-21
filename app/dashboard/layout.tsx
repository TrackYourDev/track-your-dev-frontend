'use client';

import React from 'react';
import Sidebar from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-950">
      <Sidebar />
      {children}
    </div>
  );
} 