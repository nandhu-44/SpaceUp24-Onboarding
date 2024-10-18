"use client";

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const QRCodeScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedToken, setScannedToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Error accessing camera: ' + err.message);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const scanQRCode = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          try {
            const ticketData = JSON.parse(code.data);
            if (ticketData.token) {
              setScannedToken(ticketData.token);
              console.log('Scanned token:', ticketData.token);
            } else {
              setError('Invalid QR code: Missing token');
            }
          } catch (err) {
            setError('Invalid QR code: Unable to parse JSON');
          }
        }
      }
    }

    requestAnimationFrame(scanQRCode);
  };

  useEffect(() => {
    const scanInterval = requestAnimationFrame(scanQRCode);
    return () => cancelAnimationFrame(scanInterval);
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">QR Code Ticket Scanner</h1>
      <div className="mb-4 relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {scannedToken && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Token scanned: {scannedToken}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default QRCodeScanner;