'use client'

import { useEffect,useState  } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth,db } from "@/lib/firebase";
import { doc,getDoc } from 'firebase/firestore'

export default function LandingPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [userName,setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const userRef = doc(db,"users",user.uid);
      const userSnap = await getDoc(userRef);
      if(userSnap.exists()){
        const data = userSnap.data();
        setUserName(data.name || user.displayName || user.email);
      } else {
        setUserName(user.displayName || user.email);
      }
    };
    fetchName();
  },[user]);




  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleDashboard = () => {
    router.push("/schedule");
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-6 p-8">
      <h1 className="text-4xl font-bold">Welcome to Bar Team App</h1>

      {user ? (
        <>
          <p className="text-xl">Hello, {userName  ||  user.email}!</p>

          <button
            onClick={handleDashboard}
            className="w-full max-w-xs py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to My Schedule
          </button>

          <button
            onClick={handleLogout}
            className="w-full max-w-xs py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleLogin}
            className="w-full max-w-xs py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>

          <button
            onClick={handleRegister}
            className="w-full max-w-xs py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Register
          </button>
        </>
      )}
    </main>
  );
}
