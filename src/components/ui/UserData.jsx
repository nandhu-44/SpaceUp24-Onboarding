import { useState } from "react";

const UserData = ({ userData, verificationStatus, handleVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFields, setShowFields] = useState(true);

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

  return (
    <div className="bg-gray-100 p-4 rounded mb-4 font-alternox-regular">
      <h2 className="text-xl font-semibold mb-2 text-center">
        {userData.name}
      </h2>

      {showFields && (
        <>
          <p className="font-bold">
            Email:{" "}
            <span className="font-normal text-blue-700">{userData.email}</span>
          </p>
          <p className="font-bold">
            Phone:{" "}
            <span className="font-normal text-blue-700">{userData.phone}</span>
          </p>
          <p className="font-bold">
            College:{" "}
            <span className="font-normal text-blue-700">
              {userData.college}
            </span>
          </p>
        </>
      )}

      {/* Verification Button */}
      {!verificationStatus && !isVerifying && (
        <button
          onClick={handleVerificationClick}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Verify
        </button>
      )}

      {/* Show loading animation when verifying */}
      {isVerifying && !verificationStatus && (
        <div className="mt-4 flex justify-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12">
          </div>
        </div>
      )}

      {/* Verification Status */}
      {verificationStatus && (
        <div className={`p-4 rounded mt-4 ${getStatusColor()}`}>
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
