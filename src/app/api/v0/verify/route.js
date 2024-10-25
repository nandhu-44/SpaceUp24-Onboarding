import { NextResponse } from "next/server";
import { db, db2 } from "@/db/firebase";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Check first database (db)
    const ticketOrdersRef = collection(db, "ticketorders");
    const q = query(ticketOrdersRef, where("token", "==", token));
    let querySnapshot = await getDocs(q);

    // If not found in first database, check second database (db2)
    let useSecondDB = false;
    if (querySnapshot.empty) {
      const ticketOrdersRef2 = collection(db2, "ticketorders");
      const q2 = query(ticketOrdersRef2, where("token", "==", token));
      querySnapshot = await getDocs(q2);
      useSecondDB = true;

      // If not found in either database, return error
      if (querySnapshot.empty) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    // Get the document reference and data
    const docRef = querySnapshot.docs[0].ref;
    const docData = querySnapshot.docs[0].data();

    // Check if the user is already verified
    if (docData.arrived) {
      return NextResponse.json({
        message: "User already verified!",
        alreadyArrived: true,
        database: useSecondDB ? "db2" : "db1"
      }, { status: 200 });
    }

    // Update the document to mark the user as arrived
    await updateDoc(docRef, {
      arrived: true,
    });

    return NextResponse.json({
      message: "User verified successfully!",
      alreadyArrived: false,
      database: useSecondDB ? "db2" : "db1"
    }, { status: 200 });
  } catch (error) {
    console.error("Error verifying arrival:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}