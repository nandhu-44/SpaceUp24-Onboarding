import { NextResponse } from 'next/server';
import { db } from '@/db/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Extract the token from the URL search params
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const ticketOrdersRef = collection(db, 'ticketorders');
        const q = query(ticketOrdersRef, where('token', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Token is valid, get the first matching document
        const docData = querySnapshot.docs[0].data();

        // Return relevant information
        return NextResponse.json({
            message: 'User found successfully',
            data: {
                name: docData.name,
                email: docData.email,
                college: docData.college,
                phone: docData.phone,
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error getting user data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}