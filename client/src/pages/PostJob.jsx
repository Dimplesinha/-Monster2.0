import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Auth.module.css';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    remote: false, salary: '', description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/jobs', form);
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page} style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className={styles.card} style={{ maxWidth: 600 }}>
        <h1 className={styles.heading}>Post a Job</h1>
        <p className={styles.sub}>Fill in the details below. Required fields are marked *</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Job Title *<input className={styles.input} name="title" value={form.title} onChange={handleChange} required /></label>
          <label className={styles.label}>Company *<input className={styles.input} name="company" value={form.company} onChange={handleChange} required /></label>
          <label className={styles.label}>Location *<input className={styles.input} name="location" value={form.location} onChange={handleChange} required /></label>
          <label className={styles.label}>
            Job Type *
            <select className={styles.input} name="type" value={form.type} onChange={handleChange}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className={styles.label} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} />
            Remote position
          </label>
          <label className={styles.label}>Salary (e.g. $80k–$100k)<input className={styles.input} name="salary" value={form.salary} onChange={handleChange} /></label>
          <label className={styles.label}>
            Description *
            <textarea
              className={styles.input}
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              required
              style={{ resize: 'vertical' }}
            />
          </label>
          <button className={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Posting…' : 'Post Job'}
          </button>
        </form>
      </div>
    </main>
  );
}
