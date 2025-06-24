// src/app/login/page.tsx
'use client'

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Login failed. Please check your email and password.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 ">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Login</h1>
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-8 rounded-md outline-blue-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-8 rounded-md outline-blue-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-900">
                    Remember me
                  </label>
                </div>
         <div className="text-sm">
                  <a href="jajvascript:void(0);" className="text-blue-600 hover:underline font-semibold">
                    Forgot your password?
                  </a>
         </div>
        <div className="!mt-12">
                <button type="submit" className="w-full py-2 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer">
                  Login
                </button>
              </div>

        <p className="text-slate-900 text-sm !mt-6 text-center">Don't have an account? <a href="javascript:void(0);" className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold">Register here</a></p>
      </form>
    </main>
  );
}
