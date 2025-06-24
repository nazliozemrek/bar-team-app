'use client'

import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function LandingPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);

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
          <p className="text-xl">Hello, {user.email}!</p>

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
