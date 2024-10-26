import { NextResponse } from "next/server";
import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // Your Google Sheet ID
const RANGE = 'Sheet1!A:A'; // Assuming tokens are in column A

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Check if token already exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const existingTokens = response.data.values?.flat() || [];
    
    if (existingTokens.includes(token)) {
      return NextResponse.json({
        message: "User already verified!",
        alreadyArrived: true,
      }, { status: 200 });
    }

    // Append new token to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[token]]
      },
    });

    return NextResponse.json({
      message: "User verified successfully!",
      alreadyArrived: false,
    }, { status: 200 });

  } catch (error) {
    console.error("Error verifying arrival:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}