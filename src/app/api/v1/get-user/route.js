import { NextResponse } from "next/server";
import csv from "csv-parser";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Extract the token from the URL search params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Fetch from Remote CSV File
    const response = await fetch(process.env.CSV_DATA_URL);
    const csvData = await response.text();

    // Parse CSV data
    const users = [];
    await new Promise((resolve, reject) => {
      const stream = csv();
      stream.on("data", (data) => {
        users.push(data);
      });
      stream.on("end", resolve);
      stream.on("error", reject);
      stream.write(csvData);
      stream.end();
    });

    const user = users.find((user) => user.token === token);

    if (!user) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 404 });
    }

    const price = user.price || (!user?.referralCode ? "399" : "359.1");

    return NextResponse.json({
      message: "User found successfully",
      data: {
        name: user.name,
        email: user.email,
        college: user.college,
        phone: user.phone,
        workshop: user.workshop,
        arrived: user.arrived === "true",
        suspicious: user.suspicious === "true",
        price: price,
        year: user.year,
        referralCode: user.referralCode,
        paymentScreenshot: user.paymentScreenshot,
        token: user.token,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error getting user data:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
