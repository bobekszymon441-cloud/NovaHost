"use strict";
const cfg = window.NOVAHOST_CONFIG;
const validConfig = Boolean(cfg && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl) && /^sb_publishable_[A-Za-z0-9_-]+$/.test(cfg.supabaseAnonKey));
const supabaseClient = validConfig && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
const baseUrl = new URL('./', location.href).href;
function statusMessage(message, error=false){const el=document.getElementById('status');if(el){el.textContent=message;el.className='status'+(error?' error':'');}}
function ready(){if(!supabaseClient){statusMessage('Brak konfiguracji Supabase. Ustaw publiczny klucz w config.js.',true);return false;}return true;}
function setBusy(value){document.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=value);}
async function register(event){event.preventDefault();if(!ready())return;const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;setBusy(true);try{const {data,error}=await supabaseClient.auth.signUp({email,password,options:{emailRedirectTo:baseUrl+'login.html'}});if(error)throw error;statusMessage(data.session?'Konto utworzone. Możesz się zalogować.':'Sprawdź e-mail, potwierdź konto i zaloguj się.');}catch(e){statusMessage(e.message||'Błąd rejestracji.',true);}finally{setBusy(false);}}
async function login(event){event.preventDefault();if(!ready())return;setBusy(true);try{const {error}=await supabaseClient.auth.signInWithPassword({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value});if(error)throw error;location.replace('panel.html');}catch(e){statusMessage(e.message||'Błąd logowania.',true);}finally{setBusy(false);}}
let authSubscription;
let panelAuthorized=false;
function showLoggedOut(){panelAuthorized=false;document.getElementById('private-panel').hidden=true;location.replace('login.html');}
function showUser(user){if(!user){showLoggedOut();return;}panelAuthorized=true;document.getElementById('user-email').textContent=user.email||'Klient';document.getElementById('private-panel').hidden=false;statusMessage('');}
async function loadPanel(){
 const privatePanel=document.getElementById('private-panel');privatePanel.hidden=true;
 if(!ready())return;
 statusMessage('Sprawdzanie sesji…');
 try{
  const {data,error}=await supabaseClient.auth.getUser();
  if(error){if(/session missing|auth session missing|invalid refresh token|refresh token not found/i.test(error.message||'')){showLoggedOut();return;}throw error;}
  if(!data?.user){showLoggedOut();return;}
  showUser(data.user);
  const {data:listener}=supabaseClient.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'){showLoggedOut();return;}
   if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED'){
    if(session?.user)showUser(session.user);
   }
  });
  authSubscription=listener?.subscription;
 }catch(e){privatePanel.hidden=true;statusMessage('Nie można sprawdzić sesji. Sprawdź internet i spróbuj ponownie. '+(e.message||''),true);document.getElementById('retry').hidden=false;}
}
async function logout(){if(!ready())return;const btn=document.getElementById('logout');if(btn)btn.disabled=true;try{const {error}=await supabaseClient.auth.signOut();if(error)throw error;showLoggedOut();}catch(e){statusMessage('Nie udało się wylogować: '+e.message,true);if(btn)btn.disabled=false;}}
window.addEventListener('pagehide',()=>authSubscription?.unsubscribe());
