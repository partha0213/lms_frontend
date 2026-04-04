import React, { useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../../shared/ThemeContext';
import { API_BASE } from '../../config';

// ✅ Module-level flag — survives StrictMode's fake unmount/remount cycle
// Unlike useRef, this is NOT reset when the component unmounts in dev mode
let gsiInitialized = false;

const GoogleLogin = ({ onLoginSuccess, onLoginError }) => {
  const { isDark } = useTheme();
  const googleButtonRef = useRef(null);

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      const res = await fetch(`${API_BASE}/auth_checkpoint/google-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential })
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess?.(data);
      } else {
        onLoginError?.(data.message || 'Google Sign-In failed');
      }
    } catch (err) {
      console.error(err);
      onLoginError?.('Failed to connect to the server');
    }
  }, [onLoginSuccess, onLoginError]);

  useEffect(() => {
    // ✅ Use module-level flag — not reset by StrictMode fake unmount
    if (gsiInitialized) return;
    if (!window.google || !googleButtonRef.current) return;

    gsiInitialized = true;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,  // ✅ Move to .env
      callback: handleCredentialResponse,
      cancel_on_tap_outside: true,                        // ✅ Stop retry on outside click
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      size: 'large',
      theme: isDark ? 'filled_black' : 'outline',
      text: 'continue_with',
      shape: 'rectangular',
      width: 380,
    });

    return () => {
      // ✅ Cancel GSI retry loop on true unmount (navigation away)
      // Do NOT reset gsiInitialized here — let it stay true across StrictMode cycles
      window.google?.accounts.id.cancel();
    };
  }, [handleCredentialResponse, isDark]); // ✅ isDark added so theme changes re-render button

  return (
    <div className="w-full flex justify-center">
      <div ref={googleButtonRef} className="flex justify-center" />
    </div>
  );
};

export default GoogleLogin;