
import React, { useState } from 'react';
import './Auth.css';

const API_BASE_URL = 'https://nutrismart-f59i.onrender.com';

export default function Auth({ mode = 'login', setActivePage, onAuthSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isRegister = mode === 'register';

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    // Check required registration details.
    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (!email.trim()) {
        setErrorMessage('Please enter your email address.');
        return;
      }

      if (!isPasswordStrong) {
        setErrorMessage(
          'Please create a stronger password using all the requirements.'
        );
        return;
      }

      if (!passwordsMatch) {
        setErrorMessage(
          'Your passwords do not match. Please try again.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      let inductionData = {};

      if (isRegister) {
        // Get the information saved by the Induction page.
        const savedInductionData =
          localStorage.getItem('inductionData');

        if (!savedInductionData) {
          throw new Error(
            'Your induction information is missing. Please complete the induction page first.'
          );
        }

        try {
          inductionData = JSON.parse(savedInductionData);
        } catch {
          throw new Error(
            'Your induction information could not be read. Please complete the induction page again.'
          );
        }

        // Register the user with their induction information.
        const registerResponse = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            FullName: fullName.trim(),
            Email: email.trim(),
            Password: password,

            Age: inductionData.Age,
            Sex: inductionData.Sex,
            HeightCm: inductionData.HeightCm,
            WeightKg: inductionData.WeightKg,
            ActivityLevel: inductionData.ActivityLevel,
            Goal: inductionData.Goal,
            HouseholdSize: inductionData.HouseholdSize,
            DailyCalorieTarget: inductionData.DailyCalorieTarget
          })
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(
            registerData.message || 'Registration failed.'
          );
        }
      }

      // Log in after successful registration.
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
        throw new Error(
          loginData.message || 'Login failed.'
        );
      }

      const account = loginData.user || loginData;

      const userId =
        account.UserID || account.user_id || account.id;

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
        Email: account.Email || email.trim(),

        ...(isRegister ? inductionData : {})
      };

      // Save the logged-in user.
      localStorage.setItem('userId', loggedInUser.UserID);
      localStorage.setItem('userName', loggedInUser.FullName);
      localStorage.setItem('userEmail', loggedInUser.Email);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      onAuthSuccess(loggedInUser);

    } catch (error) {
      setErrorMessage(
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordToggle = (visible, toggleVisibility, label) => (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={toggleVisibility}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      title={visible ? 'Hide password' : 'Show password'}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '5px'
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {visible ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a9.7 9.7 0 0 1-2.1 3" />
            <path d="M6.2 6.2C3.7 7.8 2 10.3 2 12c0 2 4 7 10 7a10 10 0 0 0 4-.8" />
          </>
        ) : (
          <>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );

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

        <h2>
          {isRegister ? 'Create your account' : 'Log in to NutriSmart'}
        </h2>

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

            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => {
                  if (isRegister) setShowPasswordRules(true);
                }}
                onBlur={() => setShowPasswordRules(false)}
                placeholder="Enter your password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={isRegister ? 8 : 6}
                style={{ paddingRight: '48px', width: '100%' }}
              />

              {renderPasswordToggle(
                showPassword,
                () => setShowPassword(!showPassword),
                'password'
              )}
            </div>
          </div>

          {isRegister && showPasswordRules && (
            <div className="auth-password-rules">
              <p>Password must contain:</p>

              <ul>
                <li style={{ color: passwordChecks.length ? 'green' : 'inherit' }}>
                  {passwordChecks.length ? '✓' : '○'} At least 8 characters
                </li>

                <li style={{ color: passwordChecks.uppercase ? 'green' : 'inherit' }}>
                  {passwordChecks.uppercase ? '✓' : '○'} One uppercase letter (A-Z)
                </li>

                <li style={{ color: passwordChecks.lowercase ? 'green' : 'inherit' }}>
                  {passwordChecks.lowercase ? '✓' : '○'} One lowercase letter (a-z)
                </li>

                <li style={{ color: passwordChecks.number ? 'green' : 'inherit' }}>
                  {passwordChecks.number ? '✓' : '○'} One number (0-9)
                </li>

                <li style={{ color: passwordChecks.special ? 'green' : 'inherit' }}>
                  {passwordChecks.special ? '✓' : '○'} One special character (!, @, #, etc.)
                </li>
              </ul>
            </div>
          )}

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">
                Confirm Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: '48px', width: '100%' }}
                />

                {renderPasswordToggle(
                  showConfirmPassword,
                  () => setShowConfirmPassword(!showConfirmPassword),
                  'confirm password'
                )}
              </div>

              {confirmPassword.length > 0 && (
                <p
                  style={{
                    fontSize: '13px',
                    color: passwordsMatch ? 'green' : '#d93025',
                    marginTop: '6px'
                  }}
                >
                  {passwordsMatch
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          )}

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

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
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
              setPassword('');
              setConfirmPassword('');
              setShowPassword(false);
              setShowConfirmPassword(false);
              setShowPasswordRules(false);
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

