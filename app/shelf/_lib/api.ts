import type { SupabaseClient } from '@supabase/supabase-js';
import type { SaveRow } from './types';
import { normaliseUrl } from './links';

export const PAGE_SIZE = 1000;      // Supabase returns at most 1,000 rows per request
export const MAX_SAVES = 5000;      // how many the page loads in one go
export const SAVE_LIMIT = 20000;    // the per-person limit used by the app

// Loads this person's saves, newest first, in pages.
export async function loadSaves(
  client: SupabaseClient,
  userId: string
): Promise<{ saves: SaveRow[]; truncated: boolean }> {
  const saves: SaveRow[] = [];
  while (saves.length < MAX_SAVES) {
    const from = saves.length;
    const { data, error } = await client
      .from('saves')
      .select('*, links(*)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = (data ?? []) as unknown as SaveRow[];
    saves.push(...rows);
    if (rows.length < PAGE_SIZE) return { saves, truncated: false };
  }
  return { saves, truncated: true };
}

// Removes the link from this person's shelf only. The shared link record stays.
export async function deleteSave(client: SupabaseClient, userId: string, saveId: string): Promise<void> {
  const { error } = await client.from('saves').delete().eq('id', saveId).eq('user_id', userId);
  if (error) throw error;
}

export type AddResult =
  | { status: 'saved'; processed: boolean }
  | { status: 'duplicate' }
  | { status: 'limit' }
  | { status: 'invalid'; reason: 'empty' | 'invalid' };

// The same steps as the app and the browser extension:
// check the limit, find or create the shared link, add it to this shelf,
// then ask process-link for the title, summary and category.
export async function addLink(
  client: SupabaseClient,
  userId: string,
  rawUrl: string,
  onProgress?: (phase: 'saving' | 'summarising') => void
): Promise<AddResult> {
  const checked = normaliseUrl(rawUrl);
  if (!checked.ok) return { status: 'invalid', reason: checked.reason };
  const url = checked.url;

  onProgress?.('saving');

  const { count, error: countError } = await client
    .from('saves')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (!countError && count !== null && count >= SAVE_LIMIT) return { status: 'limit' };

  const { data: found, error: findError } = await client.from('links').select('id').eq('url', url).limit(1);
  if (findError) throw findError;
  let linkId: string | undefined = found?.[0]?.id;

  if (linkId) {
    const { data: already, error: alreadyError } = await client
      .from('saves')
      .select('id')
      .eq('link_id', linkId)
      .eq('user_id', userId)
      .limit(1);
    if (alreadyError) throw alreadyError;
    if (already && already.length > 0) return { status: 'duplicate' };
  } else {
    const { data: created, error: createError } = await client
      .from('links')
      .insert({ url, title: url })
      .select('id')
      .single();
    if (createError) throw createError;
    linkId = created?.id;
    if (!linkId) throw new Error('save-failed');
  }

  const { error: saveError } = await client.from('saves').insert({ link_id: linkId, user_id: userId });
  if (saveError) {
    if ((saveError as { code?: string }).code === '23505') return { status: 'duplicate' };
    throw saveError;
  }

  onProgress?.('summarising');
  let processed = false;
  try {
    const { data, error } = await client.functions.invoke('process-link', { body: { link_id: linkId, url } });
    processed = !error && Boolean(data) && data.success !== false;
  } catch {
    processed = false;
  }
  return { status: 'saved', processed };
}
