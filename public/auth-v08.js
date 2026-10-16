/* Pattaya Dating v0.8 — real account beta. Public publishable key, never service_role. */
(function(){
'use strict';
const URL='https://toutlpurloxairobkbrb.supabase.co';
const KEY='sb_publishable_qEZIMICI9PhpkFptXEtsiA_1xn2nIQe';
let client,session=null,mode='signup';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=(msg,bad=false)=>{const e=$('pd-real-status');if(e){e.textContent=msg;e.style.color=bad?'#b91c1c':'#4e627c'}};
function ready(){if(!window.supabase?.createClient)return false;if(!client){client=window.supabase.createClient(URL,KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((_event,s)=>{session=s; if(accountView==='account')setTimeout(renderAccount,0)})}return true}
async function loadSession(){if(!ready())return;const {data}=await client.auth.getSession();session=data.session;if(accountView==='account')renderAccount()}
function renderAccount(){
 const root=$('content');if(!root||accountView!=='account')return;
 const box=document.createElement('section');box.className='panel';box.style.maxWidth='740px';
 root.replaceChildren(box);
 const header=document.createElement('div');header.className='pd-top';header.innerHTML='<div><span class="pd-kicker">SECURE ACCOUNT BETA</span><h2>Registration & sign in</h2><p class="muted">Supabase authentication • Pattaya Dating</p></div><span class="pd-demo">PRIVATE TEST</span>';box.append(header);
 if(!ready()){const x=document.createElement('p');x.textContent='Authentication library unavailable. Reload and check your internet connection.';box.append(x);return}
 if(session){
 box.insertAdjacentHTML('beforeend','<p class="muted" id="pd-current-user"></p><h3>Your saved profile</h3><form id="pd-real-profile"><div class="pd-two"><div class="pd-field"><label>Display name<input name="display_name" required minlength="2" maxlength="60"></label></div><div class="pd-field"><label>Date of birth<input name="birth_date" type="date" required></label></div></div><div class="pd-two"><div class="pd-field"><label>Area<select name="area">'+['Central Pattaya','Jomtien','Pratamnak','Naklua','South Pattaya','North Pattaya','Na Jomtien'].map(a=>'<option>'+a+'</option>').join('')+'</select></label></div><div class="pd-field"><label>Looking for<select name="looking_for">'+['Relationship','Dating','Friendship','Not sure yet'].map(a=>'<option>'+a+'</option>').join('')+'</select></label></div></div><div class="pd-field"><label>About me<textarea name="bio" maxlength="500" rows="4"></textarea></label></div><div class="pd-field"><label>Interests (separated by comma)<input name="interests" maxlength="160"></label></div><button class="primary" type="submit">Save to Supabase</button></form><p class="pd-help">Your account remains private and pending moderation. This is not a public profile.</p><button id="pd-real-logout" class="pd-outline">Sign out</button>');
 $('pd-current-user').textContent='Signed in: '+(session.user.email||'Account');
 $('pd-real-logout').addEventListener('click',async()=>{await client.auth.signOut();session=null;renderAccount()});
 $('pd-real-profile').addEventListener('submit',saveProfile);
 loadProfile(); 
 }else{
 box.insertAdjacentHTML('beforeend','<div class="pd-tabs"><button type="button" id="pd-signup">Create account</button><button type="button" id="pd-signin">Sign in</button></div><form id="pd-auth-form"><div class="pd-field"><label>Email address<input name="email" type="email" autocomplete="email" required></label></div><div class="pd-field"><label>Password<input name="password" type="password" autocomplete="new-password" required minlength="8"></label></div><div id="pd-legal"><label><input name="adult" type="checkbox" required> I confirm I am 18 or older.</label><p class="pd-help">Test access only. Profiles are not publicly visible.</p></div><button class="primary" type="submit" id="pd-auth-submit">Create account</button></form><button id="pd-reset-password" class="pd-outline" type="button">Forgot password?</button>');
 $('pd-signup').onclick=()=>switchMode('signup');$('pd-signin').onclick=()=>switchMode('signin');$('pd-auth-form').onsubmit=submitAuth;
 $('pd-reset-password').onclick=async()=>{const email=$('pd-auth-form').elements.email.value.trim();if(!email){status('Enter your email first.',true);return}const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});status(error?error.message:'If the address is registered, a reset email will be sent.',!!error)};
 switchMode(mode);
 }
 const msg=document.createElement('p');msg.id='pd-real-status';msg.setAttribute('role','status');msg.className='pd-help';box.append(msg);
}
function switchMode(m){mode=m;const legal=$('pd-legal'),b=$('pd-auth-submit');if(!legal||!b)return;legal.hidden=m==='signin';const adult=legal.querySelector('[name=adult]');adult.required=m!=='signin';b.textContent=m==='signup'?'Create account':'Sign in';$('pd-signup').classList.toggle('on',m==='signup');$('pd-signin').classList.toggle('on',m==='signin')}
async function submitAuth(e){e.preventDefault();const f=e.currentTarget;const email=f.elements.email.value.trim(),password=f.elements.password.value;if(!email||password.length<8)return status('Enter a valid email and at least 8 characters.',true);const b=$('pd-auth-submit');b.disabled=true;status('Please wait…');try{const result=mode==='signup'?await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}):await client.auth.signInWithPassword({email,password});if(result.error)throw result.error;if(mode==='signup')status('Check your email for confirmation, then sign in.');else {session=result.data.session;renderAccount()}}catch(ex){status(ex.message||'Authentication failed.',true)}finally{if(b.isConnected)b.disabled=false}}
async function loadProfile(){if(!session)return;const {data,error}=await client.from('profiles').select('display_name,birth_date,area,looking_for,bio,interests').eq('user_id',session.user.id).maybeSingle();const f=$('pd-real-profile');if(!f)return;if(error)return status(error.message,true);if(data){for(const k of ['display_name','birth_date','area','looking_for','bio'])if(f.elements[k])f.elements[k].value=data[k]??'';f.elements.interests.value=(data.interests||[]).join(', ')}}
async function saveProfile(e){e.preventDefault();if(!session)return;const f=e.currentTarget,d=new FormData(f);const birth=String(d.get('birth_date')||'');const date=new Date(birth+'T12:00:00Z');const cutoff=new Date();cutoff.setUTCFullYear(cutoff.getUTCFullYear()-18);if(!birth||Number.isNaN(date.getTime())||date>cutoff)return status('You must be 18 or older.',true);
 const record={user_id:session.user.id,display_name:String(d.get('display_name')).trim(),birth_date:birth,area:String(d.get('area')),looking_for:String(d.get('looking_for')),bio:String(d.get('bio')).trim(),interests:String(d.get('interests')).split(',').map(x=>x.trim()).filter(Boolean).slice(0,15)};
 const b=f.querySelector('[type=submit]');b.disabled=true;try{const {data:found,error:readError}=await client.from('profiles').select('user_id').eq('user_id',session.user.id).maybeSingle();if(readError)throw readError;const q=found?client.from('profiles').update(Object.fromEntries(Object.entries(record).filter(([k])=>k!=='user_id'))).eq('user_id',session.user.id):client.from('profiles').insert(record);const {error}=await q;if(error)throw error;status('Profile saved securely. Pending moderation; not visible to other members.')}catch(ex){status(ex.message||'Save failed.',true)}finally{b.disabled=false}}
const previous=window.renderProfile;
window.renderProfile=function(el){if(accountView==='account'){renderAccount();return}previous(el)};
window.addEventListener('load',loadSession);
})();