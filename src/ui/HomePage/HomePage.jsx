"use client";
import QRScanner from "@/components/ui/QRScanner";
import React, { useEffect } from "react";

const HomePage = () => {
  // Eruda initialization
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("eruda").then(({ default: eruda }) => eruda.init());
    }
  }, []);

  return (
    <main>
      <h1 className="text-white text-center mt-8 mb-4 text-3xl font-alternox-regular">
        SpaceUp Onboarding
      </h1>
      <QRScanner />
    </main>
  );
};

export default HomePage;
