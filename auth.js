const cfg = window.NOVAHOST_CONFIG;
const validConfig = cfg && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl) && cfg.supabaseAnonKey?.startsWith('sb_publishable_');
const supabaseClient = validConfig && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
function statusMessage(message, error=false){const el=document.getElementById('status');if(el){el.textContent=message;el.className='status'+(error?' error':'');}}
function ready(){if(!supabaseClient){statusMessage('Najpierw ustaw publiczny klucz Supabase w config.js.',true);return false;}return true;}
function setBusy(value){document.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=value);}
const baseUrl = new URL('./',location.href).href;
async function register(event){event.preventDefault();if(!ready())return;const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;setBusy(true);try{const {data,error}=await supabaseClient.auth.signUp({email,password,options:{emailRedirectTo:baseUrl+'login.html'}});if(error)throw error;statusMessage(data.session?'Konto utworzone. Możesz otworzyć panel.':'Sprawdź skrzynkę e-mail i potwierdź konto. Następnie się zaloguj.');}catch(e){statusMessage(e.message,true);}finally{setBusy(false);}}
async function login(event){event.preventDefault();if(!ready())return;setBusy(true);try{const {error}=await supabaseClient.auth.signInWithPassword({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value});if(error)throw error;location.href='panel.html';}catch(e){statusMessage(e.message,true);}finally{setBusy(false);}}
async function loadPanel(){if(!ready())return;const {data,error}=await supabaseClient.auth.getUser();if(error||!data.user){location.replace('login.html');return;}document.getElementById('user-email').textContent=data.user.email||'Klient';document.getElementById('private-panel').hidden=false;}
async function logout(){if(!ready())return;await supabaseClient.auth.signOut();location.replace('login.html');}
