'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '@/lib/firebase';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadSessions = async () => {
    try {
      const response = await apiClient.getSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleShowSessions = async () => {
    if (!showSessions) {
      await loadSessions();
    }
    setShowSessions(!showSessions);
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await apiClient.revokeSession(sessionId);
      if (response.success) {
        await loadSessions();
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const logoutAllSessions = async () => {
    try {
      const response = await apiClient.logoutAllSessions();
      if (response.success) {
        await logout();
      }
    } catch (error) {
      console.error('Failed to logout all sessions:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await apiClient.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      if (response.success) {
        alert('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      } else {
        alert(response.error?.message || 'Failed to change password');
      }
    } catch (error) {
      alert('Failed to change password');
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      
      <div>
        <h2>Account Information</h2>
        <p>Email: {user.email}</p>
        <p>Display Name: {user.displayName || 'Not set'}</p>
        <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
        <p>Roles: {user.roles.join(', ')}</p>
        <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
        {user.lastLoginAt && (
          <p>Last login: {new Date(user.lastLoginAt).toLocaleString()}</p>
        )}
      </div>

      <div>
        <h2>Security</h2>
        
        <button onClick={() => setIsChangingPassword(!isChangingPassword)}>
          Change Password
        </button>
        
        {isChangingPassword && (
          <form onSubmit={handlePasswordChange}>
            <div>
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                required
              />
            </div>
            <div>
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                required
              />
            </div>
            <div>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                required
              />
            </div>
            <button type="submit">Change Password</button>
            <button type="button" onClick={() => setIsChangingPassword(false)}>
              Cancel
            </button>
          </form>
        )}
      </div>

      <div>
        <h2>Active Sessions</h2>
        <button onClick={handleShowSessions}>
          {showSessions ? 'Hide Sessions' : 'Show Active Sessions'}
        </button>
        
        {showSessions && (
          <div>
            {sessions.map((session: any) => (
              <div key={session.sessionId}>
                <p>
                  {session.current ? 'Current Session' : 'Other Session'} - 
                  Created: {new Date(session.createdAt).toLocaleString()} - 
                  IP: {session.ipAddress}
                </p>
                {!session.current && (
                  <button onClick={() => revokeSession(session.sessionId)}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
            
            <button onClick={logoutAllSessions}>
              Logout All Sessions
            </button>
          </div>
        )}
      </div>

      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}