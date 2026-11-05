import { api } from '@/api/platformClient';
export async function loginWithMfa(email, password) {
  const { error } = await (await import('@/api/platformClient')).supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { mfa_required: false };
}
export async function continueMfa(_result, returnTo = '/') { window.location.assign(returnTo); }
export async function loginWithSocial(provider, returnTo = '/') { return api.auth.loginWithProvider(provider, returnTo); }
export async function loginWithGoogle(returnTo = '/') { return loginWithSocial('google', returnTo); }
