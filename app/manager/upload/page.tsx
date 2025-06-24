'use client'

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ScheduleUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log("Selected file:", selectedFile);
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected");
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

      const headerRow = jsonData[1]; // ROW WITH DATES!!
      const dataRows = jsonData.slice(2); // DATA starts here

      const dateColumns = headerRow.slice(1); // skip Name column

      console.log("Date columns:", dateColumns);

      const emailLookup: { [name: string]: string } = {
        "Kaan Nazlioz": "kaannazlioz@test.com",
      };

      const scheduleData = dataRows
        .filter((row: any[]) => row[0]) // skip rows with no name
        .map((row: any[]) => {
          const name = row[0].trim();
          const shifts: string[] = [];

          row.slice(1).forEach((cell, index) => {
            const rawDate = dateColumns[index];
            if (!rawDate) return;

            const parsedDate = parseDate(rawDate);
            if (cell && parsedDate && typeof cell === "string" && cell.toLowerCase() !== "rto") {
              shifts.push(parsedDate);
            }
          });

          return {
            name,
            email: emailLookup[name] || "",
            shifts
          };
        });

      console.log("Parsed schedule:", scheduleData);

      const dateId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const scheduleRef = doc(db, "Schedules", dateId);

      await setDoc(scheduleRef, {
        schedule: scheduleData,
        uploadedAt: new Date().toISOString(),
      });

      alert("Schedule uploaded!");
    };

    reader.readAsBinaryString(file);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Upload Schedule (Excel)</h1>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFile}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Button to select file */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-md py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Select File
      </button>

      {/* Show file name */}
      {file && (
        <p className="text-sm text-gray-700">Selected: {file.name}</p>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file}
        className={`mt-4 w-full max-w-md py-2 px-4 rounded text-white ${
          file ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Upload
      </button>
    </main>
  );
}

function parseDate(rawDate: any): string | null {
  try {
    if (rawDate instanceof Date) {
      return rawDate.toISOString().split("T")[0];
    }

    if (typeof rawDate === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const dateObj = new Date(excelEpoch.getTime() + rawDate * 24 * 60 * 60 * 1000);
      return dateObj.toISOString().split("T")[0];
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
