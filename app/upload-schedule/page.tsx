'use client';

import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  doc, getDoc, collection, getDocs,
  query, orderBy, limit, setDoc
} from "firebase/firestore";
import * as XLSX from "xlsx";

export default function UploadSchedulePage() {
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastScheduleDate, setLastScheduleDate] = useState<string | null>(null);
  const [lastUploadedAt, setLastUploadedAt] = useState<string | null>(null);
  const [lastScheduleCount, setLastScheduleCount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserRole(userData.role || "user");
      }
    };

    const fetchLastSchedule = async () => {
      const schedulesQuery = query(
        collection(db, "Schedules"),
        orderBy("uploadedAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(schedulesQuery);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        setLastScheduleDate(docSnap.id);
        setLastUploadedAt(data.uploadedAt || null);
        if (Array.isArray(data.schedule)) {
          setLastScheduleCount(data.schedule.length);
        }
      }
    };

    const fetchUsersList = async () => {
      const usersQuery = collection(db, "users");
      const querySnapshot = await getDocs(usersQuery);
      const allUsers = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id,
      }));
      setUsersList(allUsers);
    };

    const fetchAll = async () => {
      await fetchUserRole();
      await fetchLastSchedule();
      await fetchUsersList();
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
      });

      const headerRowIndex = findHeaderRow(jsonData);
      const headerRow = jsonData[headerRowIndex];
      const dateColumns = headerRow.slice(1);
      const dataRows = jsonData.slice(headerRowIndex + 1);

      const scheduleData = dataRows
        .filter((row: any[]) => row[0])
        .map((row: any[]) => {
          const name = row[0];
          const email = lookupEmailByName(name, usersList);
          const uid = lookupUIDByName(name, usersList);
          const shifts: string[] = [];

          row.slice(1).forEach((cell, index) => {
            const rawDate = dateColumns[index];
            if (!rawDate) return;
            if (cell && typeof cell === "string" && cell.toLowerCase() !== "rto") {
              const parsedDate = parseDate(rawDate);
              if (parsedDate) {
                shifts.push(parsedDate);
              }
            }
          });

          return { name, email, uid, shifts };
        });

      const dateId = new Date().toISOString().split('T')[0];
      const scheduleRef = doc(db, "Schedules", dateId);
      await setDoc(scheduleRef, {
        schedule: scheduleData,
        uploadedAt: new Date().toISOString(),
      });

      await fetch('/api/sendNotification', {
          method: 'POST',
          headers: {
                    'Content-Type': 'application/json',
                   },
          body: JSON.stringify({
          title: '📅 New Schedule Uploaded!',
          message: 'Check your updated shifts in the app.',
       }),
     });


      alert("Schedule uploaded!");
      window.location.reload();
    };

    reader.readAsBinaryString(file);
  };

  if (!user) return <p className="p-8">Please log in.</p>;
  if (loading) return <p className="p-8">Loading...</p>;
  if (userRole !== "manager") return <p className="p-8 text-red-500">You are not authorized to view this page.</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Upload Schedule</h1>

      {lastScheduleDate ? (
        <div className="bg-gray-500 p-4 rounded shadow w-full max-w-md text-left space-y-2 text-white">
          <h2 className="text-xl font-semibold mb-2">Last Uploaded Schedule</h2>
          <p><strong>Date:</strong> {lastScheduleDate}</p>
          <p><strong>Uploaded At:</strong> {new Date(lastUploadedAt).toLocaleString()}</p>
          <p><strong>Users in Schedule:</strong> {lastScheduleCount}</p>
        </div>
      ) : (
        <p className="text-gray-500">No schedule uploaded yet.</p>
      )}

      <div className="flex flex-col space-y-4 w-full max-w-md mt-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFile}
          accept=".xlsx, .xls"
          className="border p-2 rounded"
        />
        {file && <p className="text-sm text-gray-700">Selected: {file.name}</p>}
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`py-2 px-4 rounded text-white ${
            file ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Upload Schedule
        </button>
      </div>
    </main>
  );
}

function parseDate(rawDate: any): string | null {
  try {
    if (typeof rawDate === 'number') {
      const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
      return jsDate.toISOString().split("T")[0];
    }

    if (rawDate instanceof Date) {
      return rawDate.toISOString().split("T")[0];
    }

    const cleaned = String(rawDate).trim();

    const m1 = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
    if (m1) {
      const month = parseInt(m1[1]);
      const day = parseInt(m1[2]);
      const year = m1[3]
        ? parseInt(m1[3].length === 2 ? "20" + m1[3] : m1[3])
        : new Date().getFullYear();
      const jsDate = new Date(year, month - 1, day);
      return jsDate.toISOString().split("T")[0];
    }

    const m2 = cleaned.match(/^(\d{1,2})[\-\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?(?:[\-\s](\d{2,4}))?$/i);
    if (m2) {
      const day = parseInt(m2[1]);
      const monthStr = m2[2].toLowerCase();
      const monthMap: any = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = monthMap[monthStr.slice(0,3)];
      const year = m2[3]
        ? parseInt(m2[3].length === 2 ? "20" + m2[3] : m2[3])
        : new Date().getFullYear();
      const jsDate = new Date(year, month, day);
      return jsDate.toISOString().split("T")[0];
    }

    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }

    return null;
  } catch (err) {
    console.error("Failed to parse date:", rawDate, err);
    return null;
  }
}

function findHeaderRow(jsonData: any[][]): number {
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row[0] && typeof row[0] === "string" && row[0].toLowerCase().includes("name")) {
      return i;
    }
  }
  return 1;
}

function lookupEmailByName(name: string, users: any[]): string {
  const match = users.find(u =>
    u.name?.trim().toLowerCase() === name.trim().toLowerCase()
  );
  return match?.email || "";
}

function lookupUIDByName(name: string, users: any[]): string {
  const match = users.find(u =>
    u.name?.trim().toLowerCase() === name.trim().toLowerCase()
  );
  return match?.uid || '';
}
