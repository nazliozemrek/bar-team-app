'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

export default function ManagerChecklistsPage() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string>('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const role = data.role || '';
        setUserRole(role);

        if (role === 'manager') {
          const today = new Date().toISOString().split('T')[0];
          const submissionsRef = collection(db, 'Checklists', today, 'submissions');
          const subsSnap = await getDocs(submissionsRef);

          const allSubs = subsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSubmissions(allSubs);
        }
      }

      setLoading(false);
    };

    checkAccessAndLoad();
  }, [user]);

  if (!user) return <main className="p-8">Please log in.</main>;
  if (loading) return <main className="p-8">Loading submissions...</main>;
  if (userRole !== 'manager') return <main className="p-8 text-red-500">Access Denied. Only managers can view this page.</main>;

  return (
    <main className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Today's Checklist Submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-6">
          {submissions.map((entry, idx) => (
            <div key={idx} className="border border-gray-300 rounded p-4">
              <h2 className="text-xl font-semibold capitalize mb-1">
                {entry.type} Checklist
              </h2>
              <p className="text-sm text-gray-600 mb-2">Submitted by: {entry.name || 'Unknown'}</p>
              <ul className="list-disc ml-6">
                {entry.tasks.map((task: any) => (
                  <li
                    key={task.id}
                    className={task.done ? 'text-green-600' : 'text-red-500'}
                  >
                    {task.text} {task.done ? '(done)' : '(not done)'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
