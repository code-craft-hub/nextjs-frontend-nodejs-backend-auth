"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { baseURL } from "@/lib/api/client";

export const PaystackPaymentGateway = ({
  active,
  trxReference,
  handleStateChange,
}: any) => {
  const { data: user } = useQuery(userQueries.detail());

  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState(trxReference ?? "");

  // Update to match new backend URL structure

  const generateIdempotencyKey = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializePayment = async () => {
    setLoading(true);

    try {
      const idempotencyKey = generateIdempotencyKey();

      // Updated endpoint to match new routing structure
      const response = await fetch(`${baseURL}/paystack/payments/initialize`, {
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment initialization failed");
      }

      const result = await response.json();

      if (result.status === "success" && result.data?.data) {
        const paymentData = result.data.data;
        setReference(paymentData.reference);
        // window.open(paymentData.authorization_url);
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error(result.message || "Payment initialization failed");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!reference) {
      return;
    }

    try {
      const response = await fetch(
        `${baseURL}/paystack/payments/verify/${reference}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }

      const result = await response.json();

      // Handle new response structure
      if (result.status === "success" && result.data?.data) {
        handleStateChange(true);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
    } 
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          initializePayment();
        }}
        type="button"
        disabled={!active || loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Complete Upgrade
      </Button>
    </>
  );
};
