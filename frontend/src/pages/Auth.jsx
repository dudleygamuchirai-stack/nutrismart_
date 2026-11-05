import React, { useState } from 'react';
import './Auth.css';

const API_BASE_URL = 'https://nutrismart-f59i.onrender.com';

export default function Auth({ mode = 'login', setActivePage, onAuthSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isRegister) {
        const registerResponse = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            FullName: fullName.trim(),
            Email: email.trim(),
            Password: password
          })
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerData.message || 'Registration failed.');
        }
      }

      // Log in after registration so we can retrieve the real UserID.
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: email.trim(),
          Password: password
        })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Login failed.');
      }

      const account = loginData.user || loginData;
      const userId = account.UserID || account.user_id || account.id;

      // Only accept a real UUID from the server.
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!userId || !uuidPattern.test(String(userId))) {
        throw new Error(
          'Login worked, but the server did not return a valid user ID. Please contact your project team to check the backend response.'
        );
      }

      const loggedInUser = {
        UserID: userId,
        FullName: account.FullName || fullName.trim() || 'NutriSmart User',
        Email: account.Email || email.trim()
      };

      localStorage.setItem('userId', loggedInUser.UserID);
      localStorage.setItem('userName', loggedInUser.FullName);
      localStorage.setItem('userEmail', loggedInUser.Email);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      onAuthSuccess(loggedInUser);
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-dot"></span>
          NutriSmart SA
        </div>

        <span className="auth-eyebrow">
          {isRegister ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
        </span>

        <h2>{isRegister ? 'Create your account' : 'Log in to NutriSmart'}</h2>

        <p className="auth-description">
          {isRegister
            ? 'Sign up to start creating affordable weekly meal plans.'
            : 'Log in to access your meal plans and generate a new week.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-fullname">Full name</label>
              <input
                id="auth-fullname"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />
          </div>

          {errorMessage && (
            <div className="auth-message auth-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-message auth-success">
              {successMessage}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create Account'
                : 'Log In'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setSuccessMessage('');
              setActivePage(isRegister ? 'login' : 'register');
            }}
          >
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </div>

        <button
          type="button"
          className="auth-home-link"
          onClick={() => setActivePage('landing')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
