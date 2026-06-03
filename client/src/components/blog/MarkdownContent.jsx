/**
 * MarkdownContent — shared renderer used by both the editor preview panel
 * AND the public /blogs/:slug page. Keeps visual output identical.
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownContent.module.css';

export default function MarkdownContent({ content = '' }) {
  if (!content.trim()) {
    return (
      <p className={styles.empty}>
        Start typing in the editor to see a live preview here…
      </p>
    );
  }

  return (
    <div className={styles.prose}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
