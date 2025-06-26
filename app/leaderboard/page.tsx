'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().email,
        xp: doc.data().xp || 0
      }));

      const sorted = data.sort((a, b) => b.xp - a.xp);
      setUsers(sorted);
    };

    fetchUsers();
  }, []);

  return (
    <main className="p-8 min-h-screen text-white bg-black">
      <h1 className="text-3xl font-bold mb-6">🏆 XP Leaderboard</h1>
      <ul className="space-y-4">
        {users.map((user, index) => (
          <li key={user.id} className="p-4 bg-gray-800 rounded">
            <span className="font-bold text-yellow-400">#{index + 1}</span> {user.name} — {user.xp} XP
          </li>
        ))}
      </ul>
    </main>
  );
}
