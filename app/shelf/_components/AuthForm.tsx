'use client';

import { useState, type FormEvent } from 'react';
import styles from '../shelf.module.css';
import Logo from './Logo';
import { cleanUsername, USERNAME_REGEX } from '../_lib/profile';

const TERMS_URL = 'https://shelf-links.github.io/shelf-legal/terms.html';
const PRIVACY_URL = 'https://shelf-links.github.io/shelf-legal/privacy-policy.html';

export interface SignUpDetails {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface Props {
  // Each resolves to null on success, or a message to show.
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (details: SignUpDetails) => Promise<{ error: string | null; notice?: string }>;
}

export default function AuthForm({ onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function switchMode(next: 'signin' | 'signup') {
    setMode(next);
    setError('');
    setNotice('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (mode === 'signin') {
      if (!email.trim() || !password) {
        setError('Enter your email and password.');
        return;
      }
      setBusy(true);
      const message = await onSignIn(email.trim(), password);
      if (message) {
        setError(message);
        setBusy(false);
      }
      return;
    }

    if (!name.trim() || !username || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setError('Username must be 3-20 characters: letters, numbers and underscores only.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!adult) {
      setError('Please confirm you are 18 or over and agree to the Terms and Privacy Policy.');
      return;
    }

    setBusy(true);
    const result = await onSignUp({ name: name.trim(), username, email: email.trim(), password });
    if (result.error) setError(result.error);
    if (result.notice) setNotice(result.notice);
    setBusy(false);
  }

  const signingUp = mode === 'signup';

  return (
    <div className={styles.signIn}>
      <div className={styles.signInBrand}>
        <Logo size={72} />
        <h1 className={styles.signInWordmark}>
          shelf<span className={styles.wordmarkIt}>It</span>
        </h1>
      </div>

      <form className={styles.signInForm} onSubmit={handleSubmit} noValidate>
        <p className={styles.lead}>
          {signingUp ? 'Create your account to start saving links.' : "Sign in to see everything you've saved."}
        </p>

        {signingUp ? (
          <>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Name</span>
              <input
                className={styles.input}
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Username</span>
              <input
                className={styles.input}
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="e.g. jane_smith"
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(cleanUsername(e.target.value))}
              />
            </label>
          </>
        ) : null}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{signingUp ? 'Password (at least 6 characters)' : 'Password'}</span>
          <input
            className={styles.input}
            type="password"
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {signingUp ? (
          <label className={styles.hint} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              I am 18 or over and agree to the{' '}
              <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">Terms</a> and{' '}
              <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </span>
          </label>
        ) : null}

        {error ? (
          <p className={`${styles.message} ${styles.messageError}`} role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className={styles.message} role="status">
            {notice}
          </p>
        ) : null}

        <button className={styles.primary} type="submit" disabled={busy}>
          {busy ? 'Please wait…' : signingUp ? 'Create account' : 'Sign in'}
        </button>

        <p className={styles.hint}>
          {signingUp ? (
            <>
              Already have an account?{' '}
              <button type="button" className={styles.textButton} onClick={() => switchMode('signin')}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button type="button" className={styles.textButton} onClick={() => switchMode('signup')}>
                Create an account
              </button>
              . Forgot your password? Use the ShelfIt app on your iPhone for now.
            </>
          )}
        </p>
      </form>
    </div>
  );
}
