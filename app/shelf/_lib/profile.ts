import type { SupabaseClient, User } from '@supabase/supabase-js';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Cleans what someone types into the username box (same rule as the app).
export function cleanUsername(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

// True if nobody has this username. Null if we couldn't check.
export async function usernameIsFree(client: SupabaseClient, username: string): Promise<boolean | null> {
  try {
    const { data, error } = await client.from('users').select('username').eq('username', username).maybeSingle();
    if (error) return null;
    return !data;
  } catch {
    return null;
  }
}

// Saves the username and name chosen at sign-up onto the person's profile row, but
// only if the row doesn't have a username yet. Runs after sign-up and after sign-in,
// so it still works when the email has to be confirmed first. Never throws.
export async function saveProfile(client: SupabaseClient, user: User | null | undefined): Promise<void> {
  try {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as { username?: string; full_name?: string };
    if (!meta.username || !USERNAME_REGEX.test(meta.username)) return;

    const { data: row, error } = await client.from('users').select('username').eq('id', user.id).maybeSingle();
    if (error || !row || row.username) return;

    await client
      .from('users')
      .update({ username: meta.username, display_name: meta.full_name ?? null })
      .eq('id', user.id);
  } catch {
    // The shelf still works without a username, so don't interrupt the person.
  }
}
