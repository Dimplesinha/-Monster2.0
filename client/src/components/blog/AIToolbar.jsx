/**
 * AIToolbar — Sprint 3: wired to POST /api/blogs/:id/ai (Gemini backend).
 *
 * Props:
 *   blogId:    string | null   (null = new unsaved blog → buttons disabled)
 *   content:   string          (current editor content)
 *   onResult:  ({ title?, content?, description? }) => void
 *   disabled:  boolean         (true when blog is published)
 */
import { useState } from 'react';
import api from '../../api/axios';
import styles from './AIToolbar.module.css';

const TONES = ['Professional', 'Friendly', 'Concise'];

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.5 5H18l-4 3 1.5 5L12 13l-3.5 3L10 11 6 8h4.5z"/>
    </svg>
  );
}

export default function AIToolbar({ blogId, content, onResult, disabled }) {
  const [topic,       setTopic]       = useState('');
  const [toneOpen,    setToneOpen]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [activeAction,setActiveAction]= useState('');   // which button is spinning
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');   // flash message after AI returns

  const handleAction = async (action, extra = {}) => {
    if (!blogId || disabled || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    setActiveAction(action);

    try {
      const { data } = await api.post(`/blogs/${blogId}/ai`, { action, ...extra });
      onResult(data.result);                     // push title/content/description into editor
      const LABELS = {
        generate_draft: 'Draft generated!',
        improve:        'Writing improved!',
        rewrite_tone:   'Tone rewritten!',
        summarize:      'Description updated!',
      };
      setSuccess(LABELS[action] || 'Done!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'AI request failed. Please try again.');
    } finally {
      setLoading(false);
      setActiveAction('');
    }
  };

  return (
    <div className={`${styles.toolbar} ${disabled ? styles.toolbarDisabled : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}><SparkleIcon /></span>
        <span className={styles.headerLabel}>AI Writing Tools</span>
        {!blogId && (
          <span className={styles.headerHint}>Save draft first to enable AI</span>
        )}
      </div>

      {/* Topic input — used by Generate Draft */}
      <div className={styles.topicRow}>
        <input
          type="text"
          className={styles.topicInput}
          placeholder="Topic or idea for Generate Draft…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={disabled || !blogId || loading}
          aria-label="Blog topic or idea"
        />
      </div>

      {/* Action buttons */}
      <div className={styles.btnGrid}>
        <button
          type="button"
          className={`${styles.aiBtn} ${activeAction === 'generate_draft' ? styles.aiBtnActive : ''}`}
          onClick={() => handleAction('generate_draft', { prompt: topic })}
          disabled={disabled || !blogId || loading || !topic.trim()}
          title="Generate a full blog draft from your topic"
        >
          {activeAction === 'generate_draft' ? '↻ Generating…' : '✨ Generate Draft'}
        </button>

        <button
          type="button"
          className={`${styles.aiBtn} ${activeAction === 'improve' ? styles.aiBtnActive : ''}`}
          onClick={() => handleAction('improve')}
          disabled={disabled || !blogId || loading || !content.trim()}
          title="Improve writing quality of the entire post"
        >
          {activeAction === 'improve' ? '↻ Improving…' : '📝 Improve Writing'}
        </button>

        {/* Rewrite Tone — dropdown */}
        <div className={styles.toneWrap}>
          <button
            type="button"
            className={`${styles.aiBtn} ${activeAction === 'rewrite_tone' ? styles.aiBtnActive : ''}`}
            onClick={() => setToneOpen((v) => !v)}
            disabled={disabled || !blogId || loading || !content.trim()}
            aria-haspopup="listbox"
            aria-expanded={toneOpen}
            title="Rewrite in a different tone"
          >
            {activeAction === 'rewrite_tone' ? '↻ Rewriting…' : '🎨 Rewrite Tone ▾'}
          </button>
          {toneOpen && (
            <ul className={styles.toneMenu} role="listbox" aria-label="Select tone">
              {TONES.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    className={styles.toneOption}
                    role="option"
                    onClick={() => {
                      setToneOpen(false);
                      handleAction('rewrite_tone', { tone: t.toLowerCase() });
                    }}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          className={`${styles.aiBtn} ${activeAction === 'summarize' ? styles.aiBtnActive : ''}`}
          onClick={() => handleAction('summarize')}
          disabled={disabled || !blogId || loading || !content.trim()}
          title="Generate a short description from your content"
        >
          {activeAction === 'summarize' ? '↻ Summarizing…' : '💡 Summarize'}
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <p className={styles.loadingMsg}>✦ AI is thinking…</p>
      )}

      {/* Success flash */}
      {success && !loading && (
        <div className={styles.successBanner}>
          ✓ {success}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className={styles.errorBanner}>
          {error}
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError('')}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
