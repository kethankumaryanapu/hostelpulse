import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from './api';
import {
  Shield,
  KeyRound,
  User,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function Login({ onNavigateRegister }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('W-MALE-101');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = request email, 2 = enter OTP + new pass
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState(null);
  const [forgotError, setForgotError] = useState(null);

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(id, pass) {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    setForgotError(null);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccessMsg(res.data?.message || 'Verification code sent!');
      if (res.data?.demoOtp) {
        setOtpCode(res.data.demoOtp); // prefill for easy test
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to request password reset.');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setForgotError(null);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: otpCode,
        newPassword,
      });
      setForgotSuccessMsg(res.data?.message || 'Password successfully reset! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setPassword(newPassword);
        setIdentifier(forgotEmail);
        setForgotStep(1);
      }, 1500);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password.');
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.25rem',
              borderRadius: '20px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Shield size={34} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.4rem' }}>
            Hostel<span className="text-gradient">Pulse</span> Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            College Hostel Complaint & Management System
          </p>
        </div>

        {/* Main Login Box */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">
                User Identifier
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Laminated ID / College ID / Email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
                <User
                  size={18}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Students use <b>Laminated ID</b> (e.g. HID-BBA-001); Wardens use <b>College ID</b> (e.g. W-MALE-101); Staff use Email.
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotError(null);
                    setForgotSuccessMsg(null);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Persona Demo Switcher */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <Sparkles size={14} color="#6366f1" /> Quick-Test Personas (1-Click)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickFill('W-MALE-101', 'Password@123')}
              >
                👨‍🏫 Boys Warden (Vikram)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickFill('W-FEMA-201', 'Password@123')}
              >
                👩‍🏫 Girls Warden (Sunita)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickFill('HID-BBA-001', 'Password@123')}
              >
                🎓 Student Boy (Rahul)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickFill('HID-GBB-001', 'Password@123')}
              >
                🎓 Student Girl (Ananya)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickFill('admin@hostelpulse.edu', 'Password@123')}
              >
                🛡️ Chief Warden Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickFill('mess@hostelpulse.edu', 'Password@123')}
              >
                🍲 Mess Operations
              </button>
            </div>
          </div>
        </div>

        {/* New Account Registration Links */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Need a student hostel account?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateRegister('student_male')}
            >
              Register as Male Student
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateRegister('student_female')}
            >
              Register as Female Student
            </button>
          </div>
          <div>
            <button
              onClick={() => onNavigateRegister('warden')}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Hostel Warden Registration
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              <KeyRound size={20} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-blue)' }} />
              Reset Your Password
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {forgotStep === 1
                ? 'Enter your registered college email address to receive a 6-digit OTP verification code.'
                : `Enter the 6-digit code dispatched to ${forgotEmail} and choose a new password.`}
            </p>

            {forgotError && <div className="alert alert-error">{forgotError}</div>}
            {forgotSuccessMsg && <div className="alert alert-success">{forgotSuccessMsg}</div>}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@hostelpulse.edu"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send OTP Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    placeholder="123456"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setForgotStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
