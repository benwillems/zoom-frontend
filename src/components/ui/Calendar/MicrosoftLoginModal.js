// import React, { useState, useEffect } from "react";

// const MicrosoftLoginModal = ({ isOpen, onClose }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [userName, setUserName] = useState("");
//   const [userEmail, setUserEmail] = useState("");

//   // Check if Microsoft is already connected when the modal opens
//   useEffect(() => {
//     if (isOpen) {
//       // Read cookies to check for Microsoft connection status
//       const cookies = document.cookie.split(";").reduce((acc, cookie) => {
//         const [key, value] = cookie.trim().split("=");
//         acc[key] = value;
//         return acc;
//       }, {});

//       setIsConnected(cookies.ms_connected === "true");

//       if (cookies.ms_user_name) {
//         setUserName(decodeURIComponent(cookies.ms_user_name || ""));
//       }

//       if (cookies.ms_user_email) {
//         setUserEmail(decodeURIComponent(cookies.ms_user_email || ""));
//       }
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleMicrosoftLogin = () => {
//     // Microsoft OAuth login flow with the provided credentials
//     const clientId = "b77fd4ce-657c-4521-a11a-64e67f282847";
//     const tenantId = "5be7ff45-a617-4ad9-9102-3b150853301a";
//     const redirectUri = "http://localhost:3000/api/auth/callback/azure-ad";

//     // Scopes needed for calendar access
//     const scopes = [
//       "openid",
//       "profile",
//       "email",
//       "offline_access",
//       "Calendars.Read",
//       "Calendars.ReadWrite",
//     ].join(" ");

//     // Construct the authorization URL
//     const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
//       redirectUri
//     )}&scope=${encodeURIComponent(scopes)}&response_mode=query`;
//     // Open Microsoft login in a popup window instead of redirecting
//     const popup = window.open(
//       authUrl,
//       "microsoftLogin",
//       "width=600,height=700,scrollbars=yes"
//     ); // Listen for the custom event when Microsoft authentication is successful
//     const handleAuthSuccess = () => {
//       // Read cookies to update connection status
//       const cookies = document.cookie.split(";").reduce((acc, cookie) => {
//         const [key, value] = cookie.trim().split("=");
//         acc[key] = value;
//         return acc;
//       }, {});

//       setIsConnected(cookies.ms_connected === "true");

//       if (cookies.ms_user_name) {
//         setUserName(decodeURIComponent(cookies.ms_user_name || ""));
//       }

//       if (cookies.ms_user_email) {
//         setUserEmail(decodeURIComponent(cookies.ms_user_email || ""));
//       }

//       // Show success message
//       alert("Microsoft connection successful! Your calendar is now linked.");

//       // Trigger UI refresh to update connection status (like the checkmark)
//       document.dispatchEvent(new CustomEvent("microsoft-auth-success"));
//     };

//     // Add event listener for the custom event
//     document.addEventListener("microsoft-auth-success", handleAuthSuccess, {
//       once: true,
//     });
//     // Also listen for message event (as a fallback)
//     window.addEventListener("message", function handleAuthMessage(event) {
//       if (event.data === "microsoft-auth-success") {
//         // Show success message
//         alert("Microsoft connection successful! Your calendar is now linked.");

//         // Close the modal
//         onClose();

//         // Trigger refresh of connection status
//         document.dispatchEvent(new CustomEvent("microsoft-auth-success"));

//         // Remove the message event listener (only once)
//         window.removeEventListener("message", handleAuthMessage);
//       }
//     });
//   };
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>

//         <div className="text-center mb-6">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-16 h-16 mx-auto mb-4"
//             viewBox="0 0 24 24"
//             fill="#00a4ef"
//           >
//             <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
//           </svg>
//           <h3 className="text-2xl font-bold text-gray-800">
//             {isConnected
//               ? "Microsoft Account Connected"
//               : "Connect with Microsoft"}
//           </h3>
//           <p className="text-gray-600 mt-2">
//             {isConnected
//               ? "Your Microsoft calendar is linked and synced"
//               : "Link your Microsoft Outlook calendar to sync your appointments"}
//           </p>
//         </div>

//         {isConnected ? (
//           <div className="space-y-4">
//           {userName && (
//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
//                 <div className="bg-blue-100 rounded-full p-2 mr-3">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Name</p>
//                   <p className="font-medium text-gray-800">{userName}</p>
//                 </div>
//               </div>
//             )}

//             {userEmail && (
//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
//                 <div className="bg-blue-100 rounded-full p-2 mr-3">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Email</p>
//                   <p className="font-medium text-gray-800">{userEmail}</p>
//                 </div>
//               </div>
//             )}

//             <div className="bg-green-50 p-4 rounded-lg">
//               <p className="font-medium text-green-800 flex items-center">
//                 <svg
//                   className="w-5 h-5 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//                 Calendar Successfully Connected
//               </p>
//             </div>
//             <button
//               onClick={handleMicrosoftLogin}
//               className="flex items-center justify-center gap-2 px-5 py-3
//                         bg-blue-500 hover:bg-blue-600 text-white font-medium
//                         rounded-lg shadow-md transition-all duration-300"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-6 h-6"
//                 viewBox="0 0 24 24"
//                 fill="white"
//               >
//                 <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
//               </svg>
//               Login with Microsoft
//             </button>
//           </div>
//         ) : (
//           <div className="flex flex-col space-y-4">
//             <button
//               onClick={handleMicrosoftLogin}
//               className="flex items-center justify-center gap-2 px-5 py-3
//                         bg-blue-500 hover:bg-blue-600 text-white font-medium
//                         rounded-lg shadow-md transition-all duration-300"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-6 h-6"
//                 viewBox="0 0 24 24"
//                 fill="white"
//               >
//                 <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
//               </svg>
//               Login with Microsoft
//             </button>

//             <div className="text-center text-sm text-gray-600 mt-4">
//               <p>
//                 By connecting, you allow the app to access your Microsoft
//                 calendar data according to our privacy policy
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MicrosoftLoginModal;







// import React, { useState, useEffect } from "react";

// const MicrosoftLoginModal = ({ isOpen, onClose }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [userName, setUserName] = useState("");
//   const [userEmail, setUserEmail] = useState("");

//   // Check if Microsoft is already connected when the modal opens
//   useEffect(() => {
//     if (isOpen) {
//       // Read cookies to check for Microsoft connection status
//       const cookies = document.cookie.split(";").reduce((acc, cookie) => {
//         const [key, value] = cookie.trim().split("=");
//         acc[key] = value;
//         return acc;
//       }, {});

//       setIsConnected(cookies.ms_connected === "true");

//       if (cookies.ms_user_name) {
//         setUserName(decodeURIComponent(cookies.ms_user_name || ""));
//       }

//       if (cookies.ms_user_email) {
//         setUserEmail(decodeURIComponent(cookies.ms_user_email || ""));
//       }
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleMicrosoftLogin = () => {
//     // Microsoft OAuth login flow with the provided credentials
//     const clientId = "b77fd4ce-657c-4521-a11a-64e67f282847";
//     const tenantId = "5be7ff45-a617-4ad9-9102-3b150853301a";
//     const redirectUri = "http://localhost:3000/api/auth/callback/azure-ad";

//     // Scopes needed for calendar access
//     const scopes = [
//       "openid",
//       "profile",
//       "email",
//       "offline_access",
//       "Calendars.Read",
//       "Calendars.ReadWrite",
//     ].join(" ");

//     // Construct the authorization URL
//     const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
//       redirectUri
//     )}&scope=${encodeURIComponent(scopes)}&response_mode=query`;
//     // Open Microsoft login in a popup window instead of redirecting
//     const popup = window.open(
//       authUrl,
//       "microsoftLogin",
//       "width=600,height=700,scrollbars=yes"
//     ); // Listen for the custom event when Microsoft authentication is successful
//     const handleAuthSuccess = () => {
//       // Read cookies to update connection status
//       const cookies = document.cookie.split(";").reduce((acc, cookie) => {
//         const [key, value] = cookie.trim().split("=");
//         acc[key] = value;
//         return acc;
//       }, {});

//       setIsConnected(cookies.ms_connected === "true");

//       if (cookies.ms_user_name) {
//         setUserName(decodeURIComponent(cookies.ms_user_name || ""));
//       }

//       if (cookies.ms_user_email) {
//         setUserEmail(decodeURIComponent(cookies.ms_user_email || ""));
//       }

//       // Show success message
//       alert("Microsoft connection successful! Your calendar is now linked.");

//       // Trigger UI refresh to update connection status (like the checkmark)
//       document.dispatchEvent(new CustomEvent("microsoft-auth-success"));
//     };

//     // Add event listener for the custom event
//     document.addEventListener("microsoft-auth-success", handleAuthSuccess, {
//       once: true,
//     });
//     // Also listen for message event (as a fallback)
//     window.addEventListener("message", function handleAuthMessage(event) {
//       if (event.data === "microsoft-auth-success") {
//         // Show success message
//         alert("Microsoft connection successful! Your calendar is now linked.");

//         // Close the modal
//         onClose();

//         // Trigger refresh of connection status
//         document.dispatchEvent(new CustomEvent("microsoft-auth-success"));

//         // Remove the message event listener (only once)
//         window.removeEventListener("message", handleAuthMessage);
//       }
//     });
//   };
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative border border-gray-200">
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>

//         {isConnected ? (
//           <div className="text-center mb-6">
//             <div className="flex items-center justify-center mb-2">
//               <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="w-12 h-12"
//                   viewBox="0 0 24 24"
//                   fill="#00a4ef"
//                 >
//                   <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
//                 </svg>
//               </div>
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800">
//               Microsoft Account Connected
//             </h3>
//             <div className="inline-flex items-center justify-center mt-2 mb-2">
//               <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
//                 <svg
//                   className="w-4 h-4 mr-1"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//                 Connected
//               </span>
//             </div>
//             <p className="text-gray-600">
//               Your Microsoft calendar is linked and synced
//             </p>
//           </div>
//         ) : (
//           <div className="text-center mb-6">
//             <div className="h-20 w-20 rounded-full mx-auto bg-blue-50 flex items-center justify-center mb-4">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-12 h-12"
//                 viewBox="0 0 24 24"
//                 fill="#00a4ef"
//               >
//                 <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
//               </svg>
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800">
//               Connect with Microsoft
//             </h3>
//             <p className="text-gray-600 mt-2">
//               Link your Microsoft Outlook calendar to sync your appointments
//             </p>
//           </div>
//         )}

//         {isConnected ? (
//           <div className="space-y-4">
//             {userName && (
//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
//                 <div className="bg-blue-100 rounded-full p-2 mr-3">
//                   <svg
//                     className="w-5 h-5 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                     ></path>
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Name</p>
//                   <p className="font-medium text-gray-800">{userName}</p>
//                 </div>
//               </div>
//             )}

//             {userEmail && (
//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
//                 <div className="bg-blue-100 rounded-full p-2 mr-3">
//                   <svg
//                     className="w-5 h-5 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                     ></path>
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Email</p>
//                   <p className="font-medium text-gray-800">{userEmail}</p>
//                 </div>
//               </div>
//             )}

//             <div className="bg-green-50 p-4 rounded-lg border border-green-100">
//               <p className="font-medium text-green-800 flex items-center">
//                 <svg
//                   className="w-5 h-5 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//                 Calendar Successfully Connected
//               </p>
//               <p className="text-sm text-green-700 mt-1">
//                 Your appointments will now sync automatically
//               </p>
//             </div>

//             <div className="flex space-x-3 mt-6">
//               <button
//                 onClick={onClose}
//                 className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={handleMicrosoftLogin}
//                 className="flex-1 items-center justify-center gap-2 py-3 px-4 
//                           bg-blue-500 hover:bg-blue-600 text-white font-medium
//                           rounded-lg shadow-md transition-all duration-300"
//               >
//                 Reconnect
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col space-y-4">
//             <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
//               <h4 className="font-medium text-blue-800 mb-2">
//                 Benefits of connecting
//               </h4>
//               <ul className="text-sm text-blue-700 space-y-1">
//                 <li className="flex items-start">
//                   <svg
//                     className="w-4 h-4 mr-2 mt-0.5 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M5 13l4 4L19 7"
//                     ></path>
//                   </svg>
//                   Sync all your appointments automatically
//                 </li>
//                 <li className="flex items-start">
//                   <svg
//                     className="w-4 h-4 mr-2 mt-0.5 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M5 13l4 4L19 7"
//                     ></path>
//                   </svg>
//                   Get reminders for upcoming sessions
//                 </li>
//                 <li className="flex items-start">
//                   <svg
//                     className="w-4 h-4 mr-2 mt-0.5 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M5 13l4 4L19 7"
//                     ></path>
//                   </svg>
//                   Manage your schedule in one place
//                 </li>
//               </ul>
//             </div>

//             <button
//               onClick={handleMicrosoftLogin}
//               className="flex items-center justify-center gap-2 px-5 py-3.5 
//                         bg-blue-600 hover:bg-blue-700 text-white font-medium
//                         rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-6 h-6"
//                 viewBox="0 0 24 24"
//                 fill="white"
//               >
//                 <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
//               </svg>
//               <span>Login with Microsoft</span>
//             </button>

//             <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
//               <p className="flex items-center justify-center">
//                 <svg
//                   className="w-4 h-4 mr-1.5 text-gray-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   ></path>
//                 </svg>
//                 By connecting, you allow access to your Microsoft calendar data
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MicrosoftLoginModal;





import React, { useState, useEffect } from "react";

const MicrosoftLoginModal = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Check if Microsoft is already connected when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Read cookies to check for Microsoft connection status
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {});

      setIsConnected(cookies.ms_connected === "true");

      if (cookies.ms_user_name) {
        setUserName(decodeURIComponent(cookies.ms_user_name || ""));
      }

      if (cookies.ms_user_email) {
        setUserEmail(decodeURIComponent(cookies.ms_user_email || ""));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMicrosoftLogin = () => {
    // Microsoft OAuth login flow with the provided credentials
    const clientId = 'c66a1f57-23fd-4fa6-be9d-946ef93b9040'
    const clientSecret = 'ebi8Q~w6jhpkDwx0NXeWlb0BkGG_vQdsDbZk8cyP'
    const tenantId = '8491fcf5-dbbb-471c-bdee-90beb53dfc6a'
    const redirectUri = "https://nutrizoom.myvetassist.com/api/auth/callback/azure-ad"

    // Scopes needed for calendar access
    const scopes = [
      "openid",
      "profile",
      "email",
      "offline_access",
      "Calendars.Read",
      "Calendars.ReadWrite",
    ].join(" ");

    // Construct the authorization URL
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}&response_mode=query`;
    // Open Microsoft login in a popup window instead of redirecting
    const popup = window.open(
      authUrl,
      "microsoftLogin",
      "width=600,height=700,scrollbars=yes"
    ); // Listen for the custom event when Microsoft authentication is successful
    const handleAuthSuccess = () => {
      // Read cookies to update connection status
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {});

      setIsConnected(cookies.ms_connected === "true");

      if (cookies.ms_user_name) {
        setUserName(decodeURIComponent(cookies.ms_user_name || ""));
      }

      if (cookies.ms_user_email) {
        setUserEmail(decodeURIComponent(cookies.ms_user_email || ""));
      }

      // Show success message
      alert("Microsoft connection successful! Your calendar is now linked.");

      // Trigger UI refresh to update connection status (like the checkmark)
      document.dispatchEvent(new CustomEvent("microsoft-auth-success"));
    };

    // Add event listener for the custom event
    document.addEventListener("microsoft-auth-success", handleAuthSuccess, {
      once: true,
    });
    // Also listen for message event (as a fallback)
    window.addEventListener("message", function handleAuthMessage(event) {
      if (event.data === "microsoft-auth-success") {
        // Show success message
        alert("Microsoft connection successful! Your calendar is now linked.");

        // Close the modal
        onClose();

        // Trigger refresh of connection status
        document.dispatchEvent(new CustomEvent("microsoft-auth-success"));

        // Remove the message event listener (only once)
        window.removeEventListener("message", handleAuthMessage);
      }
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative border border-gray-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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

        {isConnected ? (
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="#00a4ef"
                >
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Microsoft Account Connected
            </h3>
            <div className="inline-flex items-center justify-center mt-1 mb-1">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
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
                Connected
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center mb-4">
            <div className="h-16 w-16 rounded-full mx-auto bg-blue-50 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="#00a4ef"
              >
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Connect with Microsoft
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Link your Microsoft calendar to sync appointments
            </p>
          </div>
        )}

        {isConnected ? (
          <div className="space-y-3">
            {userName && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center text-sm">
                <div className="bg-blue-100 rounded-full p-1.5 mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{userName}</p>
                </div>
              </div>
            )}

            {userEmail && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center text-sm">
                <div className="bg-blue-100 rounded-full p-1.5 mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-800 text-sm">{userEmail}</p>
                </div>
              </div>
            )}

            <div className="bg-green-50 p-2.5 rounded-md border border-green-100">
              <p className="text-sm font-medium text-green-800 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
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
                Calendar Successfully Connected
              </p>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleMicrosoftLogin}
                className="flex-1 items-center justify-center py-2 px-3 
                          bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium
                          rounded-md shadow-sm transition-all duration-300"
              >
                Reconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <h4 className="font-medium text-blue-800 text-sm mb-1.5">
                Benefits of connecting
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-start">
                  <svg
                    className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Sync appointments automatically
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Get reminders for sessions
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Manage schedule in one place
                </li>
              </ul>
            </div>

            <button
              onClick={handleMicrosoftLogin}
              className="flex items-center justify-center gap-2 px-5 py-2.5
                        bg-blue-600 hover:bg-blue-700 text-white font-medium
                        rounded-md shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              <span className="text-sm">Login with Microsoft</span>
            </button>

            <div className="text-center text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
              <p className="flex items-center justify-center">
                <svg
                  className="w-3 h-3 mr-1 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                By connecting, you allow access to your calendar data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicrosoftLoginModal;