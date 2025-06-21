'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="flex-1 min-h-screen bg-[#101011] text-white p-0 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">The main dashboard content has moved to <span className="font-semibold">Track Tasks</span>.</p>
      <Link href="/dashboard/tracktasks" className="text-blue-500 underline">Go to Track Tasks</Link>
    </main>
  );
}
