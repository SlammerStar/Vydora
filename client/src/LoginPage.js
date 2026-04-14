import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [forgotStep, setForgotStep] = useState(0); // 0=login, 1=email_input, 2=otp_input
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();

  const triggerToast = (msg, callback) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
      if (callback) callback();
    }, 2000);
  };

  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill all fields");
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Login failed");

      localStorage.setItem('token', data.token);
      triggerToast("Signed in successfully! Welcome back.", () => navigate('/'));
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return alert("Please fill Email to reset.");
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to send OTP");

      triggerToast("OTP sent to your email (or console).", () => setForgotStep(2));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !password) return alert("Please provide OTP and New Password");
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Reset failed");

      triggerToast("Password reset successfully. You can now login.", () => setForgotStep(0));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', background: '#874cafff', color: 'white', padding: '16px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: '500', animation: 'fadeInDown 0.3s' }}>
          {toastMessage}
        </div>
      )}

      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "600" }}>{forgotStep > 0 ? "Reset Password" : "Welcome back"}</h2>
          <p style={{ marginTop: "8px", color: "var(--text-secondary)", fontSize: "15px" }}>
            {forgotStep === 1 ? "Enter your email address to receive an OTP" : forgotStep === 2 ? "Enter the OTP sent to your email" : "Sign in to continue to Vydora"}
          </p>
        </div>

        {forgotStep < 2 && (
          <div style={{ marginBottom: "16px" }}>
            <input
              type="email"
              placeholder="Email address"
              className="auth-input"
              value={email}
              disabled={forgotStep === 2}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        {forgotStep === 2 && (
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="6-Digit OTP"
              className="auth-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        {(forgotStep === 0 || forgotStep === 2) && (
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={forgotStep === 2 ? "New Password" : "Password"}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "40px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </span>
          </div>
        )}

        {forgotStep === 0 && (
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <span onClick={() => { setForgotStep(1); setPassword(''); }} style={{ fontSize: '13px', color: '#1a73e8', cursor: 'pointer', fontWeight: '500' }}>Forgot password?</span>
          </div>
        )}
        {forgotStep > 0 && <div style={{ marginBottom: '24px' }}></div>}

        <button
          onClick={forgotStep === 0 ? handleLogin : forgotStep === 1 ? handleSendOtp : handleVerifyOtp}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Processing..." : (forgotStep === 0 ? "Sign in" : forgotStep === 1 ? "Send OTP" : "Verify & Reset")}
        </button>

        {forgotStep > 0 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span onClick={() => setForgotStep(0)} style={{ fontSize: '14px', color: '#1a73e8', cursor: 'pointer', fontWeight: '500' }}>Back to login</span>
          </div>
        )}

        {forgotStep === 0 && (
          <>
            <div style={{ margin: "24px 0", display: "flex", alignItems: "center", textTransform: "uppercase", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
              <span style={{ margin: "0 10px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <GoogleLogin onSuccess={async (credentialResponse) => {
                if (!credentialResponse || !credentialResponse.credential) return;
                const res = await fetch('http://localhost:5001/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: credentialResponse.credential }) });
                const data = await res.json();
                if (!res.ok) return alert("Google login failed");
                localStorage.setItem('token', data.token);
                triggerToast("Google Sign-In successful!", () => navigate('/'));
              }} onError={() => console.log('Google Login Failed')} width="100%" />
            </div>

            <p style={{ marginTop: "32px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <span onClick={() => navigate('/signup')} style={{ color: "#1a73e8", cursor: "pointer", fontWeight: "500" }}>
                Create account
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;