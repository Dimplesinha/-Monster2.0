import { useState, useRef, useCallback } from 'react';
import styles from './TagInput.module.css';

/**
 * TagInput — chip-style tag entry.
 * Props:
 *   tags: string[]
 *   onChange: (tags: string[]) => void
 *   disabled?: boolean
 *   max?: number  (default 10)
 */
export default function TagInput({ tags = [], onChange, disabled = false, max = 10 }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  /** Normalise one raw string into a clean tag slug (max 30 chars). */
  const normalise = (raw) =>
    raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30);

  /** Add one or more tags from a raw string (may be comma-separated). */
  const addTags = useCallback((raw) => {
    const parts = raw.split(',').map(normalise).filter(Boolean);
    if (!parts.length) { setInputVal(''); return; }

    const next = [...tags];
    for (const val of parts) {
      if (next.length >= max) break;
      if (!next.includes(val)) next.push(val);
    }
    onChange(next);
    setInputVal('');
  }, [tags, onChange, max]);

  const removeTag = useCallback((tag) => {
    onChange(tags.filter((t) => t !== tag));
  }, [tags, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags(inputVal);
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={`${styles.wrap} ${disabled ? styles.wrapDisabled : ''}`}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag} className={styles.chip}>
          #{tag}
          {!disabled && (
            <button
              type="button"
              className={styles.chipRemove}
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          )}
        </span>
      ))}

      {!disabled && tags.length < max && (
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTags(inputVal)}
          placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)' : 'Add tag…'}
          aria-label="Add tag"
        />
      )}

      {tags.length >= max && (
        <span className={styles.maxNote}>Max {max} tags</span>
      )}
    </div>
  );
}
