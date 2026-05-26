import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      await signIn(credential);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--paper-bg, #f5f0e8)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '3rem 2.5rem',
        background: 'var(--surface, #fff)',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        minWidth: 300,
      }}>
        <div style={{ fontSize: 48, lineHeight: 1 }} aria-hidden="true">○</div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)' }}>
            Rift Atelier
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: 13, color: 'var(--ink-500, #888)', fontFamily: 'var(--font-mono)' }}>
            collection manager
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '0.5rem 1rem', fontSize: 14, color: 'var(--ink-500, #888)' }}>
            Signing in…
          </div>
        ) : (
          <GoogleLogin
            onSuccess={(resp) => {
              if (resp.credential) void handleSuccess(resp.credential);
            }}
            onError={() => setError('Google sign-in was cancelled or failed.')}
            useOneTap
          />
        )}

        {error && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--error, #c0392b)', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
