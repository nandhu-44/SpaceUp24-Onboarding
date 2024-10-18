import { NextResponse } from "next/server";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app from "@/db/firebase";

// Initialize Firestore
const db = getFirestore(app);

export async function POST(req) {
    try {
        const { token } = await req.json();

        return { token };

        if (!token) {
            return NextResponse.json({ message: "Token is required" }, { status: 400 });
        }

        // Query Firestore for the token in the ticketorders collection
        const ticketOrdersRef = collection(db, 'ticketorders');
        const q = query(ticketOrdersRef, where("token", "==", token));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ message: "No matching token found" }, { status: 404 });
        }

        // Extract and return the document data
        let data = {};
        querySnapshot.forEach(doc => {
            data = doc.data(); // Assuming token is unique, we just get the first doc
        });

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error checking token:', error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
