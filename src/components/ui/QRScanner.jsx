import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useZxing } from "react-zxing";
import UserData from "@/components/ui/UserData";

const QRScanner = () => {
  const [result, setResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [userData, setUserData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  const { ref, pause } = useZxing({
    onDecodeResult(result) {
      if (isScanning) {
        const scannedText = result.getText();
        setResult(scannedText);
        setIsScanning(false);
        handleScan(scannedText);
        setIsPaused(true);
        pause();
      }
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
  }, []);

  useEffect(() => {
    if (ref.current) {
      videoRef.current = ref.current;
    }
  }, [ref]);

  const handleScan = async (data) => {
    setIsLoading(true);
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
      } else {
        setError("No token found in QR code data");
      }
    } catch (error) {
      setError("Invalid QR code data");
    } finally {
      setIsLoading(false);
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
    resetScanner();
  };

  const resetScanner = () => {
    setIsScanning(true);
    setResult("");
    setUserData(null);
    setVerificationStatus(null);
    setError("");
    setIsLoading(false);
    setIsPaused(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {cameras.length > 0 && (
        <select
          value={selectedCamera}
          onChange={handleCameraChange}
          className="mb-4 p-2 border rounded bg-slate-800 border-white focus:ring-0 text-white font-alternox-regular text-sm w-full"
        >
          {cameras.map((camera) => (
            <option
              key={camera.deviceId}
              value={camera.deviceId}
              className="bg-slate-800"
            >
              {camera.label || `Camera ${camera.deviceId}`}
            </option>
          ))}
        </select>
      )}

      {/* Scanner */}
      <div className="relative aspect-square mb-4">
        <video
          ref={ref}
          className={`w-full h-full object-cover rounded-sm ${
            isPaused ? "hidden" : ""
          }`}
        />
        {isPaused && videoRef.current && (
          <canvas
            ref={(canvas) => {
              if (canvas && videoRef.current) {
                const context = canvas.getContext("2d");
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(
                  videoRef.current,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
              }
            }}
            className="w-full h-full object-cover rounded-sm"
          />
        )}
        <div className="absolute inset-0 flex items-center font-bold justify-center">
          <Image
            src="/qr-frame.svg"
            alt="QR Frame"
            width={280}
            height={280}
            priority
          />
        </div>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-alternox-bold text-sm text-red-500 mb-4">{error}</p>
      )}

      {/* User Data */}
      {userData && (
        <UserData
          userData={userData}
          verificationStatus={verificationStatus}
          handleVerify={handleVerify}
        />
      )}

      {/* Continue scanning */}
      {!isScanning && !isLoading && (
        <button
          onClick={resetScanner}
          className="bg-slate-800 font-alternox-regular text-sm text-white px-4 py-2 rounded w-full"
        >
          Continue Scanning
        </button>
      )}
    </div>
  );
};

export default QRScanner;
