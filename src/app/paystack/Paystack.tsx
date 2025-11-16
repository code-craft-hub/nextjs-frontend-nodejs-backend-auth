// "use client";
// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useQuery } from "@tanstack/react-query";
// import { userQueries } from "@/lib/queries/user.queries";
// import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";

// // Add TypeScript types for Paystack
// declare global {
//   interface Window {
//     PaystackPop: any;
//   }
// }

// export const PaystackPaymentGateway = () => {
//   const { data: user } = useQuery(userQueries.detail());

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [verifying, setVerifying] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState<any>(null);
//   const [scriptLoaded, setScriptLoaded] = useState(false);

//   const API_BASE_URL = "http://localhost:8080/api";
//   const PAYSTACK_PUBLIC_KEY = "pk_test_709e73012305c9c5cc0c72159709f5b47b404926"; // Your public key
//   // const PAYSTACK_PUBLIC_KEY = "pk_live_f27938490aae5eeb167a1bafb1646988c627a25c"; // Your public key

//   // Load Paystack Inline Script
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://js.paystack.co/v1/inline.js";
//     script.async = true;
//     script.onload = () => {
//       setScriptLoaded(true);
//       console.log("Paystack script loaded");
//     };
//     script.onerror = () => {
//       setError("Failed to load Paystack. Please refresh the page.");
//     };
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   const generateIdempotencyKey = () => {
//     return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   // Verify payment automatically
//   const verifyPayment = async (reference: string) => {
//     setVerifying(true);
//     setError("");

//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/paystack/payments/verify/${reference}`,
//         { credentials: "include" }
//       );

//       if (!response.ok) {
//         throw new Error("Verification failed");
//       }

//       const result = await response.json();
//       console.log("✅ Verification result:", result);

//       if (result.status === "success" && result.data?.data) {
//         const verificationData = result.data.data;
//         setPaymentStatus(verificationData);

//         if (verificationData.status === "success") {
//           setSuccess("Payment verified successfully! 🎉");
//           // TODO: Update user subscription status in your database
//           // TODO: Send confirmation email
//           // TODO: Trigger any post-payment actions
//           return true;
//         } else {
//           setError(`Payment status: ${verificationData.status}`);
//           return false;
//         }
//       }
//     } catch (err: any) {
//       console.error("❌ Verification error:", err);
//       setError("Failed to verify payment. Please contact support.");
//       return false;
//     } finally {
//       setVerifying(false);
//     }
//   };

//   // Initialize payment and open Paystack popup
//   const initializePayment = async () => {
//     if (!scriptLoaded) {
//       setError("Payment system is loading. Please wait...");
//       return;
//     }

//     if (!user?.email) {
//       setError("User information not found. Please login again.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess("");
//     setPaymentStatus(null);

//     try {
//       const idempotencyKey = generateIdempotencyKey();

//       // Step 1: Initialize payment on your backend
//       const response = await fetch(
//         `${API_BASE_URL}/paystack/payments/initialize`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Idempotency-Key": idempotencyKey,
//           },
//           credentials: "include",
//           body: JSON.stringify({
//             email: user.email,
//             amount: 100, // Amount in your currency (will be converted to kobo in backend)
//             currency: "NGN",
//             metadata: {
//               user_id: user.uid || user.email,
//               first_name: user.firstName,
//               last_name: user.lastName,
//               phone: user.phoneNumber,
//               custom_fields: [
//                 {
//                   display_name: "Customer Name",
//                   variable_name: "customer_name",
//                   value: `${user.firstName} ${user.lastName}`,
//                 },
//                 {
//                   display_name: "Subscription Type",
//                   variable_name: "subscription_type",
//                   value: "Premium Plan",
//                 }
//               ],
//             },
//             channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Payment initialization failed");
//       }

//       const result = await response.json();
//       console.log("🚀 Initialization result:", result);

//       if (result.status === "success" && result.data?.data) {
//         const { reference } = result.data.data;

//         // Step 2: Open Paystack Popup Modal
//         const handler = window.PaystackPop.setup({
//           key: PAYSTACK_PUBLIC_KEY,
//           email: user.email,
//           amount: 100 * 100, // Amount in kobo (100 NGN = 10,000 kobo)
//           currency: "NGN",
//           ref: reference, // Use reference from backend

//           // Callback when payment is successful
//           onSuccess: async (transaction: any) => {
//             console.log("✅ Payment successful:", transaction);
//             setSuccess("Payment successful! Verifying...");

//             // Step 3: Automatically verify payment
//             await verifyPayment(transaction.reference);
//           },

//           // Callback when user closes the modal
//           onClose: () => {
//             console.log("⚠️ Payment modal closed");
//             setError("Payment was not completed. Please try again.");
//             setLoading(false);
//           },

//           // Callback when payment fails
//           onError: (error: any) => {
//             console.error("❌ Payment error:", error);
//             setError(`Payment failed: ${error.message || "Unknown error"}`);
//             setLoading(false);
//           },
//         });

//         // Open the modal
//         handler.openIframe();

//       } else {
//         throw new Error(result.message || "Payment initialization failed");
//       }
//     } catch (err: any) {
//       setError(err.message || "An error occurred. Please try again.");
//       console.error("💥 Payment error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Manual verify button (optional)
//   const manualVerify = async () => {
//     if (!paymentStatus?.reference) {
//       setError("No payment reference to verify");
//       return;
//     }
//     await verifyPayment(paymentStatus.reference);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Error Alert */}
//       {error && (
//         <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <XCircle className="w-5 h-5 text-red-600" />
//           <p className="text-sm text-red-700">{error}</p>
//         </div>
//       )}

//       {/* Success Alert */}
//       {success && (
//         <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
//           <CheckCircle className="w-5 h-5 text-green-600" />
//           <p className="text-sm text-green-700">{success}</p>
//         </div>
//       )}

//       {/* Verifying Status */}
//       {verifying && (
//         <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//           <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
//           <p className="text-sm text-blue-700">Verifying payment...</p>
//         </div>
//       )}

//       {/* Payment Status Details */}
//       {paymentStatus && paymentStatus.status === "success" && (
//         <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
//           <div className="flex items-center gap-2 mb-3">
//             <CheckCircle className="w-6 h-6 text-green-600" />
//             <h3 className="font-semibold text-green-800">Payment Successful!</h3>
//           </div>
//           <div className="space-y-1 text-sm">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Amount:</span>
//               <span className="font-semibold">
//                 {paymentStatus.currency} {(paymentStatus.amount / 100).toFixed(2)}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Reference:</span>
//               <span className="font-mono text-xs">{paymentStatus.reference}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Channel:</span>
//               <span className="font-semibold capitalize">{paymentStatus.channel}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Date:</span>
//               <span>{new Date(paymentStatus.paid_at).toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Debug Info (Remove in production) */}
//       <details className="text-xs bg-gray-50 p-2 rounded">
//         <summary className="cursor-pointer font-semibold">Debug Info</summary>
//         <pre className="mt-2 overflow-auto">
//           {JSON.stringify(
//             {
//               scriptLoaded,
//               loading,
//               verifying,
//               hasError: !!error,
//               hasSuccess: !!success,
//               paymentStatus: paymentStatus?.status,
//               user: { email: user?.email, name: `${user?.firstName} ${user?.lastName}` }
//             },
//             null,
//             2
//           )}
//         </pre>
//       </details>

//       {/* Upgrade Button */}
//       <Button
//         onClick={initializePayment}
//         className="max-sm:w-full"
//         variant="outline"
//         disabled={loading || verifying || !scriptLoaded}
//       >
//         {loading ? (
//           <>
//             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             Processing...
//           </>
//         ) : (
//           <>
//             <CreditCard className="w-4 h-4 mr-2" />
//             Upgrade Now
//           </>
//         )}
//       </Button>

//       {/* Manual Verify Button (Optional - for testing) */}
//       {paymentStatus && (
//         <Button
//           onClick={manualVerify}
//           variant="ghost"
//           size="sm"
//           disabled={verifying}
//         >
//           {verifying ? "Verifying..." : "Re-verify Payment"}
//         </Button>
//       )}
//     </div>
//   );
// };

"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";

export const PaystackPaymentGateway = ({ trxReference }: any) => {
  const { data: user } = useQuery(userQueries.detail());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [reference, setReference] = useState(trxReference ?? "");
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Update to match new backend URL structure
  const API_BASE_URL = "http://localhost:8080/api";

  const generateIdempotencyKey = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializePayment = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const idempotencyKey = generateIdempotencyKey();

      // Updated endpoint to match new routing structure
      const response = await fetch(
        `${API_BASE_URL}/paystack/payments/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          credentials: "include",
          body: JSON.stringify({
            email: user?.email,
            amount: parseFloat("100"),
            currency: "NGN",
            metadata: {
              first_name: user?.firstName,
              last_name: user?.lastName,
              phone: user?.phoneNumber,
              custom_fields: [
                {
                  display_name: "Customer Name",
                  variable_name: "customer_name",
                  value: `${user?.firstName} ${user?.lastName}`,
                },
              ],
            },
            channels: [
              "card",
              "bank",
              "ussd",
              "qr",
              "mobile_money",
              "bank_transfer",
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment initialization failed");
      }

      const result = await response.json();

      if (result.status === "success" && result.data?.data) {
        const paymentData = result.data.data;
        setPaymentUrl(paymentData.authorization_url);
        setReference(paymentData.reference);
        setSuccess("Payment initialized successfully! Redirecting...");
        console.log(result);
        // window.open(paymentData.authorization_url);
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error(result.message || "Payment initialization failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!reference) {
      setError("No transaction reference found");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/paystack/payments/verify/${reference}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }

      const result = await response.json();

      // Handle new response structure
      if (result.status === "success" && result.data?.data) {
        const verificationData = result.data.data;
        setPaymentStatus(verificationData);
        console.log("Verification result:", verificationData);

        if (verificationData.status === "success") {
          setSuccess("Payment verified successfully!");
        } else {
          setError(`Payment status: ${verificationData.status}`);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify payment. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    console.log("reference : ", reference);
    verifyPayment();
  }, []);

  return (
    <>
      {JSON.stringify(paymentStatus, null, 2)}

      <Button
        onClick={() => {
          initializePayment();
        }}
        className="max-sm:w-full"
        variant={"outline"}
      >
        Upgrade Now
      </Button>
    </>
  );
};

// import {
//   CreditCard,
//   Lock,
//   AlertCircle,
//   CheckCircle,
//   Loader2,
//   RefreshCw,
// } from "lucide-react";
// const [formData, setFormData] = useState({
//   email: "",
//   amount: "",
//   currency: "NGN",
//   firstName: "",
//   lastName: "",
//   phone: "",
// });
//   setPaymentUrl("");
//   setReference("");
//   setPaymentStatus(null);
//   setError("");
//   setSuccess("");
// };
// const sanitizeInput = (input) => {
//   return input.replace(/[<>]/g, "");
// };

// const validateForm = () => {
//   if (!user?.email || !/^\S+@\S+\.\S+$/.test(user?.email)) {
//     setError("Please enter a valid email address");
//     return false;
//   }

//   if (!user?.firstName || !user?.lastName) {
//     setError("Please enter your full name");
//     return false;
//   }
//   return true;
// };

// const handleInputChange = (e) => {
//   const { name, value } = e.target;
//   setFormData((prev) => ({
//     ...prev,
//     [name]: sanitizeInput(value),
//   }));
//   setError("");
// };
// const resetForm = () => {
//   setFormData({
//     email: "",
//     amount: "",
//     currency: "NGN",
//     firstName: "",
//     lastName: "",
//     phone: "",
//   });
// return (
//   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//     <div className="max-w-2xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//           <div className="flex items-center gap-3">
//             <CreditCard className="w-8 h-8" />
//             <div>
//               <h1 className="text-2xl font-bold">Secure Payment Gateway</h1>
//               <p className="text-blue-100 text-sm">
//                 Powered by Paystack - Enterprise Grade Security
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6">
//           <div className="flex items-center gap-2">
//             <Lock className="w-5 h-5 text-green-600" />
//             <div className="text-sm">
//               <p className="font-semibold text-green-800">
//                 256-bit SSL Encryption
//               </p>
//               <p className="text-green-600">
//                 Your payment information is secure and encrypted
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-6">
//           {error && (
//             <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="w-5 h-5 text-red-600" />
//                 <p className="text-red-700">{error}</p>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 <p className="text-green-700">{success}</p>
//               </div>
//             </div>
//           )}

//           {!paymentStatus && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     First Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Last Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="you@example.com"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="+234XXXXXXXXXX"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Amount *
//                   </label>
//                   <input
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="5000"
//                     min="100"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Currency
//                   </label>
//                   <select
//                     name="currency"
//                     value={formData.currency}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="NGN">NGN - Nigerian Naira</option>
//                     <option value="USD">USD - US Dollar</option>
//                     <option value="GHS">GHS - Ghanaian Cedi</option>
//                     <option value="ZAR">ZAR - South African Rand</option>
//                     <option value="KES">KES - Kenyan Shilling</option>
//                   </select>
//                 </div>
//               </div>

//               <button
//                 onClick={initializePayment}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Lock className="w-5 h-5" />
//                     Pay Securely
//                   </>
//                 )}
//               </button>
//             </div>
//           )}

//           {reference && !paymentStatus && (
//             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//               <h3 className="font-semibold text-gray-800 mb-3">
//                 Transaction Reference
//               </h3>
//               <p className="text-sm text-gray-600 mb-3 font-mono bg-white p-2 rounded border">
//                 {reference}
//               </p>
//               <button
//                 onClick={verifyPayment}
//                 disabled={verifying}
//                 className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {verifying ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Verifying...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="w-5 h-5" />
//                     Verify Payment
//                   </>
//                 )}
//               </button>
//             </div>
//           )}

//           {paymentStatus && (
//             <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
//               <div className="flex items-center gap-3 mb-4">
//                 <CheckCircle className="w-8 h-8 text-green-600" />
//                 <h3 className="text-xl font-bold text-green-800">
//                   Payment Successful!
//                 </h3>
//               </div>
//               <button
//                 onClick={verifyPayment}
//                 disabled={verifying}
//                 className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {verifying ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Verifying...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="w-5 h-5" />
//                     Verify Payment
//                   </>
//                 )}
//               </button>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Amount:</span>
//                   <span className="font-semibold">
//                     {paymentStatus.currency}{" "}
//                     {(paymentStatus.amount / 100).toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Status:</span>
//                   <span className="font-semibold text-green-600 uppercase">
//                     {paymentStatus.status}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Reference:</span>
//                   <span className="font-mono text-xs">
//                     {paymentStatus.reference}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Channel:</span>
//                   <span className="font-semibold">
//                     {paymentStatus.channel}
//                   </span>
//                 </div>
//               </div>
//               <button
//                 onClick={resetForm}
//                 className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//               >
//                 <RefreshCw className="w-5 h-5" />
//                 New Payment
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="bg-gray-50 p-6 border-t">
//           <h4 className="font-semibold text-gray-800 mb-3">
//             Security Features Implemented
//           </h4>
//           <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>PCI DSS Compliant</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>HTTPS/TLS 1.3</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>XSS Protection</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>Rate Limiting</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>Idempotency Keys</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>Input Validation</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>Webhook Verification</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//               <span>Request Logging</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6 text-center">
//         <p className="text-sm text-gray-600 mb-2">
//           Supported Payment Methods
//         </p>
//         <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
//           <span className="px-3 py-1 bg-white rounded-full shadow">
//             Cards
//           </span>
//           <span className="px-3 py-1 bg-white rounded-full shadow">
//             Bank Transfer
//           </span>
//           <span className="px-3 py-1 bg-white rounded-full shadow">USSD</span>
//           <span className="px-3 py-1 bg-white rounded-full shadow">
//             QR Code
//           </span>
//           <span className="px-3 py-1 bg-white rounded-full shadow">
//             Mobile Money
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>
// );
// };

// export default PaystackPaymentGateway;
