import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, supabase } from '@/api/platformClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({});

  const checkUserAuth = useCallback(async () => {
    try {
      const current = await api.auth.me();
      setUser(current); setIsAuthenticated(true); setAuthError(null);
      return current;
    } catch {
      setUser(null); setIsAuthenticated(false);
      return null;
    } finally { setIsLoadingAuth(false); setAuthChecked(true); }
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true);
    if (!supabase) {
      setAuthError({ type: 'configuration', message: 'Supabase environment variables are missing.' });
      setIsLoadingAuth(false); setAuthChecked(true); return;
    }
    await checkUserAuth();
  }, [checkUserAuth]);

  useEffect(() => {
    checkAppState();
    if (!supabase) return undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({ id: u.id, email: u.email, role: u.app_metadata?.role || 'user', ...u.user_metadata });
        setIsAuthenticated(true);
      } else { setUser(null); setIsAuthenticated(false); }
      setAuthChecked(true); setIsLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, [checkAppState]);

  const logout = async () => { await supabase?.auth.signOut(); setUser(null); setIsAuthenticated(false); window.location.assign('/'); };
  const navigateToLogin = () => api.auth.redirectToLogin(window.location.pathname || '/admin');

  return <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, appPublicSettings, authChecked, logout, navigateToLogin, checkUserAuth, checkAppState }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
