"use client";
import React, { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import eruda from "eruda";

const QRScanner = () => {
  const [result, setResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [userData, setUserData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
      setIsScanning(false);
    },
    constraints: {
      video: { deviceId: selectedCamera },
    },
  });

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
        setError(
          "Failed to access cameras. Please ensure you have granted camera permissions."
        );
      }
    };

    getCameras();
    if (typeof window !== "undefined") {
      // eruda?.init();
    }
  }, []);

  useEffect(() => {
    if (result) {
      handleScan(result);
    }
  }, [result]);

  const handleScan = async (data) => {
    try {
      const scannedData = JSON.parse(data);
      if (scannedData.token) {
        const response = await fetch(
          `/api/get-user?token=${encodeURIComponent(scannedData.token)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const userData = await response.json();
        if (response.ok) {
          setUserData(userData.data);
        } else {
          setError(userData.error || "Failed to get user data");
        }
      }
    } catch (error) {
      console.log("Error parsing QR code data:", error);
      setError("Invalid QR code data");
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: JSON.parse(result).token }),
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationStatus({
          message: data.message,
          alreadyArrived: data.alreadyArrived,
          success: true,
        });
      } else {
        setVerificationStatus({
          message: data.error || "Failed to verify user",
          success: false,
        });
      }
    } catch (error) {
      setVerificationStatus({
        message: "Failed to verify user",
        success: false,
      });
    }
  };

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
    setIsScanning(true);
    setResult("");
    setUserData(null);
    setVerificationStatus(null);
    setError("");
  };

  const resetScanner = () => {
    setIsScanning(true);
    setResult("");
    setUserData(null);
    setVerificationStatus(null);
    setError("");
  };

  const getStatusColor = () => {
    if (!verificationStatus) return "";
    if (verificationStatus.alreadyArrived)
      return "bg-yellow-100 text-yellow-700";
    return verificationStatus.success
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
      {cameras.length > 0 && (
        <select
          value={selectedCamera}
          onChange={handleCameraChange}
          className="mb-4 p-2 border rounded w-full"
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${camera.deviceId}`}
            </option>
          ))}
        </select>
      )}
      <div className="relative aspect-square mb-4">
        {isScanning && (
          <video ref={ref} className="w-full h-full object-cover" />
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {userData && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">{userData.name}</h2>
          <p>Email: {userData.email}</p>
          <p>College: {userData.college}</p>
          <p>Phone: {userData.phone}</p>
          {!verificationStatus && (
            <button
              onClick={handleVerify}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Verify
            </button>
          )}
        </div>
      )}
      {verificationStatus && (
        <div className={`p-4 rounded mb-4 ${getStatusColor()}`}>
          <p className="font-semibold">{verificationStatus.message}</p>
        </div>
      )}
      {!isScanning && (
        <button
          onClick={resetScanner}
          className="bg-gray-500 text-white px-4 py-2 rounded w-full"
        >
          Scan Another QR Code
        </button>
      )}
    </div>
  );
};

export default QRScanner;
