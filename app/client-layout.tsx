'use client';

import Navbar from '@/components/Navbar';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user] = useAuthState(auth);

  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}
