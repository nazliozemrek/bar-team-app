'use client';

import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManagerPanel() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data.role || 'employee');
        }
      }
      setLoading(false);
    };
    fetchRole();
  }, [user]);

  if (!user) return <p className="p-8">You must be logged in.</p>;
  if (loading) return <p className="p-8">Loading...</p>;
  if (role !== 'manager') return <p className="p-8">No permission.</p>;

  return (
    <main className="flex flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manager Panel</h1>

      <Link
        href="/manager/upload"
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Upload New Schedule
      </Link>

      {/* Future: More manager tools here */}
    </main>
  );
}
