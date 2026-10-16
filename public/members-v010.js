/* Pattaya Dating v0.10 — read-only real member search */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const original=window.renderDiscover;
let params={area:'',min:18,max:75,search:''};
let selectedRealProfile=null;
function showRealProfile(p){selectedRealProfile=p;const el=document.getElementById('content');if(!el)return;document.getElementById('pageTitle').textContent='Member profile';el.innerHTML='<section class="panel"><button class="pd-outline" id="real-profile-back">← Back to members</button><div class="pd-profile-head" style="margin-top:26px"><div class="pd-photo" aria-hidden="true">♡</div><div><h2>'+esc(p.display_name)+', '+Number(p.age)+'</h2><p class="muted">'+esc(p.area)+'</p><span class="pd-demo">Approved profile</span></div></div><h3>About me</h3><p>'+esc(p.bio||'No introduction yet.')+'</p><h3>Interests</h3><p>'+esc((p.interests||[]).join(' · ')||'Not specified')+'</p><h3>Looking for</h3><p>'+esc(p.looking_for)+'</p><p class="pd-help">Messaging and likes between real members are being developed. No private contact details are shown.</p></section>';document.getElementById('real-profile-back').onclick=()=>{selectedRealProfile=null;document.getElementById('pageTitle').textContent='Discover people';browse(document.getElementById('content'))};}
async function browse(el){
 const auth=window.PattayaAuth;const session=auth?.getSession();
 if(!session){original(el);return}
 el.innerHTML='<div class="panel"><h2>Verified member discovery · Beta</h2><p class="muted">Only approved, visible adult profiles are shown. Your own profile is excluded.</p><form id="real-search" class="pd-two"><div class="pd-field"><label>Search by name<input name="search" maxlength="60" value="'+esc(params.search)+'"></label></div><div class="pd-field"><label>Area<select name="area"><option value="">All Pattaya</option>'+['Central Pattaya','Jomtien','Pratamnak','Naklua','South Pattaya','North Pattaya','Na Jomtien'].map(a=>'<option '+(params.area===a?'selected':'')+'>'+a+'</option>').join('')+'</select></label></div><div class="pd-field"><label>Minimum age<input name="min" type="number" min="18" max="99" value="'+params.min+'"></label></div><div class="pd-field"><label>Maximum age<input name="max" type="number" min="18" max="99" value="'+params.max+'"></label></div><button type="submit" class="primary">Find members</button></form><div class="pd-rule"></div><div id="real-results" role="status">Loading...</div></div>';
 document.getElementById('real-search').onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget);params={area:String(d.get('area')),search:String(d.get('search')).slice(0,60),min:Math.max(18,Number(d.get('min'))||18),max:Math.min(99,Number(d.get('max'))||99)};browse(document.getElementById('content'))};
 const client=auth.getClient();
 const {data,error}=await client.rpc('browse_members',{p_area:params.area||null,p_min_age:params.min,p_max_age:params.max,p_search:params.search,p_limit:40});
 const out=document.getElementById('real-results');if(!out||!out.isConnected)return;
 if(error){out.textContent='Unable to load members: '+error.message;return}
 if(!data.length){out.textContent='No approved profiles match yet. Profiles require explicit moderation approval before appearing here.';return}
 out.replaceChildren();const wrap=document.createElement('div');wrap.className='pd-member-results';for(const p of data){const b=document.createElement('button');b.type='button';b.className='pd-member-row pd-member-open';b.innerHTML='<div class="pd-member-avatar">♡</div><div><strong>'+esc(p.display_name)+', '+Number(p.age)+'</strong><div class="muted">'+esc(p.area)+' · '+esc(p.looking_for)+'</div><p>'+esc(p.bio).slice(0,220)+'</p><small>'+esc((p.interests||[]).join(' · '))+'</small></div>';b.onclick=()=>showRealProfile(p);wrap.append(b)}out.append(wrap);
}
window.renderDiscover=function(el){selectedRealProfile=null;browse(el)};
})();