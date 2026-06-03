import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const SavedJobsContext = createContext(null);

export function SavedJobsProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [count,    setCount]    = useState(0);
  const [loading,  setLoading]  = useState(false);

  const isJobseeker = user?.role === 'jobseeker';

  /* Load initial saved-job IDs (from a lightweight count + IDs fetch) */
  const refresh = useCallback(async () => {
    if (!isJobseeker) { setSavedIds(new Set()); setCount(0); return; }
    try {
      setLoading(true);
      // Fetch all saved jobs (just IDs) for client-side isSaved() checks
      const { data } = await api.get('/saved-jobs', { params: { limit: 500 } });
      const ids = new Set((data.savedJobs || []).map((s) => String(s.job._id)));
      setSavedIds(ids);
      setCount(data.pagination?.total ?? ids.size);
    } catch {
      // non-critical — don't crash the app
    } finally {
      setLoading(false);
    }
  }, [isJobseeker]);

  useEffect(() => { refresh(); }, [refresh]);

  const isSaved = useCallback((jobId) => savedIds.has(String(jobId)), [savedIds]);

  /* Optimistic toggle — rolls back on error */
  const toggleSave = useCallback(async (jobId) => {
    if (!isJobseeker) return;
    const id = String(jobId);
    const wasSaved = savedIds.has(id);

    // optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(id) : next.add(id);
      return next;
    });
    setCount((c) => wasSaved ? c - 1 : c + 1);

    try {
      if (wasSaved) {
        await api.delete(`/saved-jobs/${id}`);
      } else {
        await api.post('/saved-jobs', { jobId: id });
      }
    } catch {
      // rollback
      setSavedIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(id) : next.delete(id);
        return next;
      });
      setCount((c) => wasSaved ? c + 1 : c - 1);
    }
  }, [isJobseeker, savedIds]);

  return (
    <SavedJobsContext.Provider value={{ savedIds, count, loading, isSaved, toggleSave, refresh }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export const useSavedJobs = () => useContext(SavedJobsContext);
