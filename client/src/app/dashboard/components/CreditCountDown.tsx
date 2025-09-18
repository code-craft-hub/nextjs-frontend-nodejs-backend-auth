// import React, { useEffect, useState, useCallback } from 'react';
// import { addDays, isBefore, differenceInSeconds, startOfTomorrow } from 'date-fns';

// interface CreditInfo {
//   credits: number;
//   expiryTime: Date | null;
//   unlimitedAccessExpiry: Date | null;
// }

// const CreditCountdown: React.FC = () => {
//   const [creditInfo, setCreditInfo] = useState<CreditInfo>({
//     credits: 5,
//     expiryTime: startOfTomorrow(), // Next day at midnight
//     unlimitedAccessExpiry: null,
//   });

//   const [unlimitedExpiryTime, setUnlimitedExpiryTime] = useState<{
//     days: number;
//     hours: number;
//     minutes: number;
//     seconds: number;
//   } | null>(null);

//   // Memoized function to calculate and update remaining time
//   const updateCountdown = useCallback(() => {
//     const currentTime = new Date();

//     if (creditInfo.expiryTime && currentTime >= creditInfo.expiryTime) {
//       setCreditInfo((prevState) => ({
//         ...prevState,
//         credits: 5,
//         expiryTime: startOfTomorrow(),
//       }));
//     }

//     if (creditInfo.unlimitedAccessExpiry) {
//       if (currentTime >= creditInfo.unlimitedAccessExpiry) {
//         setCreditInfo((prevState) => ({
//           ...prevState,
//           unlimitedAccessExpiry: null,
//         }));
//         setUnlimitedExpiryTime(null);
//       } else {
//         const diffInSeconds = differenceInSeconds(creditInfo.unlimitedAccessExpiry, currentTime);
//         setUnlimitedExpiryTime({
//           days: Math.floor(diffInSeconds / (3600 * 24)),
//           hours: Math.floor((diffInSeconds % (3600 * 24)) / 3600),
//           minutes: Math.floor((diffInSeconds % 3600) / 60),
//           seconds: diffInSeconds % 60,
//         });
//       }
//     }
//   }, [creditInfo.expiryTime, creditInfo.unlimitedAccessExpiry]);

//   const purchaseCredits = useCallback((amount: number) => {
//     setCreditInfo((prevState) => ({
//       ...prevState,
//       credits: prevState.credits + amount,
//     }));
//   }, []);

//   const purchaseUnlimitedAccess = useCallback((days: number) => {
//     setCreditInfo((prevState) => {
//       const currentTime = new Date();
//       const newExpiry = prevState.unlimitedAccessExpiry && isBefore(currentTime, prevState.unlimitedAccessExpiry)
//         ? addDays(prevState.unlimitedAccessExpiry, days)
//         : addDays(currentTime, days);

//       return {
//         ...prevState,
//         unlimitedAccessExpiry: newExpiry,
//       };
//     });
//   }, []);

//   useEffect(() => {
//     const intervalId = setInterval(updateCountdown, 1000);
//     return () => clearInterval(intervalId);
//   }, [updateCountdown]);

//   const creditExpiryTime = getRemainingTime(creditInfo.expiryTime);

//   return (
//     <div>
//       <div>
        
//         {creditInfo.credits === 0 && creditExpiryTime && (
//           <p>
//             Free credits reset in: {creditExpiryTime.days} Days, {creditExpiryTime.hours} Hours,{' '}
//             {creditExpiryTime.minutes} Minutes, {creditExpiryTime.seconds} Seconds
//           </p>
//         )}
//       </div>
//       <div>
//         {unlimitedExpiryTime ? (
//           <p>
//             Unlimited access expires in: {unlimitedExpiryTime.days} Days, {unlimitedExpiryTime.hours} Hours,{' '}
//             {unlimitedExpiryTime.minutes} Minutes, {unlimitedExpiryTime.seconds} Seconds
//           </p>
//         ) : (
//           <p>No active unlimited access.</p>
//         )}
//       </div>
     
//     </div>
//   );
// };

