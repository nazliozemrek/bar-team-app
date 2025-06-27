'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db,auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection,getDocs,updateDoc } from 'firebase/firestore';
import { sendPushNotification } from '@/lib/sendPushNotification';


async function backfillScheduleUID(name: string, uid : string) {
  const schedulesRef = collection(db,'Schedules');
  const snapshot = await getDocs(schedulesRef);
  
  for (const docSnap of snapshot.docs){
    const data = docSnap.data();
    if(!Array.isArray(data.schedule)) continue;
    
    const updated = data.schedule.map((entry: any ) => {
      if (
        entry.name?.trim().toLowerCase() === name.trim().toLocaleLowerCase() && 
        !entry.uid
      ){
        return { ...entry,uid};
      }
      return entry;
    });
    await updateDoc(doc(db,'Schedules',docSnap.id),{schedule: updated});
  }
}




export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert('Please fill all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save display name to Auth
      await updateProfile(user, { displayName: name });

      // Save name, email, role to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: 'bartender',
        createdAt: serverTimestamp(),
      });

      await backfillScheduleUID(name,user.uid);
      await sendPushNotification('New Team Member!', `${name} just joined the team.`);


      router.push('/schedule');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-4">
      <h1 className="text-3xl font-bold">Register</h1>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full max-w-md p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full max-w-md p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full max-w-md p-2 border rounded"
      />
      <button
        onClick={handleRegister}
        className="w-full max-w-md py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Register
      </button>
    </main>
  );
}
