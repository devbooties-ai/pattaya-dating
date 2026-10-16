/* Pattaya Dating v0.20: in-page chat notification badge, no browser push permission */
(function(){
'use strict';
let lastUser=null,lastUnread=0,lastRequests=0,busy=false;
const auth=()=>window.PattayaAuth;
function paint(){
 const navs=[...document.querySelectorAll('#sidebarNav button,#bottomNav button')].filter(b=>b.getAttribute('onclick')?.includes("go('chats')"));
 const count=lastUnread+lastRequests;
 for(const nav of navs){
  let badge=nav.querySelector('.pd-chat-badge');
  if(!count){badge?.remove();nav.removeAttribute('data-chat-alert');continue}
  if(!badge){badge=document.createElement('span');badge.className='pd-chat-badge';nav.append(badge)}
  badge.textContent=count>99?'99+':String(count);
  nav.setAttribute('data-chat-alert','true');
  nav.setAttribute('aria-label','Chats: '+lastUnread+' unread messages, '+lastRequests+' new requests');
 }
 const bell=document.getElementById('notif');
 if(bell){bell.title=count?lastUnread+' unread messages, '+lastRequests+' requests':'No new chat activity';}
}
async function check(){
 const a=auth(),id=a?.getSession()?.user?.id,client=a?.getClient();
 if(!id){lastUser=null;lastUnread=0;lastRequests=0;paint();return}
 if(busy)return;
 busy=true;
 try{
  const {data,error}=await client.rpc('dating_my_conversations');
  if(error)return;
  const results=data||[];
  lastUnread=results.reduce((sum,c)=>sum+Math.max(0,Number(c.unread_count)||0),0);
  lastRequests=results.filter(c=>c.status==='pending'&&c.incoming).length;
  lastUser=id;paint();
 }catch(e){/* keep current badge when temporarily offline */}finally{busy=false}
}
window.PattayaNotifications={refresh:check};
setInterval(check,12000);
setInterval(paint,1500);
window.addEventListener('focus',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
window.addEventListener('load',()=>setTimeout(check,350));
})();