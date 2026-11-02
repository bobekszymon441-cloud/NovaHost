'use strict';
(() => {
  const status = document.getElementById('status');
  const rootContent = document.getElementById('root-content');
  const cfg = window.NOVAHOST_CONFIG;
  const ok = cfg && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl) &&
    /^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(cfg.supabaseAnonKey);
  if (!ok || !window.supabase) {
    status.textContent = 'Nieprawidłowa konfiguracja Supabase. Sprawdź config.js i połączenie z internetem.';
    return;
  }
  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const showError = msg => { rootContent.hidden = true; status.textContent = msg; };
  async function init() {
    try {
      // getUser weryfikuje sesję w Supabase Auth.
      const {data: userData, error: authError} = await client.auth.getUser();
      if (authError || !userData?.user) { location.replace('login.html'); return; }
      const user = userData.user;
      const {data: profile, error: profileError} = await client.from('profiles')
        .select('role').eq('id', user.id).single();
      if (profileError) throw profileError;
      if (profile?.role !== 'ROOT') {
        showError('Brak uprawnień ROOT. Wracasz do panelu klienta.');
        setTimeout(() => location.replace('panel.html'), 1200);
        return;
      }
      document.getElementById('admin-email').textContent = user.email || 'Administrator';
      rootContent.hidden = false;
      status.textContent = 'Uprawnienia ROOT potwierdzone przez Supabase.';
      await loadUsers();
    } catch (e) { showError('Nie można zweryfikować uprawnień: ' + (e.message || 'Błąd połączenia')); }
  }
  async function loadUsers() {
    const tbody = document.getElementById('users-body');
    const info = document.getElementById('users-status');
    const {data, error} = await client.from('profiles').select('email,role,created_at').order('created_at', {ascending:false}).limit(100);
    if (error) { info.textContent = 'Nie można pobrać profili: ' + error.message; return; }
    tbody.replaceChildren();
    for (const p of data || []) {
      const tr = document.createElement('tr');
      for (const value of [p.email || '(brak)', p.role, new Date(p.created_at).toLocaleDateString('pl-PL')]) {
        const td = document.createElement('td'); td.textContent = value; tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    info.textContent = 'Wyświetlono ' + (data?.length || 0) + ' profili (maksymalnie 100).';
  }
  document.getElementById('logout').addEventListener('click', async () => {
    const btn = document.getElementById('logout'); btn.disabled = true;
    const {error} = await client.auth.signOut();
    if (error) { btn.disabled = false; status.textContent = 'Błąd wylogowania: ' + error.message; return; }
    location.replace('login.html');
  });
  client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') { rootContent.hidden = true; location.replace('login.html'); } });
  init();
})();
