import { useState } from 'react';

export const useForm = (initial = {}) => {
  const [form, setForm] = useState(initial);

  const set = (field) => ({
    value: form[field] ?? '',
    onChange: (e) => setForm(prev => ({ ...prev, [field]: e.target.value })),
  });

  const reset = () => setForm(initial);
  const patch = (updates) => setForm(prev => ({ ...prev, ...updates }));

  return { form, set, reset, patch, setForm };
};
