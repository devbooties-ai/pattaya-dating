/* v0.15 real Likes panel for signed-in accounts */
(function(){
const previous=window.renderLikes;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.renderLikes=async function(el){
 const auth=window.PattayaAuth,session=auth?.getSession();
 if(!session){previous(el);return}
 el.innerHTML='<div class="panel"><h2>Your likes</h2><p class="muted">Likes from real, approved members. Your demo likes are separate.</p><div id="real-likes-status">Loading…</div></div>';
 const {data,error}=await auth.getClient().rpc('my_like_summary');
 const target=document.getElementById('real-likes-status');if(!target||!target.isConnected)return;
 if(error){target.textContent=error.message;return}
 if(!data?.length){target.textContent='No likes yet.';return}
 target.replaceChildren();
 for(const item of data){const div=document.createElement('div');div.className='pd-member-row';const content=document.createElement('div');content.style.flex='1';content.innerHTML='<strong>'+esc(item.display_name)+', '+Number(item.age)+'</strong><p class="muted">'+esc(item.area)+' · '+esc(item.direction==='sent'?'You liked this member':'This member liked you')+(item.mutual?' · Mutual like ♥':'')+'</p>';div.append(content);target.append(div)}
};
})();