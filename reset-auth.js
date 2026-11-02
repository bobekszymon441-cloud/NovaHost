// Uses existing config.js: window.NOVAHOST_CONFIG = {supabaseUrl, supabaseAnonKey}
window.novaResetClient = function () {
  const cfg = window.NOVAHOST_CONFIG;
  if (!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) throw new Error('Brak konfiguracji Supabase w config.js');
  if (!window.supabase?.createClient) throw new Error('Nie udało się wczytać biblioteki Supabase');
  return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, storageKey: 'novahost-password-reset' }
  });
};
