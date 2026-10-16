/* Pattaya Dating v0.9 — real account beta. Public publishable key, never service_role. */
(function(){
'use strict';
const URL='https://toutlpurloxairobkbrb.supabase.co';
const KEY='sb_publishable_qEZIMICI9PhpkFptXEtsiA_1xn2nIQe';
let client,session=null,mode='signup';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=(msg,bad=false)=>{const e=$('pd-real-status');if(e){e.textContent=msg;e.style.color=bad?'#b91c1c':'#4e627c'}};
function ready(){if(!window.supabase?.createClient)return false;if(!client){client=window.supabase.createClient(URL,KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((_event,s)=>{session=s; window.PattayaChat?.refresh?.(); if(document.getElementById('pageTitle')?.textContent==='Profile' && window.pdProfileTab==='account')setTimeout(renderAccount,0)})}return true}
async function loadSession(){if(!ready())return;const {data}=await client.auth.getSession();session=data.session;window.PattayaChat?.refresh?.();if(document.getElementById('pageTitle')?.textContent==='Profile' && window.pdProfileTab==='account')renderAccount()}
function renderAccount(){
 const root=$('content');if(!root||document.getElementById('pageTitle')?.textContent!=='Profile')return;
 const box=document.createElement('section');box.className='panel';box.style.maxWidth='1000px';
 root.replaceChildren(box);
 const header=document.createElement('div');header.className='pd-top';header.innerHTML='<div><span class="pd-kicker">SECURE ACCOUNT BETA</span><h2>Registration & sign in</h2><p class="muted">Supabase authentication • Pattaya Dating</p></div><span class="pd-demo">PRIVATE TEST</span>';box.append(header);
 if(!ready()){const x=document.createElement('p');x.textContent='Authentication library unavailable. Reload and check your internet connection.';box.append(x);return}
 if(session){
 box.insertAdjacentHTML('beforeend','<p class="muted" id="pd-current-user"></p><h3>My profile</h3><form id="pd-real-profile"><div class="pd-two"><div class="pd-field"><label>Display name<input name="display_name" required minlength="2" maxlength="60"></label></div><div class="pd-field"><label>Date of birth<input name="birth_date" type="date" required></label></div></div><div class="pd-two"><div class="pd-field"><label>Area<select name="area">'+['Central Pattaya','Jomtien','Pratamnak','Naklua','South Pattaya','North Pattaya','Na Jomtien'].map(a=>'<option>'+a+'</option>').join('')+'</select></label></div><div class="pd-field"><label>Looking for<select name="looking_for">'+['Relationship','Dating','Friendship','Not sure yet'].map(a=>'<option>'+a+'</option>').join('')+'</select></label></div></div><div class="pd-field"><label>About me<textarea name="bio" maxlength="500" rows="4"></textarea></label></div><div class="pd-field"><label>Interests (separated by comma)<input name="interests" maxlength="160"></label></div><button class="primary" type="submit">Save to Supabase</button></form><p class="pd-help">Your account remains private and pending moderation. This is not a public profile.</p><div class="pd-rule"></div><h3>My profile photos</h3><p class="muted">Private beta photo gallery · up to 6 images, maximum 3 MB each (JPG, PNG or WebP). Photos are pending review and invisible to other members.</p><input id="pd-upload-file" type="file" accept="image/jpeg,image/png,image/webp"><button id="pd-upload-btn" class="pd-outline" type="button">Upload photo</button><div id="pd-photos" class="pd-photo-grid"></div><div class="pd-rule"></div><h3>Blocked members</h3><p class="muted">Blocked members cannot contact or appear in your search results.</p><div id="pd-blocked-members">Loading…</div><div class="pd-rule"></div><button id="pd-real-logout" class="pd-outline">Sign out</button>');
 $('pd-current-user').textContent='Signed in: '+(session.user.email||'Account');
 $('pd-real-logout').addEventListener('click',async()=>{await client.auth.signOut();session=null;renderAccount()});
 $('pd-real-profile').addEventListener('submit',saveProfile);
 loadProfile(); loadPhotos(); loadBlockedMembers(); $('pd-upload-btn').onclick=uploadPhoto; client.rpc('is_dating_admin').then(({data})=>{if(data && $('pd-real-logout')){const b=document.createElement('button');b.className='pd-outline';b.textContent='Open moderation dashboard';b.style.marginRight='12px';b.onclick=()=>window.openDatingAdmin?.();$('pd-real-logout').before(b)}}); 
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

async function loadBlockedMembers(){
 const el=$('pd-blocked-members');if(!el||!session)return;
 const {data,error}=await client.rpc('dating_my_blocks');
 if(!el.isConnected)return;el.replaceChildren();
 if(error){el.textContent=error.message;return}
 if(!data?.length){el.textContent='No blocked members.';return}
 for(const member of data){const row=document.createElement('div');row.className='pd-blocked-row';const name=document.createElement('span');name.textContent=member.display_name;const button=document.createElement('button');button.className='pd-outline';button.textContent='Unblock';button.onclick=async()=>{if(!confirm('Unblock '+member.display_name+'?'))return;button.disabled=true;const {error}=await client.from('member_blocks').delete().eq('blocker_id',session.user.id).eq('blocked_id',member.blocked_id);if(error){alert(error.message);button.disabled=false}else loadBlockedMembers()};row.append(name,button);el.append(row)}
}
async function loadPhotos(){
 if(!session||!ready())return;
 const target=$('pd-photos');if(!target)return;
 target.textContent='Loading photos…';
 const {data,error}=await client.from('profile_photos').select('id,storage_path,moderation_status,is_primary').eq('user_id',session.user.id).order('created_at',{ascending:false});
 if(!target.isConnected)return;
 target.replaceChildren();
 if(error){target.textContent='Unable to load images: '+error.message;return}
 if(!data.length){target.textContent='No photos uploaded yet.';return}
 for(const p of data){
  const card=document.createElement('div');card.className='pd-photo-entry';
  const img=document.createElement('img');img.alt='Your private profile photo';
  const {data:link}=await client.storage.from('dating-profile-photos').createSignedUrl(p.storage_path,120);
  if(link?.signedUrl)img.src=link.signedUrl;
  const meta=document.createElement('p');meta.className='pd-help';meta.textContent=p.moderation_status;
  const btn=document.createElement('button');btn.type='button';btn.className='pd-danger';btn.textContent='Delete photo';btn.onclick=()=>deletePhoto(p);
  card.append(img,meta,btn);target.append(card);
 }
}
async function uploadPhoto(){
 if(!session)return status('Please sign in first.',true);
 const input=$('pd-upload-file'),btn=$('pd-upload-btn'),file=input?.files?.[0];
 if(!file)return status('Choose a photo first.',true);
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728)return status('Use JPG, PNG or WebP under 3 MB.',true);
 btn.disabled=true;
 try{
  const {count,error:countError}=await client.from('profile_photos').select('id',{count:'exact',head:true}).eq('user_id',session.user.id);
  if(countError)throw countError;
  if(count>=6)throw Error('Maximum 6 photos. Delete one before uploading.');
  const path=session.user.id+'/'+crypto.randomUUID()+({ 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[file.type]);
  const {error:storageError}=await client.storage.from('dating-profile-photos').upload(path,file,{contentType:file.type,upsert:false});
  if(storageError)throw storageError;
  const {error:recordError}=await client.from('profile_photos').insert({user_id:session.user.id,storage_path:path,moderation_status:'pending'});
  if(recordError){await client.storage.from('dating-profile-photos').remove([path]);throw recordError}
  input.value='';status('Photo uploaded privately and marked pending review.');await loadPhotos();
 }catch(e){status(e.message||'Upload failed.',true)}finally{if(btn.isConnected)btn.disabled=false}
}
async function deletePhoto(p){
 if(!session||!confirm('Delete this photo?'))return;
 const {error}=await client.storage.from('dating-profile-photos').remove([p.storage_path]);
 if(error)return status(error.message,true);
 const {error:rowError}=await client.from('profile_photos').delete().eq('id',p.id).eq('user_id',session.user.id);
 if(rowError)return status(rowError.message,true);
 status('Photo deleted.');loadPhotos();
}

const previous=window.renderProfile;
window.renderProfile=function(el){if(window.pdProfileTab==='account'){renderAccount()}else{previous(el)}};
window.PattayaAuth={getClient:()=>ready()?client:null,getSession:()=>session};
window.addEventListener('load',loadSession);
})();