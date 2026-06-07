import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ResumePreview from '../components/ResumePreview';
import TemplatePreviewModal from '../components/TemplatePreviewModal';
import styles from './ResumeTemplates.module.css';

/* ── Icons ────────────────────────────────────────────────────────── */
function MagnifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 14, height: 14 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

/* ── Template Card ────────────────────────────────────────────────── */
function TemplateCard({ template, onPreview, onCustomize }) {
  const levelColors = { Entry: '#16a34a', 'Mid-Level': '#2563eb', Senior: '#7c3aed', Executive: '#dc2626', 'All Levels': '#6b7280' };

  return (
    <div className={styles.card} role="article">
      {/* Thumbnail */}
      <div className={styles.thumbnailWrap}>
        {/* Actual scaled-down preview */}
        <div className={styles.thumbnailOuter}>
          <div className={styles.thumbnailScaler}>
            <ResumePreview template={template} useSample />
          </div>
        </div>

        {/* Badges */}
        <div className={styles.badges}>
          <span className={styles.atsBadge}>ATS {template.atsScore}%</span>
          {template.isPremium
            ? <span className={styles.premiumBadge}>⭐ Premium</span>
            : <span className={styles.freeBadge}>Free</span>}
        </div>

        {/* Hover overlay with actions */}
        <div className={styles.overlay}>
          <button className={styles.previewBtn} onClick={() => onPreview(template)} aria-label={`Preview ${template.name}`}>
            <MagnifyIcon /> Preview
          </button>
          <button className={styles.customizeBtn} onClick={() => onCustomize(template)} aria-label={`Customize ${template.name}`}>
            Customize
          </button>
        </div>
      </div>

      {/* Card info */}
      <div className={styles.cardInfo}>
        <h3 className={styles.cardName}>{template.name}</h3>
        <div className={styles.cardMeta}>
          <span style={{ color: levelColors[template.experienceLevel] || '#6b7280', fontWeight: 600, fontSize: '0.75rem' }}>
            {template.experienceLevel}
          </span>
          <span className={styles.cardDot}>·</span>
          <span className={styles.cardStyle}>{template.style}</span>
        </div>
        <div className={styles.cardCategories}>
          {template.category?.slice(0, 2).map((cat) => (
            <span key={cat} className={styles.catChip}>{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Filter Dropdown ──────────────────────────────────────────────── */
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.filterWrap} onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <button
        className={`${styles.filterBtn} ${value ? styles.filterBtnActive : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value || label} <ChevronDown />
      </button>
      {open && (
        <div className={styles.filterMenu} role="listbox">
          <button className={styles.filterOption} role="option" onClick={() => { onChange(''); setOpen(false); }}>
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              className={`${styles.filterOption} ${value === opt ? styles.filterOptionActive : ''}`}
              role="option"
              aria-selected={value === opt}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function ResumeTemplates() {
  const navigate = useNavigate();

  const [templates, setTemplates]   = useState([]);
  const [total,     setTotal]       = useState(0);
  const [page,      setPage]        = useState(1);
  const [pages,     setPages]       = useState(1);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState('');
  const [preview,   setPreview]     = useState(null); // template being previewed in modal

  // Filters
  const [search,          setSearch]          = useState('');
  const [filterCategory,  setFilterCategory]  = useState('');
  const [filterLevel,     setFilterLevel]     = useState('');
  const [filterStyle,     setFilterStyle]     = useState('');
  const [filterLayout,    setFilterLayout]    = useState('');
  const [filterPremium,   setFilterPremium]   = useState('');

  // Meta options
  const [metaOptions, setMetaOptions] = useState({ categories: [], styles: [], layouts: [], experienceLevels: [] });

  /* Load meta options once */
  useEffect(() => {
    api.get('/resume-templates/meta/options')
      .then(({ data }) => setMetaOptions(data))
      .catch(() => {});
  }, []);

  /* Fetch templates */
  const fetchTemplates = useCallback((pg = 1) => {
    setLoading(true);
    setError('');
    const params = { page: pg, limit: 12 };
    if (search)         params.search         = search;
    if (filterCategory) params.category       = filterCategory;
    if (filterLevel)    params.experienceLevel = filterLevel;
    if (filterStyle)    params.style          = filterStyle;
    if (filterLayout)   params.layout         = filterLayout;
    if (filterPremium)  params.isPremium      = filterPremium;

    api.get('/resume-templates', { params })
      .then(({ data }) => {
        setTemplates(data.templates);
        setTotal(data.total);
        setPages(data.pages);
        setPage(pg);
      })
      .catch(() => setError('Failed to load templates. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, filterCategory, filterLevel, filterStyle, filterLayout, filterPremium]);

  useEffect(() => { fetchTemplates(1); }, [fetchTemplates]);

  const handleCustomize = (template) => {
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    navigate('/resume-builder/template-selection');
  };

  const activeFilters = [filterCategory, filterLevel, filterStyle, filterLayout, filterPremium].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCategory('');
    setFilterLevel('');
    setFilterStyle('');
    setFilterLayout('');
    setFilterPremium('');
    setSearch('');
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/resume-builder">Resume Builder</Link>
          <span aria-hidden="true"> / </span>
          <span>Resume Templates</span>
        </nav>
        <h1 id="hero-title" className={styles.heroTitle}>Free Resume Templates to Get You Hired Faster</h1>
        <p className={styles.heroSub}>
          Create a winning resume with Monster's 100% free resume templates. Import your current resume or build
          a new one—customize it easily, anywhere and anytime.
        </p>
        <div className={styles.heroCta}>
          <Link to="/resume-builder/upload" className={styles.ctaPrimary}>Improve My Resume</Link>
          <button className={styles.ctaSecondary} onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>
            Choose Free Template
          </button>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────────────────── */}
      <section id="gallery" className={styles.gallery}>

        {/* Filters bar */}
        <div className={styles.filtersBar}>
          <button className={`${styles.allFiltersBtn} ${activeFilters > 0 ? styles.allFiltersBtnActive : ''}`} onClick={clearFilters} aria-label="Clear all filters">
            <FilterIcon /> All Filters {activeFilters > 0 && <span className={styles.filterCount}>{activeFilters}</span>}
          </button>

          <div className={styles.filterGroup}>
            <FilterDropdown label="Career Field"  options={metaOptions.categories || []}      value={filterCategory} onChange={setFilterCategory} />
            <FilterDropdown label="Career Level"  options={metaOptions.experienceLevels || []} value={filterLevel}   onChange={setFilterLevel}   />
            <FilterDropdown label="Style"         options={metaOptions.styles || []}           value={filterStyle}   onChange={setFilterStyle}   />
            <FilterDropdown label="Layout"        options={['One Column', 'Two Column (Left Sidebar)', 'Two Column (Right Sidebar)', 'Header Band']}
                                                  value={filterLayout ? layoutLabel(filterLayout) : ''}
                                                  onChange={(v) => setFilterLayout(layoutKey(v))} />
            <FilterDropdown label="Plan"          options={['Free', 'Premium']} value={filterPremium === '' ? '' : filterPremium === 'false' ? 'Free' : 'Premium'}
                                                  onChange={(v) => setFilterPremium(v === '' ? '' : v === 'Free' ? 'false' : 'true')} />
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search templates"
            />
          </div>
        </div>

        {/* Count */}
        <p className={styles.countLine}>
          Choose from <strong>{total}</strong> ATS-friendly template{total !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={() => fetchTemplates(page)}>Retry</button>
          </div>
        ) : templates.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No templates match your filters.</p>
            <button className={styles.retryBtn} onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl._id}
                template={tpl}
                onPreview={setPreview}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => fetchTemplates(page - 1)}>← Prev</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                className={`${styles.pageBtn} ${pg === page ? styles.pageBtnActive : ''}`}
                onClick={() => fetchTemplates(pg)}
              >
                {pg}
              </button>
            ))}
            <button className={styles.pageBtn} disabled={page >= pages} onClick={() => fetchTemplates(page + 1)}>Next →</button>
          </div>
        )}
      </section>

      {/* ── Preview Modal ──────────────────────────────────────────── */}
      {preview && (
        <TemplatePreviewModal
          template={preview}
          templates={templates}
          onClose={() => setPreview(null)}
          onNavigate={setPreview}
        />
      )}
    </>
  );
}

function layoutLabel(key) {
  const map = { 'classic': 'One Column', 'modern-left': 'Two Column (Left Sidebar)', 'modern-right': 'Two Column (Right Sidebar)', 'header-band': 'Header Band' };
  return map[key] || key;
}
function layoutKey(label) {
  const map = { 'One Column': 'classic', 'Two Column (Left Sidebar)': 'modern-left', 'Two Column (Right Sidebar)': 'modern-right', 'Header Band': 'header-band' };
  return map[label] || '';
}
