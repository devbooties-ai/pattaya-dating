/* Pattaya Dating v0.10 — read-only real member search */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const original=window.renderDiscover;
let params={area:'',min:18,max:75,search:''};
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
 out.innerHTML='<div class="pd-member-results">'+data.map(p=>'<article class="pd-member-row"><div class="pd-member-avatar">♡</div><div><strong>'+esc(p.display_name)+', '+Number(p.age)+'</strong><div class="muted">'+esc(p.area)+' · '+esc(p.looking_for)+'</div><p>'+esc(p.bio).slice(0,220)+'</p><small>'+esc((p.interests||[]).join(' · '))+'</small></div></article>').join('')+'</div>';
}
window.renderDiscover=function(el){browse(el)};
})();