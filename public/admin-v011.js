/* Pattaya Dating v0.11 moderation admin beta */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&gt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=()=>window.PattayaAuth?.getClient();
window.openDatingAdmin=async function(){
 const c=api(),el=document.getElementById('content');
 if(!c||!el)return;
 const {data:allowed,error:authError}=await c.rpc('is_dating_admin');
 if(authError||!allowed){alert('Admin access not enabled for this account.');return}
 el.innerHTML='<section class="panel"><div class="pd-top"><div><span class="pd-kicker">RESTRICTED ACCESS</span><h2>Moderation dashboard</h2><p class="muted">Review profiles and images before publishing.</p></div><button class="pd-outline" id="admin-back">Back to profile</button></div><div id="admin-review-status" role="status"></div><h3>Member profiles</h3><div id="admin-profiles">Loading…</div><div class="pd-rule"></div><h3>Photos awaiting review</h3><div id="admin-photos">Loading…</div><div class="pd-rule"></div><h3>Member reports</h3><div id="admin-reports">Loading…</div></section>';
 document.getElementById('admin-back').onclick=()=>window.go('profile');
 const [pr,ph,reports]=await Promise.all([c.rpc('admin_pending_profiles'),c.rpc('admin_pending_photos'),c.rpc('dating_admin_reports')]);
 const p=document.getElementById('admin-profiles'),h=document.getElementById('admin-photos');
 if(!p||!h)return;
 p.replaceChildren();h.replaceChildren();
 if(pr.error){p.textContent=pr.error.message}else if(!pr.data.length){p.textContent='No profiles'}else for(const row of pr.data){
  const card=document.createElement('div');card.className='pd-member-row';
  const label=document.createElement('div');label.style.flex='1';label.textContent=row.display_name+' · '+row.area+' · '+row.moderation_status+' · '+(row.is_visible?'visible':'hidden');card.append(label);
  for(const st of ['approved','pending','suspended']){const b=document.createElement('button');b.className='pd-outline';b.textContent=st;b.onclick=async()=>{if(!confirm('Set profile to '+st+'?'))return;const r=await c.rpc('admin_set_profile_status',{target_id:row.user_id,new_status:st});if(r.error)alert(r.error.message);else window.openDatingAdmin()};card.append(b)}p.append(card)
 }
 if(ph.error){h.textContent=ph.error.message}else if(!ph.data.length){h.textContent='No pending photos'}else for(const row of ph.data){
  const card=document.createElement('div');card.className='pd-member-row';
  const image=document.createElement('img');image.alt='Photo pending moderation';image.style.cssText='width:105px;height:130px;object-fit:cover;border-radius:10px';
  const {data:link,error:linkError}=await c.storage.from('dating-profile-photos').createSignedUrl(row.storage_path,120);
  if(link?.signedUrl)image.src=link.signedUrl;else image.alt='Image unavailable: '+(linkError?.message||'unknown');
  card.append(image);
  const controls=document.createElement('div');controls.style.flex='1';
  const title=document.createElement('p');title.textContent='Pending photo · '+row.photo_id.slice(0,8);controls.append(title);
  for(const st of ['approved','rejected']){const b=document.createElement('button');b.className='pd-outline';b.textContent=st;b.style.marginRight='8px';b.onclick=async()=>{if(!confirm(st+' this photo?'))return;const r=await c.rpc('admin_set_photo_status',{target_photo:row.photo_id,new_status:st});if(r.error)alert(r.error.message);else window.openDatingAdmin()};controls.append(b)}
  card.append(controls);h.append(card)
 }
 const reportBox=document.getElementById('admin-reports');
 if(reportBox){reportBox.replaceChildren();if(reports.error)reportBox.textContent=reports.error.message;else if(!reports.data?.length)reportBox.textContent='No member reports.';else for(const report of reports.data){
 const row=document.createElement('div');row.className='pd-member-row';
 const detail=document.createElement('div');detail.style.flex='1';
 const heading=document.createElement('strong');heading.textContent=report.reason+' · '+report.status;
 const description=document.createElement('p');description.className='muted';description.textContent=report.details||'No further details.';
 detail.append(heading,description);row.append(detail);
 for(const status of ['reviewed','resolved']){const b=document.createElement('button');b.className='pd-outline';b.textContent=status;b.onclick=async()=>{const res=await c.rpc('dating_admin_set_report',{report_id:report.id,new_status:status});if(res.error)alert(res.error.message);else window.openDatingAdmin()};row.append(b)}
 reportBox.append(row)
 }}
};
})();