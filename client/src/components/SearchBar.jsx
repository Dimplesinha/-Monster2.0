import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

export default function SearchBar({ initialKeyword = '', initialLocation = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <input
        className={styles.input}
        type="text"
        placeholder="Search jobs, keywords, companies"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        aria-label="Job title, keywords, or company"
      />
      <div className={styles.divider} aria-hidden="true" />
      <input
        className={styles.input}
        type="text"
        placeholder='Enter location or "remote"'
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label="Location"
      />
      <button className={styles.btn} type="submit" aria-label="Search jobs">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
