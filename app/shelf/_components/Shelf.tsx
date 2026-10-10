'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import styles from '../shelf.module.css';
import Logo from './Logo';
import LinkCard from './LinkCard';
import { addLink, deleteSave, loadSaves, MAX_SAVES, SAVE_LIMIT } from '../_lib/api';
import { CATEGORIES, normaliseCategory } from '../_lib/links';
import { filterSaves } from '../_lib/searchLogic';
import type { SaveRow } from '../_lib/types';

interface Props {
  client: SupabaseClient;
  userId: string;
  email: string;
  onSignOut: () => void;
}

type Notice = { kind: 'info' | 'error'; text: string } | null;

export default function Shelf({ client, userId, email, onSignOut }: Props) {
  const [saves, setSaves] = useState<SaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const [addUrl, setAddUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [addNotice, setAddNotice] = useState<Notice>(null);

  const [listNotice, setListNotice] = useState<Notice>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(false);
    try {
      const result = await loadSaves(client, userId);
      setSaves(result.saves);
      setTruncated(result.truncated);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [client, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // The "Confirm delete" step times out so a stray click can't delete later.
  useEffect(() => {
    if (!confirmingId) return;
    const timer = setTimeout(() => setConfirmingId(null), 5000);
    return () => clearTimeout(timer);
  }, [confirmingId]);

  const shelved = useMemo(() => saves.filter((save) => save.links), [saves]);

  const categoriesPresent = useMemo(
    () => CATEGORIES.filter((c) => shelved.some((save) => normaliseCategory(save.links?.ai_category) === c)),
    [shelved]
  );
  const activeCategory = category === 'all' || categoriesPresent.includes(category as never) ? category : 'all';

  const visible = useMemo(() => filterSaves(shelved, activeCategory, query), [shelved, activeCategory, query]);
  const isFiltered = activeCategory !== 'all' || query.trim() !== '';

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (adding) return;
    setAdding(true);
    setAddNotice({ kind: 'info', text: 'Saving…' });
    try {
      const result = await addLink(client, userId, addUrl, (phase) =>
        setAddNotice({ kind: 'info', text: phase === 'saving' ? 'Saving…' : 'Writing the summary…' })
      );
      if (result.status === 'invalid') {
        setAddNotice({
          kind: 'error',
          text: result.reason === 'empty' ? 'Paste a link to save.' : "That doesn't look like a web address. Try something like example.com/page.",
        });
      } else if (result.status === 'duplicate') {
        setAddNotice({ kind: 'info', text: 'Already on your shelf.' });
        setAddUrl('');
      } else if (result.status === 'limit') {
        setAddNotice({
          kind: 'error',
          text: `Your shelf is full (${SAVE_LIMIT.toLocaleString('en-GB')} links). Delete some to save more.`,
        });
      } else {
        setAddNotice({
          kind: 'info',
          text: result.processed ? 'Saved to your shelf.' : "Saved. The summary couldn't be written this time.",
        });
        setAddUrl('');
        await refresh();
      }
    } catch {
      setAddNotice({ kind: 'error', text: "Couldn't save that link. Check your connection and try again." });
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(saveId: string) {
    if (confirmingId !== saveId) {
      setConfirmingId(saveId);
      return;
    }
    setConfirmingId(null);
    setListNotice(null);
    try {
      await deleteSave(client, userId, saveId);
      setSaves((current) => current.filter((save) => save.id !== saveId));
    } catch {
      setListNotice({ kind: 'error', text: "Couldn't delete that link. Try again." });
    }
  }

  const total = shelved.length;
  const countText = isFiltered
    ? `${visible.length} of ${total} ${total === 1 ? 'link' : 'links'}`
    : `${total} ${total === 1 ? 'link' : 'links'}`;

  return (
    <>
      <header className={styles.top}>
        <div className={styles.brand}>
          <Logo />
          <span className={styles.wordmark}>
            shelf<span className={styles.wordmarkIt}>It</span>
          </span>
        </div>
        <div className={styles.account}>
          <span className={styles.accountEmail}>{email}</span>
          <button type="button" className={styles.textButton} onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <h1 className={styles.srOnly}>Your shelf</h1>

      <form className={styles.addRow} onSubmit={handleAdd}>
        <input
          className={styles.input}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Paste a link to save"
          aria-label="Link to save"
          value={addUrl}
          onChange={(e) => setAddUrl(e.target.value)}
        />
        <button className={styles.primaryInline} type="submit" disabled={adding}>
          Save link
        </button>
      </form>
      <p
        className={`${styles.message} ${addNotice?.kind === 'error' ? styles.messageError : ''}`}
        role="status"
        aria-live="polite"
        hidden={!addNotice}
      >
        {addNotice?.text}
      </p>

      <input
        className={`${styles.input} ${styles.search}`}
        type="search"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Search your shelf"
        aria-label="Search your shelf"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {categoriesPresent.length > 0 ? (
        <div className={styles.pills} role="group" aria-label="Filter by category">
          {['all', ...categoriesPresent].map((c) => (
            <button
              key={c}
              type="button"
              className={styles.pill}
              aria-pressed={activeCategory === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {!loading && !loadError && total > 0 ? <p className={styles.count}>{countText}</p> : null}

      <p
        className={`${styles.message} ${listNotice?.kind === 'error' ? styles.messageError : ''}`}
        role="status"
        aria-live="polite"
        hidden={!listNotice}
      >
        {listNotice?.text}
      </p>

      <section aria-label="Saved links">
        {loading ? <p className={styles.empty}>Loading your shelf…</p> : null}

        {!loading && loadError ? (
          <div className={styles.empty}>
            <p>Couldn't load your shelf. Check your connection and try again.</p>
            <button type="button" className={styles.textButton} onClick={() => { setLoading(true); refresh(); }}>
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !loadError && total === 0 ? (
          <p className={styles.empty}>Nothing on your shelf yet. Paste a link above, or save one from the ShelfIt app.</p>
        ) : null}

        {!loading && !loadError && total > 0 && visible.length === 0 ? (
          <p className={styles.empty}>No links match your search.</p>
        ) : null}

        {visible.map((save) => (
          <LinkCard key={save.id} save={save} confirming={confirmingId === save.id} onDelete={handleDelete} />
        ))}

        {truncated ? (
          <p className={styles.count}>Showing your newest {MAX_SAVES.toLocaleString('en-GB')} links.</p>
        ) : null}
      </section>
    </>
  );
}
