import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function ensureUserDoc(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log("Creating new user doc for:", user.email);

    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || "",
      role: "employee", // default role unless manager (you can adjust this)
    });

  } else {
    console.log("User doc exists for:", user.email);
  }
}
