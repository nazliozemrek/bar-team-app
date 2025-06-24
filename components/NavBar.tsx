'use client'

import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserRole(data.role || "");
        }
      }
    };

    fetchRole();
  }, [user]);

  if (!user) return null; // don't show nav if not logged in

  return (
    <nav className="w-full bg-gray-800 text-white p-4 flex flex-wrap justify-center sm:justify-between items-center shadow-md">
      <div className="flex flex-wrap gap-4 text-sm sm:text-base">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/schedule" className="hover:underline">My Shifts</Link>
        <Link href="/checklists" className="hover:underline">Checklists</Link>
        {userRole === "manager" && (
          <Link href="/upload-schedule" className="hover:underline">Upload Schedule</Link>
        )}
      </div>

      <button
        onClick={() => auth.signOut()}
        className="mt-2 sm:mt-0 text-red-400 hover:text-red-600"
      >
        Logout
      </button>
    </nav>
  );
}
