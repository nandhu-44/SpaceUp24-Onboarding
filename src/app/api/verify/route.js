import { NextResponse } from 'next/server';
import { db } from '@/db/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const ticketOrdersRef = collection(db, 'ticketorders');
        const q = query(ticketOrdersRef, where('token', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get the document reference and data
        const docRef = querySnapshot.docs[0].ref;
        const docData = querySnapshot.docs[0].data();

        // Check if the user is already verified
        if (docData.arrived) {
            return NextResponse.json({
                message: 'User already verified!',
                alreadyArrived: true
            }, { status: 200 });
        }

        // Update the document to mark the user as arrived
        await updateDoc(docRef, {
            arrived: true
        });

        return NextResponse.json({
            message: 'User verified successfully!',
            alreadyArrived: false
        }, { status: 200 });

    } catch (error) {
        console.error('Error verifying arrival:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}