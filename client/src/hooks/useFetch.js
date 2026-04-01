import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFetch = (url, params = {}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(url, { params });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (url) refetch(); }, [url]);

  return { data, loading, error, refetch };
};
