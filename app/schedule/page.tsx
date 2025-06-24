'use client'

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function SchedulePage() {
  const [user] = useAuthState(auth);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [shifts, setShifts] = useState<string[]>([]);
  const [calendarWeek, setCalendarWeek] = useState<{ day: string; dateStr: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndSchedule = async () => {
      if (!user || !user.emailVerified) return;

      // Get user profile (name)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("No user profile found!");
        setProfileName(null);
        setShifts([]);
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const userName = userData.name?.trim();
      setProfileName(userName);

      // Get latest schedule
      const schedulesQuery = query(
        collection(db, "Schedules"),
        orderBy("uploadedAt", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(schedulesQuery);

      if (!querySnapshot.empty) {
        const scheduleDoc = querySnapshot.docs[0];
        const data = scheduleDoc.data();
        const scheduleArray = data.schedule as any[];

        console.log("Schedule array:", scheduleArray);

        const userSchedule = scheduleArray.find((entry) => {
          const entryName = entry.name?.trim().toLowerCase();
          return entryName === userName?.toLowerCase();
        });

        console.log("Found userSchedule:", userSchedule);

        if (userSchedule && userSchedule.shifts) {
          setShifts(userSchedule.shifts);

          // Get first shift date
          const firstShift = userSchedule.shifts[0];
          const week = getCalendarWeek(firstShift);
          setCalendarWeek(week);
        } else {
          setShifts([]);
          const week = getCalendarWeek(new Date().toISOString().split("T")[0]);
          setCalendarWeek(week);
        }
      }

      setLoading(false);
    };

    fetchProfileAndSchedule();
  }, [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Please log in to view your schedule.</p>
      </main>
    );
  }

  if (!user.emailVerified) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center space-y-4 p-8">
        <p className="text-red-500 text-lg">
          Please verify your email before using the app.
        </p>
        <p className="text-sm text-gray-600">
          Check your email inbox for a verification email.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Shifts (This Week)</h1>

      {loading ? (
        <p>Loading...</p>
      ) : profileName ? (
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
          {calendarWeek.map((dayObj, index) => {
            const hasShift = shifts.includes(dayObj.dateStr);

            return (
              <div
                key={index}
                className={`p-4 rounded shadow border transition ${
                  hasShift
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              >
                <div className="font-semibold text-lg">{dayObj.day}</div>
                <div className="text-xl mt-2">
                  {formatShortDate(dayObj.dateStr)}
                </div>
                {hasShift && (
                  <div className="mt-2 text-2xl">✅</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-red-500">No profile found. Please register again.</p>
      )}
    </main>
  );
}

// Build calendar week (Thu → Wed), starting from baseDate
function getCalendarWeek(baseISODate: string) {
  const baseDate = new Date(baseISODate);
  const dayOfWeek = baseDate.getDay(); // 0=Sun .. 6=Sat

  // Calculate nearest Thursday (before or same)
  const diffToThursday = (4 - dayOfWeek + 7) % 7;
  const thursday = new Date(baseDate);
  thursday.setDate(baseDate.getDate() - diffToThursday);

  const week: { day: string; dateStr: string }[] = [];
  const dayNames = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(thursday);
    d.setDate(thursday.getDate() + i);

    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD

    week.push({
      day: dayNames[i % 7],
      dateStr,
    });
  }

  return week;
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  const month = d.getMonth() + 1; // Jan = 0
  const day = d.getDate();
  return `${month}/${day}`;
}
