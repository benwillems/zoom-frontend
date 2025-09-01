import React, { useState } from "react";

const MicrosoftUserDetailsModal = ({ isOpen, onClose, userData }) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  if (!isOpen) return null;

  // Function to format tokens for display (showing only first/last few characters)
  const formatToken = (token) => {
    if (!token) return "N/A";
    if (!showSensitiveData) {
      return (
        token.substring(0, 10) + "..." + token.substring(token.length - 10)
      );
    }
    return token;
  };

  // Format expiration date
  const formatExpiresAt = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Handle clicks on the modal background to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="#00a4ef"
          >
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-800">
            Microsoft Account Connected
          </h3>
          <div className="bg-green-50 p-2 rounded-lg inline-flex items-center mt-2">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium text-green-800">
              Calendar Successfully Connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Basic Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 text-lg">
              Basic Info
            </h4>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-gray-800">
                  {userData.userId || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800">
                  {userData.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">
                  {userData.email || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 text-lg">
              Account Info
            </h4>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium text-gray-800">
                  {userData.provider || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium text-gray-800">
                  {userData.type || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Provider Account ID</p>
                <p className="font-medium text-gray-800">
                  {userData.providerAccountId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Info Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800 text-lg">
              Authorization Details
            </h4>
            <button
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              type="button"
            >
              {showSensitiveData ? "Hide" : "Show"} Full Tokens
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Access Token</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {formatToken(userData.access_token)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Refresh Token</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {formatToken(userData.refresh_token)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">ID Token</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {formatToken(userData.id_token)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Token Type</p>
              <p className="font-medium text-gray-800">
                {userData.token_type || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Expires At</p>
              <p className="font-medium text-gray-800">
                {formatExpiresAt(userData.expires_at)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Session State</p>
              <p className="font-medium text-gray-800">
                {userData.session_state || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Scope Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 text-lg">
            Permissions
          </h4>
          <p className="text-sm text-gray-500">Scope</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded">
            {userData.scope ? userData.scope.split(" ").join(", ") : "N/A"}
          </p>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full mt-2 px-5 py-3 
                    bg-blue-500 hover:bg-blue-600 text-white font-medium
                    rounded-lg shadow-md transition-all duration-300"
        >
          Continue to Calendar
        </button>
      </div>
    </div>
  );
};

export default MicrosoftUserDetailsModal;
