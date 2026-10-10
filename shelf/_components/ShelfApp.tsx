'use client';

import { useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import styles from '../shelf.module.css';
import { getSupabase } from '../_lib/supabaseClient';
import SignInForm from './SignInForm';
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return null;
      if (error.code === 'email_not_confirmed') return 'Confirm your email address first. The link was sent when you signed up.';
      if (error.code === 'over_request_rate_limit' || error.status === 429) return 'Too many attempts. Wait a minute and try again.';
      if (error.status === 400 || error.status === 401) return 'Email or password is incorrect.';
      return "Couldn't sign in. Try again in a moment.";
    } catch {
      return "Can't reach ShelfIt. Check your connection and try again.";
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
    content = <SignInForm onSignIn={handleSignIn} />;
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
