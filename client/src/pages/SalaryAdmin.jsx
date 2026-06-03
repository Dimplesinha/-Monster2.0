import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './SalaryAdmin.module.css';

/* ── Icons ─────────────────────────────────────────────────────────── */
function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function UploadIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function ChevronLeftIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevronRightIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>;
}

/* ── Helpers ────────────────────────────────────────────────────────── */
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const EMPTY_FORM = {
  jobTitle: '', location: '', averageSalary: '', minSalary: '',
  medianSalary: '', maxSalary: '', currency: 'INR', source: 'Monster India',
};

function fmtNum(n) {
  return n?.toLocaleString('en-IN') ?? '—';
}

function parseCsv(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]; });
    return {
      jobTitle:      obj.job_title      || obj.jobtitle      || '',
      location:      obj.location       || '',
      averageSalary: Number(obj.average_salary || obj.averagesalary || 0),
      minSalary:     Number(obj.min_salary     || obj.minsalary     || 0),
      medianSalary:  Number(obj.median_salary  || obj.mediansalary  || 0),
      maxSalary:     Number(obj.max_salary     || obj.maxsalary     || 0),
      currency:      obj.currency || 'INR',
      source:        obj.source   || 'Monster India',
    };
  }).filter((r) => r.jobTitle && r.location);
}

