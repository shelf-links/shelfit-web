import styles from '../shelf.module.css';
import type { SaveRow } from '../_lib/types';
import { hostOf, normaliseCategory, safeHref } from '../_lib/links';
import { getPlatformLabel } from '../_lib/platform';

interface Props {
  save: SaveRow;
  confirming: boolean;
  onDelete: (saveId: string) => void;
}

export default function LinkCard({ save, confirming, onDelete }: Props) {
  const link = save.links;
  if (!link) return null;

  const category = normaliseCategory(link.ai_category);
  const href = safeHref(link.url);
  const title = link.title?.trim() || link.url;

  return (
    <article className={styles.card} data-cat={category}>
      <div className={styles.cardTop}>
        <span className={styles.cardCategory}>{category}</span>
        <span className={styles.badge}>{getPlatformLabel(link.url)}</span>
      </div>

      <h2 className={styles.cardTitle}>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        ) : (
          title
        )}
      </h2>

      {link.ai_summary ? <p className={styles.cardSummary}>{link.ai_summary}</p> : null}

      <div className={styles.cardFoot}>
        <span className={styles.cardHost}>{hostOf(link.url)}</span>
        <button
          type="button"
          className={confirming ? styles.deleteConfirm : styles.textButton}
          onClick={() => onDelete(save.id)}
        >
          {confirming ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
