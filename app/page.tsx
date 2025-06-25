'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from 'firebase/firestore';

export default function LandingPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserName(data.name || user.displayName || user.email);
      } else {
        setUserName(user.displayName || user.email);
      }
    };
    fetchName();
  }, [user]);

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");
  const handleDashboard = () => router.push("/schedule");
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <div
        className="absolute top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/tiki-bg.png')" }}
      />

      {/* Overlay Content */}
      <main className="relative z-10 flex min-h-screen w-screen flex-col items-center justify-center space-y-6 p-8 bg-black/60 text-white">
        <h1 className="text-4xl font-bold">Welcome to Bar Team App</h1>
        <h2 className="text-2xl font-semibold">Complete your daily tasks and check your schedules!</h2>

        {user ? (
          <>
            <p className="text-xl">Hello, {userName || user.email}!</p>
            <button
              onClick={handleDashboard}
              className="w-full max-w-xs py-2 px-4 bg-green-600 rounded hover:bg-green-700"
            >
              Go to My Schedule
            </button>
            <button
              onClick={handleLogout}
              className="w-full max-w-xs py-2 px-4 bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="w-full max-w-xs py-2 px-4 bg-blue-600 rounded hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="w-full max-w-xs py-2 px-4 bg-gray-600 rounded hover:bg-gray-700"
            >
              Register
            </button>
          </>
        )}
      </main>
    </div>
  );
}
