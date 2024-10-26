import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'tokens.txt');
    
    // Read existing tokens
    let existingTokens = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      existingTokens = fileContent.split('\n').filter(t => t.trim());
    } catch (err) {
      // File doesn't exist yet, that's ok
      if (err.code !== 'ENOENT') {
        console.error('Error reading file:', err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    // Check if token already exists
    if (existingTokens.includes(token)) {
      return NextResponse.json({
        message: "User already verified!",
        alreadyArrived: true,
      }, { status: 200 });
    }

    // Append new token to file
    await fs.appendFile(filePath, token + '\n');

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