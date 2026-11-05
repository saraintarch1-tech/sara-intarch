/**
 * API adapter for the existing website components.
 * The UI keeps its existing calls while all persistence/auth/storage run on Supabase.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

function client() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.');
  return supabase;
}

const table = 'app_records';
const normalize = (row) => row ? ({ id: row.id, ...row.data, created_date: row.created_at, updated_date: row.updated_at }) : null;
const matches = (row, filter = {}) => Object.entries(filter).every(([key, expected]) => {
  const value = row?.[key];
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    if ('$ne' in expected) return value !== expected.$ne;
    if ('$in' in expected) return expected.$in.includes(value);
    return true;
  }
  return value === expected;
});
const sortRows = (rows, sort) => {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return rows.sort((a, b) => {
    const av = a?.[key] ?? ''; const bv = b?.[key] ?? '';
    return (av > bv ? 1 : av < bv ? -1 : 0) * (desc ? -1 : 1);
  });
};

function entityApi(entity) {
  const read = async () => {
    const { data, error } = await client().from(table).select('*').eq('entity', entity);
    if (error) throw error;
    return (data || []).map(normalize);
  };
  const insert = async (payload) => {
    const { data, error } = await client().from(table).insert({ entity, data: payload }).select('*').single();
    if (error) throw error;
    return normalize(data);
  };
  return {
    list: async ({ sort, limit } = {}) => {
      let rows = sortRows(await read(), sort);
      if (limit) rows = rows.slice(0, limit);
      return rows;
    },
    filter: async (filter = {}, { sort, limit } = {}) => {
      let rows = sortRows((await read()).filter(row => matches(row, filter)), sort);
      if (limit) rows = rows.slice(0, limit);
      return rows;
    },
    get: async (id) => {
      const { data, error } = await client().from(table).select('*').eq('entity', entity).eq('id', id).single();
      if (error) throw error;
      return normalize(data);
    },
    create: insert,
    update: async (id, patch) => {
      const current = await entityApi(entity).get(id);
      const { data, error } = await client().from(table).update({ data: { ...current, ...patch, id: undefined, created_date: undefined, updated_date: undefined } }).eq('entity', entity).eq('id', id).select('*').single();
      if (error) throw error;
      return normalize(data);
    },
    delete: async (id) => {
      const { error } = await client().from(table).delete().eq('entity', entity).eq('id', id);
      if (error) throw error;
      return true;
    },
    count: async (filter = {}) => (await read()).filter(row => matches(row, filter)).length,
    bulkCreate: async (rows) => Promise.all(rows.map(insert)),
    bulkUpdate: async (rows) => Promise.all(rows.map(row => entityApi(entity).update(row.id, row))),
    deleteMany: async (filter = {}) => {
      const rows = (await read()).filter(row => matches(row, filter));
      await Promise.all(rows.map(row => entityApi(entity).delete(row.id)));
      return rows.length;
    },
  };
}

const entities = {};
['Project','Service','SiteContent','SiteDraft','ContactMessage','MediaAsset','StudioProfile','WatermarkAsset','WatermarkSettings'].forEach(name => { entities[name] = entityApi(name); });

export const api = {
  entities,
  auth: {
    me: async () => {
      const { data: { user }, error } = await client().auth.getUser();
      if (error || !user) throw error || new Error('Not signed in');
      return { id: user.id, email: user.email, role: user.app_metadata?.role || 'user', ...user.user_metadata };
    },
    isAuthenticated: async () => !!(await client().auth.getSession()).data.session,
    register: async ({ email, password }) => {
      const { data, error } = await client().auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    verifyOtp: async ({ email, otpCode }) => {
      const { data, error } = await client().auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      return { access_token: data.session?.access_token, user: data.user };
    },
    resendOtp: async (email) => {
      const { error } = await client().auth.resend({ type: 'signup', email });
      if (error) throw error;
    },
    setToken: async (token) => { // Supabase verifyOtp persists the complete session automatically.
      return token; },
    logout: async () => { await client().auth.signOut(); window.location.assign('/'); },
    redirectToLogin: (returnTo = '/admin') => window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`),
    loginWithProvider: async (provider, returnTo = '/') => {
      const { error } = await client().auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}${returnTo}` } });
      if (error) throw error;
    },
    resetPasswordRequest: async (email) => {
      const { error } = await client().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
    },
    resetPassword: async ({ newPassword }) => {
      const { error } = await client().auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
  },
  app: { getPublicSettings: async () => ({}) },
  integrations: { Core: {
    UploadPublicFile: async ({ file }) => {
      const path = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error } = await client().storage.from('site-media').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = client().storage.from('site-media').getPublicUrl(path);
      return { file_url: data.publicUrl };
    },
    UploadPrivateFile: async ({ file }) => {
      const path = `private/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
      const { error } = await client().storage.from('site-private').upload(path, file, { upsert: false });
      if (error) throw error;
      return { file_uri: path };
    },
    CreateFileSignedUrl: async ({ file_uri }) => {
      const { data, error } = await client().storage.from('site-private').createSignedUrl(file_uri, 3600);
      if (error) throw error;
      return { signed_url: data.signedUrl };
    },
  } },
};
