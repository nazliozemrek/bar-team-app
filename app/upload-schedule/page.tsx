'use client'

import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit, setDoc } from "firebase/firestore";
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

  // Fetch role + last schedule
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

    const fetchAll = async () => {
      await fetchUserRole();
      await fetchLastSchedule();
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  // Upload schedule
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
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      console.log("Raw data:", jsonData);

      const headerRow = jsonData[1]; // Dates row
      const dataRows = jsonData.slice(2); // Data

      const dateColumns = headerRow.slice(1); // skip name col

      const scheduleData = jsonData.slice(1)
        .filter((row: any[]) => row[0])
        .map((row: any[]) => {
          const name = row[0];
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

          return { name, shifts };
        });

      console.log("Parsed schedule:", scheduleData);

      const dateId = new Date().toISOString().split('T')[0];
      const scheduleRef = doc(db, "Schedules", dateId);

      await setDoc(scheduleRef, {
        schedule: scheduleData,
        uploadedAt: new Date().toISOString(),
      });

      alert("Schedule uploaded!");

      // Reload page to show latest
      window.location.reload();
    };

    reader.readAsBinaryString(file);
  };

  if (!user) {
    return <p className="p-8">Please log in.</p>;
  }

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  if (userRole !== "manager") {
    return <p className="p-8 text-red-500">You are not authorized to view this page.</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Upload Schedule</h1>

      {/* Last uploaded */}
      {lastScheduleDate ? (
        <div className="bg-gray-500 p-4 rounded shadow w-full max-w-md text-left space-y-2">
          <h2 className="text-xl font-semibold mb-2">Last Uploaded Schedule</h2>
          <p><strong>Date:</strong> {lastScheduleDate}</p>
          <p><strong>Uploaded At:</strong> {new Date(lastUploadedAt).toLocaleString()}</p>
          <p><strong>Users in Schedule:</strong> {lastScheduleCount}</p>
        </div>
      ) : (
        <p className="text-gray-500">No schedule uploaded yet.</p>
      )}

      {/* Upload Form */}
      <div className="flex flex-col space-y-4 w-full max-w-md mt-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFile}
          accept=".xlsx, .xls"
          className="border p-2 rounded"
        />

        {file && (
          <p className="text-sm text-gray-700">Selected: {file.name}</p>
        )}

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
    if (rawDate instanceof Date) {
      return rawDate.toISOString().split("T")[0];
    }

    const parts = rawDate.match(/(\w+), (\w+) (\d+)/);
    if (!parts) return null;

    const monthName = parts[2];
    const day = parseInt(parts[3]);
    const year = new Date().getFullYear();

    const monthIndex = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ].indexOf(monthName);

    if (monthIndex === -1) return null;

    const dateObj = new Date(year, monthIndex, day);
    return dateObj.toISOString().split("T")[0];
  } catch (err) {
    console.error("Failed to parse date:", rawDate);
    return null;
  }
}
