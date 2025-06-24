'use client'

import Link from "next/link";

export default function ChecklistsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Opening / Closing Checklists</h1>

      <Link href="/opening" passHref>
        <button className="w-64 py-3 px-6 mb-4 bg-green-600 text-white text-lg rounded hover:bg-green-700">
          Opening Checklist
        </button>
      </Link>

      <Link href="/closing" passHref>
        <button className="w-64 py-3 px-6 mb-4 bg-red-600 text-white text-lg rounded hover:bg-red-700">
          Closing Checklist
        </button>
      </Link>

      <Link href="/schedule" passHref>
        <button className="w-64 py-3 px-6 bg-gray-600 text-white text-lg rounded hover:bg-gray-700">
          Back to My Schedule
        </button>
      </Link>
    </main>
  );
}
