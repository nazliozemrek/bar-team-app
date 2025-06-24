'use client'

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name,
        email,
      });

      // Send email verification
      await sendEmailVerification(user);

      setMessage("Registration successful! Please check your email to verify your account.");
      setError("");

      // Optionally clear fields
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please login.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Registration failed. " + err.message);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Register</h1>

      <form onSubmit={handleRegister} className="w-full max-w-md space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}

        <input
          type="text"
          placeholder="Full Name (must match schedule name)"
          className="w-full px-4 py-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </main>
  );
}
