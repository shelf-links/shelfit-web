'use client';

import { useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import styles from '../shelf.module.css';
import { getSupabase } from '../_lib/supabaseClient';
import AuthForm, { type SignUpDetails } from './AuthForm';
import { saveProfile, usernameIsFree } from '../_lib/profile';
import Shelf from './Shelf';

// `client` is only passed in by tests. In the browser it is created on first use.
export default function ShelfApp({ client }: { client?: SupabaseClient }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(client ?? null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (client) {
      setSupabase(client);
      return;
    }
    try {
      setSupabase(getSupabase());
    } catch {
      setBroken(true);
    }
  }, [client]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setSession(data.session);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) {
        setSession(next);
        setReady(true);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignIn(email: string, password: string): Promise<string | null> {
    if (!supabase) return "Can't reach ShelfIt. Try again in a moment.";
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        void saveProfile(supabase, data.user);
        return null;
      }
      if (error.code === 'email_not_confirmed') return 'Confirm your email address first. The link was sent when you signed up.';
      if (error.code === 'over_request_rate_limit' || error.status === 429) return 'Too many attempts. Wait a minute and try again.';
      if (error.status === 400 || error.status === 401) return 'Email or password is incorrect.';
      return "Couldn't sign in. Try again in a moment.";
    } catch {
      return "Can't reach ShelfIt. Check your connection and try again.";
    }
  }

  async function handleSignUp(details: SignUpDetails): Promise<{ error: string | null; notice?: string }> {
    if (!supabase) return { error: "Can't reach ShelfIt. Try again in a moment." };
    try {
      const free = await usernameIsFree(supabase, details.username);
      if (free === false) return { error: 'That username is already taken. Try another.' };

      const { data, error } = await supabase.auth.signUp({
        email: details.email,
        password: details.password,
        options: { data: { full_name: details.name, username: details.username } },
      });

      if (error) {
        if (error.code === 'user_already_exists') return { error: 'An account with that email already exists. Sign in instead.' };
        if (error.code === 'weak_password') return { error: 'Choose a stronger password.' };
        if (error.code === 'over_request_rate_limit' || error.status === 429) return { error: 'Too many attempts. Wait a minute and try again.' };
        if (error.status === 400 || error.status === 422) return { error: error.message };
        return { error: "Couldn't create your account. Try again in a moment." };
      }

      // Supabase returns a user with no identities when the email is already registered.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { error: 'An account with that email already exists. Sign in instead.' };
      }

      if (data.session) {
        // Signed in straight away: save the username, then the shelf appears.
        await saveProfile(supabase, data.user);
        return { error: null };
      }

      return { error: null, notice: 'Account created. Check your email and tap the link to confirm, then sign in here.' };
    } catch {
      return { error: "Can't reach ShelfIt. Check your connection and try again." };
    }
  }

  async function handleSignOut() {
    await supabase?.auth.signOut();
  }

  let content;
  if (broken) {
    content = <p className={styles.empty}>The shelf isn't available right now. Try again later.</p>;
  } else if (!ready || !supabase) {
    content = <p className={styles.empty}>Loading…</p>;
  } else if (!session) {
    content = <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  } else {
    content = (
      <Shelf
        client={supabase}
        userId={session.user.id}
        email={session.user.email ?? ''}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>{content}</main>
    </div>
  );
}
