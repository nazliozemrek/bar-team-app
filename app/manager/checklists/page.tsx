'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ManagerChecklistsPage() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string>('');
  const [checklists, setChecklists] = useState<any[]>([]);
  const [submitter, setSubmitter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      const role = userData?.role || '';
      setUserRole(role);

      if (role === 'manager') {
        const today = new Date().toISOString().split('T')[0];
        const checklistRef = doc(db, 'Checklists', today);
        const checklistSnap = await getDoc(checklistRef);

        if (checklistSnap.exists()) {
          const data = checklistSnap.data();

          // Get the submitter's name from user object
          const submittedBy = typeof data.user === 'object'
            ? data.user.name || 'Unknown'
            : typeof data.user === 'string'
              ? data.user
              : 'Unknown';

          setSubmitter(submittedBy);

          // Remove metadata fields and keep checklist types
          const tasks = Object.entries(data)
            .filter(([key]) => key !== 'user' && key !== 'completedAt')
            .map(([key, value]) => ({
              type: key,
              tasks: Array.isArray(value) ? value : [],
            }));

          setChecklists(tasks);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  if (!user) {
    return <main className="p-8">Please log in.</main>;
  }

  if (loading) {
    return <main className="p-8">Loading checklists...</main>;
  }

  if (userRole !== 'manager') {
    return (
      <main className="p-8 text-red-500">
        Access Denied. Only managers can view this page.
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Today's Checklist Submissions</h1>

      {checklists.length === 0 ? (
        <p className="text-gray-500">No checklists submitted yet.</p>
      ) : (
        <>
          <div className="border border-gray-600 rounded p-4 mb-4 bg-gray-900 text-white">
            <h2 className="text-xl font-semibold mb-1">User Checklist</h2>
            <p className="text-sm text-gray-400">
              Submitted by: {submitter || 'Unknown'}
            </p>
          </div>

          {checklists.map((entry, idx) => (
            <div
              key={idx}
              className="border border-gray-600 rounded p-4 mb-4 bg-gray-900 text-white"
            >
              <h2 className="text-xl font-semibold capitalize mb-2">
                {entry.type} Checklist
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                Submitted by: {submitter || 'Unknown'}
              </p>
              <ul className="list-disc ml-6">
                {entry.tasks.map((task: any) => (
                  <li
                    key={task.id}
                    className={task.done ? 'text-green-500' : 'text-red-400'}
                  >
                    {task.text} {task.done ? '(done)' : '(not done)'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
