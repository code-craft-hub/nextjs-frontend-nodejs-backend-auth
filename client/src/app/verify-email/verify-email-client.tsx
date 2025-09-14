'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

interface VerifyEmailClientProps {
  initialUser: User;
}

export default function VerifyEmailClient({ initialUser }: VerifyEmailClientProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const { user } = useAuth();
  const currentUser = user || initialUser;

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const sendVerificationCode = async () => {
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setSuccess('Verification code sent to your email!');
      setCanResend(false);
      setTimeLeft(60); // 1 minute cooldown
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 5) {
      setError('Please enter the 5-digit verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Redirect will happen automatically via middleware
      window.location.href = '/onboarding';
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatCode = (value: string) => {
    // Only allow digits and limit to 5 characters
    const digits = value.replace(/\D/g, '').slice(0, 5);
    setCode(digits);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0 0 10px 0'
          }}>
            Verify Your Email
          </h1>
          <p style={{ 
            color: '#6b7280', 
            margin: '0',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            We've sent a 5-digit verification code to<br />
            <strong>{currentUser.email}</strong>
          </p>
        </div>

        <form onSubmit={verifyCode}>
          <div style={{ marginBottom: '25px' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => formatCode(e.target.value)}
              placeholder="93745"
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '24px',
                textAlign: 'center',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                letterSpacing: '8px',
                fontFamily: 'Monaco, Consolas, monospace',
                fontWeight: '600',
                outline: 'none',
                transition: 'border-color 0.2s',
                marginBottom: '15px'
              }}
              maxLength={5}
              autoComplete="one-time-code"
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
            <p style={{ 
              color: '#6b7280', 
              fontSize: '14px', 
              margin: '0',
              textAlign: 'center'
            }}>
              Enter the 5-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.length !== 5}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: isVerifying || code.length !== 5 ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isVerifying || code.length !== 5 ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'background-color 0.2s'
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={sendVerificationCode}
            disabled={!canResend || isSending}
            style={{
              background: 'none',
              border: 'none',
              color: canResend && !isSending ? '#667eea' : '#9ca3af',
              cursor: canResend && !isSending ? 'pointer' : 'not-allowed',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            {isSending 
              ? 'Sending...' 
              : canResend 
                ? 'Resend verification code' 
                : `Resend in ${timeLeft}s`
            }
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#dc2626', fontSize: '14px', margin: '0' }}>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#16a34a', fontSize: '14px', margin: '0' }}>
              {success}
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          padding: '15px',
          textAlign: 'left'
        }}>
          <p style={{ 
            color: '#92400e', 
            fontSize: '14px', 
            margin: '0',
            lineHeight: '1.5'
          }}>
            <strong>💡 Tip:</strong> Check your spam folder if you don't see the email. 
            The verification code expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}