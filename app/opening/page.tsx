'use client';

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function OpeningChecklistPage() {
  const [user] = useAuthState(auth);

  const checklistType = "opening";

  const [tasks, setTasks] = useState([
    { id: 1, text: "Check kegs", done: false },
    { id: 2, text: "Stock garnishes", done: false },
    { id: 3, text: "Clean bar top", done: false },
    { id: 4, text: "Check ice bins", done: false },
  ]);

  const allDone = tasks.every(task => task.done);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const handleSave = async () => {
    if (!user) {
      alert("Not logged in");
      return;
    }

    const dateId = new Date().toISOString().split('T')[0];
    const checklistRef = doc(db, "Checklists", dateId);

    await setDoc(checklistRef, {
      [checklistType]: tasks,
      user: {
        uid: user.uid,
        name: user.displayName || user.email,
      },
      completedAt: serverTimestamp(),
    }, { merge: true });

    alert("Checklist saved!");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 space-y-6">
      <h1 className="text-3xl font-bold">Opening Checklist</h1>
      <div className="w-full max-w-md space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
              className="h-5 w-5"
            />
            <label className={`text-lg ${task.done ? 'line-through text-gray-400' : ''}`}>
              {task.text}
            </label>
          </div>
        ))}

        {allDone && (
          <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-600 text-green-800 rounded text-center">
            ✅ Thank you for completing the checklist!<br />
            Please wait for your manager or supervisor to verify before leaving.
          </div>
        )}

        <button
          onClick={handleSave}
          className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Checklist
        </button>
      </div>
    </main>
  );
}
