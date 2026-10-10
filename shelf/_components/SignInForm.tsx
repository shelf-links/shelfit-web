'use client';

import { useState, type FormEvent } from 'react';
import styles from '../shelf.module.css';
import Logo from './Logo';

interface Props {
  // Resolves to null on success, or a message to show.
  onSignIn: (email: string, password: string) => Promise<string | null>;
}

export default function SignInForm({ onSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    const message = await onSignIn(email.trim(), password);
    if (message) {
      setError(message);
      setBusy(false);
    }
  }

  return (
    <div className={styles.signIn}>
      <div className={styles.signInBrand}>
        <Logo size={72} />
        <h1 className={styles.signInWordmark}>
          shelf<span className={styles.wordmarkIt}>It</span>
        </h1>
      </div>

      <form className={styles.signInForm} onSubmit={handleSubmit} noValidate>
        <p className={styles.lead}>Sign in to see everything you've saved.</p>

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
          <span className={styles.fieldLabel}>Password</span>
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? (
          <p className={`${styles.message} ${styles.messageError}`} role="alert">
            {error}
          </p>
        ) : null}

        <button className={styles.primary} type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className={styles.hint}>New here, or forgot your password? Use the ShelfIt app on your phone.</p>
      </form>
    </div>
  );
}
