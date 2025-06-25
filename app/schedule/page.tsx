'use client'

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import dayjs from 'dayjs';

export default function SchedulePage() {
  const [user] = useAuthState(auth);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [lastUploaded, setLastUploaded] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const fetchSchedule = async () => {
      try {
        const schedulesRef = collection(db, 'Schedules');
        const q = query(schedulesRef, orderBy('uploadedAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          const scheduleData = data.schedule || [];

          setSchedule(scheduleData);

          const uploadDate = dayjs(doc.id);
          setLastUploaded(uploadDate.format('M/D/YYYY'));

          // NEW — calculate week from first shift in schedule:
          const allShifts = scheduleData.flatMap((e: any) => e.shifts);
          const firstShiftDate = allShifts.sort()[0]; // earliest date

          const startOfWeek = dayjs(firstShiftDate).startOf('week').add(4, 'day'); // start on Thursday

          const dates = Array.from({ length: 7 }).map((_, i) =>
            startOfWeek.add(i, 'day').format('YYYY-MM-DD')
          );
          setWeekDates(dates);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        <h1>Please log in to view your schedule.</h1>
      </main>
    );
  }

  const userName = user.displayName || user.email;
  const entry = schedule.find(e =>
    e.name === userName || e.email === user.email
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6 text-white">
      <h1 className="text-3xl font-bold">My Schedule</h1>
      {lastUploaded && (
        <p className="text-sm text-gray-400">Last Uploaded: {lastUploaded}</p>
      )}

      {entry ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {weekDates.map(date => {
            const shift = entry.shifts.includes(date);
            const formatted = dayjs(date).format('ddd M/D');
            return (
              <div
                key={date}
                className={`px-4 py-2 rounded shadow ${
                  shift ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {formatted}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center mt-8 text-gray-400">
          No shifts found in schedule.
        </p>
      )}
    </main>
  );
}
