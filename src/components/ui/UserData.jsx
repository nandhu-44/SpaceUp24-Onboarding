import Image from "next/image";
import { useState } from "react";
import UserField from "./UserField";

const UserData = ({ userData, verificationStatus, handleVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFields, setShowFields] = useState(true);
  const [isSuspiciousButton, setIsSuspicious] = useState(userData?.suspicious);
  const [paymentSSVisible, setPaymentSSVisible] = useState(false);

  const getStatusColor = () => {
    if (!verificationStatus) return "";
    if (verificationStatus.alreadyArrived) {
      return "bg-yellow-200 text-yellow-700";
    }
    return verificationStatus.success
      ? "bg-green-200 text-green-700"
      : "bg-red-200 text-red-700";
  };

  const handleVerificationClick = () => {
    setIsVerifying(true);
    setShowFields(false);
    handleVerify();
  };

  // Define fields array outside of JSX
  const fields = [
    { label: "Email", value: userData.email },
    { label: "Phone", value: userData.phone },
    { label: "Price", value: userData.price },
    { label: "Year", value: userData.year },
    { label: "Referral Code", value: userData?.referralCode || "None" },
    { label: "Token", value: userData.token },
    { label: "Workshop", value: userData.workshop },
    { label: "College", value: userData.college },
  ];

  return (
    <div
      className={`${
        userData?.suspicious ? "bg-red-300" : "bg-gray-100"
      } font-alternox-regular mb-4 rounded-lg p-6 shadow-lg`}
    >
      <h2 className="mb-4 flex items-center justify-center text-center text-2xl font-semibold text-gray-800">
        {userData.name}
      </h2>

      {showFields && (
        <div className="space-y-3">
          {userData?.suspicious && (
            <p className="my-4 text-2xl font-bold text-red-600">
              This participant is marked as suspicious. Please verify the
              payment before allowing entry!
            </p>
          )}

          {/* Render each field */}
          {fields.map(({ label, value }) => (
            <UserField key={label} label={label} value={value} />
          ))}

          {/* Payment Screenshot */}
          {userData?.paymentScreenshot
            ? (
              <>
                <button
                  onClick={() => setPaymentSSVisible(!paymentSSVisible)}
                  className={`my-4 w-full rounded px-4 py-2 text-white transition-colors duration-300 ${
                    paymentSSVisible ? "bg-red-500" : "bg-amber-500"
                  }`}
                >
                  {paymentSSVisible ? "Hide" : "Show"} Payment Screenshot
                </button>
                <div
                  className={`my-2 flex justify-center transition-all duration-700 ease-in-out ${
                    paymentSSVisible
                      ? "max-h-[600px] opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  {paymentSSVisible && (
                    <Image
                      src={userData.paymentScreenshot}
                      alt="Payment Screenshot"
                      width={400}
                      height={400}
                      priority
                      loading="eager"
                      className="rounded-lg shadow-md transition-transform duration-700 ease-in-out transform"
                      style={{
                        transform: paymentSSVisible ? "scale(1)" : "scale(0.9)",
                      }}
                    />
                  )}
                </div>
              </>
            )
            : (
              <p className="my-2 pb-4 text-center text-lg font-bold text-red-600">
                No payment screenshot available!
              </p>
            )}
        </div>
      )}

      {/* Verification Button */}
      {!verificationStatus && !isVerifying && !isSuspiciousButton && (
        <button
          onClick={handleVerificationClick}
          className="mt-2 w-full rounded bg-blue-500 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-600"
        >
          Verify
        </button>
      )}

      {/* Continue Verify Button */}
      {!verificationStatus && !isVerifying && isSuspiciousButton && (
        <button
          onClick={() => setIsSuspicious(false)}
          className="mt-2 w-full rounded bg-red-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-red-800"
        >
          Continue to Verify
        </button>
      )}

      {/* Show loading animation when verifying */}
      {isVerifying && !verificationStatus && (
        <div className="mt-4 flex justify-center">
          <div className="loader h-12 w-12 rounded-full border-8 border-t-8 border-gray-200 ease-linear">
          </div>
        </div>
      )}

      {/* Verification Status */}
      {verificationStatus && (
        <div className={`mt-4 rounded p-4 ${getStatusColor()}`}>
          <p className="font-alternox-regular text-base">
            {verificationStatus.message}
          </p>
        </div>
      )}

      {/* Loader CSS */}
      <style jsx>
        {`
          .loader {
            border-top-color: #3498db;
            -webkit-animation: spin 1s ease-in-out infinite;
            animation: spin 1s ease-in-out infinite;
          }

          @-webkit-keyframes spin {
            0% {
              -webkit-transform: rotate(0deg);
            }
            100% {
              -webkit-transform: rotate(360deg);
            }
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default UserData;
