import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
    onDecodeResult: (result) => {
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
    paused: isPaused,
  });

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );
        setCameras(videoDevices);

        const savedCameraId = localStorage.getItem("selectedCameraId");
        if (
          savedCameraId &&
          videoDevices.some((device) => device.deviceId === savedCameraId)
        ) {
          setSelectedCamera(savedCameraId);
        } else if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
        setError(
          "Failed to access cameras. Please ensure you have granted camera permissions.",
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
      const scannedData = data;
      if (scannedData) {
        const response = await fetch(
          `/api/v1/get-user?token=${encodeURIComponent(scannedData)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
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
      console.log(result)
      const response = await fetch("/api/v0/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result }),
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
      console.log(error)
      setVerificationStatus({
        message: "Failed to verify user",
        success: false,
      });
    }
  };

  const handleCameraChange = (e) => {
    const selectedDeviceId = e.target.value;
    setSelectedCamera(selectedDeviceId);
    localStorage.setItem("selectedCameraId", selectedDeviceId);
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
    <div className="mx-auto max-w-md p-4">
      {cameras.length > 0 && (
        <select
          value={selectedCamera}
          onChange={(e) => handleCameraChange(e)}
          className="font-alternox-regular mb-4 w-full rounded border border-white bg-slate-800 p-2 text-sm text-white hover:cursor-pointer focus:ring-0"
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
      <div className="relative mb-4 aspect-square">
        <video
          ref={ref}
          className={`h-full w-full rounded-sm object-cover ${
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
                  canvas.height,
                );
              }
            }}
            className="h-full w-full rounded-sm object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center font-bold">
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
        <div className="my-10 flex items-center justify-center">
          <div className="h-20 w-20 animate-spin rounded-full border-8 border-blue-500 border-b-black">
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-alternox-bold mb-4 text-sm text-red-500">{error}</p>
      )}

      {/* User Data */}
      {userData && (
        <UserData
          userData={userData}
          verificationStatus={verificationStatus}
          handleVerify={() => handleVerify()}
        />
      )}

      {/* Continue scanning */}
      {!isScanning && !isLoading && (
        <button
          onClick={() => resetScanner()}
          className="font-alternox-regular mb-12 w-full rounded bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-600 px-4 py-2 text-sm text-white"
        >
          Continue Scanning
        </button>
      )}
    </div>
  );
};

export default QRScanner;
