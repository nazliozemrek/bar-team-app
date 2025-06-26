'use client'

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NavBar() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

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

  if (!user) return null;

  const handleLogout = async () => {
    await auth.signOut();
  };

  const commonLinks = [
    { href: "/", label: "Home" },
    { href: "/schedule", label: "My Shifts" },
    { href: "/checklists", label: "Checklists" },
  ];

  if (userRole === "manager") {
    commonLinks.push(
      { href: "/upload-schedule", label: "Upload Schedule" },
      { href: "/manager/checklists", label: "View Submissions" },
      { href: "/leaderboard", label:"Leaderboard"}
    );
  }

  return (
    <nav className="w-full bg-gray-900 text-white px-4 py-3 shadow-md relative z-50">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Bar Team App</div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden md:flex space-x-6 items-center">
          {commonLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-yellow-400">
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-red-400 hover:text-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 flex flex-col space-y-3 bg-gray-800 px-4 py-4 rounded shadow-md">
          {commonLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-yellow-300" onClick={() => setIsOpen(false)}>
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-red-400 hover:text-red-600 text-left">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
