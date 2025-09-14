'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoginLoading, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <br />
        <button type="submit" disabled={isLoginLoading}>
          {isLoginLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {loginError && <p className='text-red-400'>{loginError}</p>}
      <p>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}