// const getRemainingTime = (expiryTime: Date | null) => {
//   if (!expiryTime) return null;
//   const diffInSeconds = differenceInSeconds(expiryTime, new Date());
//   return {
//     days: Math.floor(diffInSeconds / (3600 * 24)),
//     hours: Math.floor((diffInSeconds % (3600 * 24)) / 3600),
//     minutes: Math.floor((diffInSeconds % 3600) / 60),
//     seconds: diffInSeconds % 60,
//   };
// };

// export default CreditCountdown;

import React, { useEffect, useState, useCallback } from "react";
import { differenceInSeconds, startOfTomorrow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useCreditInfo, useGetCurrentUser } from "@/lib/queries";

interface CreditInfo {
  credits: number;
  expiryTime: Date | null;
}

interface CountDown {
  creditTime: { days: number; hours: number; minutes: number; seconds: number } | null;
}

const CreditCountDown: React.FC = () => {
  const {user} = useAuth();
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({
    credits: 0,
    expiryTime: null,
  });
  const { mutateAsync: creditUpdateMutation } = useCreditInfo(user);
  const { data: dbUser, isPending } = useGetCurrentUser(user);

  useEffect(() => {
    if (dbUser) {
      const expiryDate =
        dbUser.expiryTime instanceof Timestamp
          ? new Date(
              dbUser.expiryTime.seconds * 1000 +
                dbUser.expiryTime.nanoseconds / 1000000
            )
          : dbUser.expiryTime;
      setCreditInfo({
        credits: dbUser.credit,
        expiryTime: expiryDate,
      });
    }
  }, [isPending, dbUser]);

  const [countdownTimes, setCountdownTimes] = useState<CountDown>({
    creditTime: null,
  });

  const handleCreditExpiry = useCallback(() => {
    const currentTime = new Date();
    const expiryDate = creditInfo.expiryTime;

    // If current time is after the expiry time (end of day), reset credits and set new expiry time
    if (expiryDate && currentTime >= expiryDate) {
      return {
        credits: 5, // Reset credits to 5 (or whatever the default is)
        expiryTime: startOfTomorrow(), // Set the expiry time to midnight (start of the next day)
      };
    }
    return null;
  }, [creditInfo.expiryTime]);

  const updateCredits = async (newCredits: number, newExpiryTime: Date | null) => {
    setCreditInfo({
      credits: newCredits,
      expiryTime: newExpiryTime,
    });
    await creditUpdateMutation({
      credits: newCredits,
      expiryTime: newExpiryTime,
    });
  };

  const updateCountdown = useCallback(() => {
    const updatedCreditInfo = handleCreditExpiry();
    if (updatedCreditInfo) {
      updateCredits(updatedCreditInfo.credits, updatedCreditInfo.expiryTime);
    } else if (creditInfo.expiryTime) {
      setCountdownTimes({
        creditTime: getRemainingTime(creditInfo.expiryTime),
      });
    }
  }, [handleCreditExpiry, creditInfo.expiryTime]);

  useEffect(() => {
    if (creditInfo.expiryTime) {
      const intervalId = setInterval(updateCountdown, 1000);
      return () => clearInterval(intervalId);
    }
  }, [updateCountdown, creditInfo.expiryTime]);

  return (
      <div>
        {countdownTimes.creditTime && (
          <p className="text-sm">
            {countdownTimes.creditTime.days?.toString().padStart(2, "0") || "00"}:
            {countdownTimes.creditTime.hours?.toString().padStart(2, "0") || "00"}:
            {countdownTimes.creditTime.minutes?.toString().padStart(2, "0") || "00"}:
            {countdownTimes.creditTime.seconds?.toString().padStart(2, "0") || "00"}
          </p>
        )}
      </div>
  );
};

// Helper function to get remaining time in days, hours, minutes, and seconds
const getRemainingTime = (expiryTime: Date | null) => {
  if (!expiryTime) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const diffInSeconds = differenceInSeconds(expiryTime, new Date());
  if (diffInSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diffInSeconds / (3600 * 24));
  const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  return { days, hours, minutes, seconds };
};

export default CreditCountDown;