/* ── Record Form Modal ──────────────────────────────────────────────── */
function RecordModal({ record, onClose, onSave }) {
  const isEdit = !!record?._id;
  const [form,   setForm]   = useState(record ? { ...record, averageSalary: record.averageSalary, minSalary: record.minSalary, medianSalary: record.medianSalary, maxSalary: record.maxSalary } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.jobTitle.trim())       e.jobTitle      = 'Required';
    if (!form.location.trim())       e.location      = 'Required';
    if (!form.averageSalary)         e.averageSalary = 'Required';
    if (!form.minSalary)             e.minSalary     = 'Required';
    if (!form.medianSalary)          e.medianSalary  = 'Required';
    if (!form.maxSalary)             e.maxSalary     = 'Required';
    if (Number(form.minSalary) > Number(form.maxSalary)) e.minSalary = 'Min > Max';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        averageSalary: Number(form.averageSalary),
        minSalary:     Number(form.minSalary),
        medianSalary:  Number(form.medianSalary),
        maxSalary:     Number(form.maxSalary),
      };
      if (isEdit) {
        const { data } = await api.put(`/salary/${form._id}`, payload);
        onSave(data.record, false);
      } else {
        const { data } = await api.post('/salary', payload);
        onSave(data.record, true);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const numField = (label, key) => (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label} *</label>
      <input
        type="number" min="0"
        className={`${styles.formInput} ${errors[key] ? styles.formInputError : ''}`}
        value={form[key]}
        onChange={(e) => { set(key, e.target.value); setErrors((v) => ({ ...v, [key]: '' })); }}
      />
      {errors[key] && <span className={styles.formErr}>{errors[key]}</span>}
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>{isEdit ? 'Edit Record' : 'Add Salary Record'}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Job Title *</label>
              <input className={`${styles.formInput} ${errors.jobTitle ? styles.formInputError : ''}`}
                value={form.jobTitle} onChange={(e) => { set('jobTitle', e.target.value); setErrors((v) => ({...v, jobTitle: ''})); }} />
              {errors.jobTitle && <span className={styles.formErr}>{errors.jobTitle}</span>}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Location *</label>
              <input className={`${styles.formInput} ${errors.location ? styles.formInputError : ''}`}
                value={form.location} onChange={(e) => { set('location', e.target.value); setErrors((v) => ({...v, location: ''})); }} />
              {errors.location && <span className={styles.formErr}>{errors.location}</span>}
            </div>
            {numField('Average Salary', 'averageSalary')}
            {numField('Min Salary',     'minSalary')}
            {numField('Median Salary',  'medianSalary')}
            {numField('Max Salary',     'maxSalary')}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Currency</label>
              <select className={styles.formInput} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Source</label>
              <input className={styles.formInput} value={form.source} onChange={(e) => set('source', e.target.value)} />
            </div>
          </div>

          {errors.submit && <p className={styles.submitErr}>{errors.submit}</p>}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── CSV Import Modal ───────────────────────────────────────────────── */
function CsvModal({ onClose, onImport }) {
  const [csv,     setCsv]     = useState('');
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const handlePreview = () => {
    const rows = parseCsv(csv);
    if (!rows.length) { setError('No valid rows parsed. Check your CSV format.'); return; }
    setError('');
    setPreview(rows);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setLoading(true);
    try {
      const { data } = await api.post('/salary/bulk', { records: preview });
      setResult(data);
      onImport();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalLg}`} role="dialog" aria-labelledby="csv-title">
        <div className={styles.modalHeader}>
          <h2 id="csv-title" className={styles.modalTitle}>Bulk Import via CSV</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.csvHelp}>
          <p>Expected CSV columns (header row required):</p>
          <code>job_title, location, average_salary, min_salary, median_salary, max_salary, currency, source</code>
        </div>

        <textarea
          className={styles.csvArea}
          placeholder="Paste CSV content here…"
          value={csv}
          onChange={(e) => { setCsv(e.target.value); setPreview([]); setResult(null); setError(''); }}
          rows={8}
        />

        {error && <p className={styles.submitErr}>{error}</p>}

        {result && (
          <p className={styles.importSuccess}>✓ Successfully imported {result.inserted} records.</p>
        )}

        {preview.length > 0 && !result && (
          <div className={styles.csvPreview}>
            <p className={styles.previewLabel}>{preview.length} rows ready to import:</p>
            <div className={styles.previewScroll}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>Job Title</th><th>Location</th><th>Avg</th><th>Min</th><th>Median</th><th>Max</th><th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td>{r.jobTitle}</td><td>{r.location}</td>
                      <td>{r.averageSalary}</td><td>{r.minSalary}</td>
                      <td>{r.medianSalary}</td><td>{r.maxSalary}</td><td>{r.currency}</td>
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr><td colSpan={7} className={styles.moreRows}>…and {preview.length - 5} more rows</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>Close</button>
          {!result && (
            <>
              <button className={styles.btnOutline} onClick={handlePreview} disabled={!csv.trim()}>
                Preview
              </button>
              <button className={styles.btnSave} onClick={handleImport} disabled={!preview.length || loading}>
                {loading ? 'Importing…' : `Import ${preview.length || ''} Records`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirmation ─────────────────────────────────────────────── */
function DeleteConfirm({ record, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/salary/${record._id}`);
      onDeleted(record._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalSm}`} role="dialog">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Delete Record?</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.deleteBody}>
          <p>Are you sure you want to delete the salary record for</p>
          <p className={styles.deleteTarget}><strong>{record.jobTitle}</strong> in <strong>{record.location}</strong>?</p>
          <p className={styles.deleteWarn}>This action cannot be undone.</p>
        </div>
        {error && <p className={styles.submitErr}>{error}</p>}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnDelete} onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Admin Page ─────────────────────────────────────────────────── */
export default function SalaryAdmin() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [records,  setRecords]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [search,   setSearch]   = useState('');
  const [dSearch,  setDSearch]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [editRec,   setEditRec]   = useState(null);  // null = closed, {} = new, record = edit
  const [deleteRec, setDeleteRec] = useState(null);
  const [showCsv,   setShowCsv]   = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [dSearch]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/salary', { params: { search: dSearch, page, limit: 20 } });
      setRecords(data.records);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, [dSearch, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = (record, isNew) => {
    if (isNew) {
      setRecords((prev) => [record, ...prev]);
      setTotal((t) => t + 1);
    } else {
      setRecords((prev) => prev.map((r) => r._id === record._id ? record : r));
    }
  };

  const handleDeleted = (id) => {
    setRecords((prev) => prev.filter((r) => r._id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div className={styles.page}>

      {/* ── Top nav ───────────────────────────────────────────── */}
      <header className={styles.topNav}>
        <Link to="/dashboard" className={styles.brand}>Monster Admin</Link>
        <nav className={styles.navLinks}>
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/salary-calculator" className={styles.navLink} target="_blank">Salary Tool ↗</Link>
        </nav>
        <div className={styles.navRight}>
          <span className={styles.adminBadge}>Admin: {user?.name}</span>
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </header>

      {/* ── Page body ─────────────────────────────────────────── */}
      <main className={styles.body}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Salary Data Management</h1>
            <p className={styles.pageSub}>{total} records total</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnImport} onClick={() => setShowCsv(true)}>
              <UploadIcon /> Bulk Import CSV
            </button>
            <button className={styles.btnAdd} onClick={() => setEditRec({})}>
              <PlusIcon /> Add Record
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <SearchIcon />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search by job title or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search salary records"
            />
          </div>
        </div>

        {/* Error */}
        {error && <p className={styles.errMsg}>{error}</p>}

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Currency</th>
                <th className={styles.numCol}>Average</th>
                <th className={styles.numCol}>Min</th>
                <th className={styles.numCol}>Median</th>
                <th className={styles.numCol}>Max</th>
                <th>Source</th>
                <th className={styles.actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className={styles.loadingCell}>
                    <div className={styles.spinner} />
                  </td>
                </tr>
              )}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    {dSearch ? `No records match "${dSearch}"` : 'No salary records yet. Add one or import CSV.'}
                  </td>
                </tr>
              )}
              {!loading && records.map((r) => (
                <tr key={r._id} className={styles.dataRow}>
                  <td className={styles.titleCell}>{r.jobTitle}</td>
                  <td>{r.location}</td>
                  <td><span className={styles.currencyBadge}>{r.currency}</span></td>
                  <td className={styles.numCol}>{fmtNum(r.averageSalary)}</td>
                  <td className={styles.numCol}>{fmtNum(r.minSalary)}</td>
                  <td className={styles.numCol}>{fmtNum(r.medianSalary)}</td>
                  <td className={styles.numCol}>{fmtNum(r.maxSalary)}</td>
                  <td className={styles.sourceCell}>{r.source}</td>
                  <td className={styles.actionsCell}>
                    <button className={styles.editBtn} onClick={() => setEditRec(r)} aria-label="Edit">
                      <EditIcon />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteRec(r)} aria-label="Delete">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon />
            </button>
            <span className={styles.pageInfo}>Page {page} of {pages}</span>
            <button className={styles.pageBtn} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────── */}
      {editRec !== null && (
        <RecordModal
          record={editRec._id ? editRec : null}
          onClose={() => setEditRec(null)}
          onSave={handleSave}
        />
      )}
      {deleteRec && (
        <DeleteConfirm
          record={deleteRec}
          onClose={() => setDeleteRec(null)}
          onDeleted={handleDeleted}
        />
      )}
      {showCsv && (
        <CsvModal
          onClose={() => setShowCsv(false)}
          onImport={fetchRecords}
        />
      )}
    </div>
  );
}
