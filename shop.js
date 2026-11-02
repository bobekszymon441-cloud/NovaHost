// Zmień ścieżki importów tylko jeśli Twoje pliki V3 używają innego układu.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './shop-config.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const status = document.querySelector('#status');
const buttons = [...document.querySelectorAll('[data-plan]')];
buttons.forEach(button => button.addEventListener('click', async () => {
  buttons.forEach(b => b.disabled = true);
  status.textContent = 'Sprawdzam logowanie…';
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { status.textContent = 'Zaloguj się, aby zamówić.'; return; }
    const plan = button.dataset.plan;
    const { error } = await supabase.from('orders').insert({ plan });
    if (error) throw error;
    status.textContent = `Zamówienie testowe ${plan} zapisane! Nie pobrano żadnych pieniędzy.`;
  } catch (error) { status.textContent = `Nie udało się zapisać zamówienia: ${error.message}`; }
  finally { buttons.forEach(b => b.disabled = false); }
}));
