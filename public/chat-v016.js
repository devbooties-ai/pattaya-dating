/* Pattaya Dating v0.16 — real member messaging beta */
(function(){
const auth=()=>window.PattayaAuth,client=()=>auth()?.getClient(),user=()=>auth()?.getSession()?.user?.id;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=null,timer=null,contactsTimer=null,contactRefreshBusy=false;
function halt(){if(timer)clearInterval(timer);timer=null}
let conversations=[],activeDemo=1;
async function list(el){
 halt();if(contactsTimer)clearInterval(contactsTimer);
 // Keep the established v0.6 three-column design for both demo and real chats.
 el.innerHTML='<div class="chatLayout"><aside class="panel chatContacts"><h2>Messages</h2><div class="chatContactCount">Demo contacts and live conversations</div><input class="chatSearch" id="unified-search" placeholder="Search conversations..." aria-label="Search conversations"><div class="chatitems" id="unified-contacts"></div><div class="chatSub">Demo contacts are labeled. Real requests appear here too.</div></aside><section class="panel chatMain" id="unified-center"></section><aside class="panel chatInspector" id="unified-side"></aside></div>';
 document.getElementById('unified-search').oninput=renderContactList;
 if(user()){
 const {data,error}=await client().rpc('dating_my_conversations');
 if(!document.getElementById('unified-contacts'))return;
 conversations=error?[]:(data||[]);
 if(error)document.getElementById('unified-contacts').textContent=error.message;
 }else conversations=[];
 renderContactList();
 const found=conversations.find(c=>c.id===selected);
 if(found)openConversation(found);else openDemo(activeDemo);
 contactsTimer=setInterval(refreshContacts,7000);
}
async function refreshContacts(){
 if(contactRefreshBusy||!document.getElementById('unified-contacts')||!user()){if(!document.getElementById('unified-contacts')&&contactsTimer){clearInterval(contactsTimer);contactsTimer=null}return}
 contactRefreshBusy=true;
 try{const {data,error}=await client().rpc('dating_my_conversations');if(!error&&document.getElementById('unified-contacts')){const previous=conversations;conversations=data||[];renderContactList();const total=conversations.reduce((n,c)=>n+Number(c.unread_count||0),0);const nav=document.querySelector('#sidebarNav .nav:nth-child(3)');if(nav){nav.title=total?total+' unread messages':'Chats';nav.setAttribute('aria-label',total?'Chats, '+total+' unread':'Chats')};const active=conversations.find(c=>c.id===selected);if(active&&previous.find(c=>c.id===selected)?.status!==active.status)openConversation(active)}}
 finally{contactRefreshBusy=false}
}
function renderContactList(){
 const box=document.getElementById('unified-contacts');if(!box)return;
 const q=(document.getElementById('unified-search')?.value||'').toLowerCase();
 box.replaceChildren();
 const demos=[{id:1,name:'Mali',age:28},{id:2,name:'Niran',age:33}];
 for(const p of demos.filter(p=>p.name.toLowerCase().includes(q))){
  const b=document.createElement('button');b.className='chatitem'+(!selected&&activeDemo===p.id?' selected':'');b.innerHTML='<span class="contactAvatar">'+p.name[0]+'</span><span class="contactData"><strong>'+p.name+', '+p.age+'</strong><small>Demo conversation</small></span>';b.onclick=()=>openDemo(p.id);box.append(b);
 }
 for(const c of conversations.filter(c=>c.display_name.toLowerCase().includes(q)).sort((a,b)=>((b.status==='pending'&&b.incoming?1:0)-(a.status==='pending'&&a.incoming?1:0))||Number(b.unread_count||0)-Number(a.unread_count||0)||new Date(b.updated_at)-new Date(a.updated_at))){
  const b=document.createElement('button');b.className='chatitem'+(selected===c.id?' selected':'');
  b.innerHTML='<span class="contactAvatar">'+esc(c.display_name[0]||'?')+'</span><span class="contactData"><strong>'+esc(c.display_name)+'</strong><small>'+(c.status==='pending'?(c.incoming?'● New request':'Request sent'):c.status==='accepted'?'Live conversation':'Declined')+(Number(c.unread_count)>0?' · '+Number(c.unread_count)+' unread':'')+'</small><small>'+esc((c.last_message||'').slice(0,65))+'</small></span>';
  b.onclick=()=>openConversation(c);box.append(b);
 }
}
function openDemo(id){
 halt();selected=null;activeDemo=id;renderContactList();
 // Use the original, established chat content as a template, without switching pages.
 const p=(id===1?{name:'Mali',age:28,area:'Jomtien'}:{name:'Niran',age:33,area:'Central Pattaya'});
 const center=document.getElementById('unified-center'),side=document.getElementById('unified-side');if(!center||!side)return;
 center.innerHTML='<header class="chat-head"><span class="contactAvatar">'+p.name[0]+'</span><div><h2>'+p.name+'</h2><span class="chatSub">'+p.area+' · Demo contact</span></div><div class="head-actions"><button class="lightbtn giftbtn" id="demo-gift">🎁 Gift</button><button class="lightbtn video-btn" id="demo-video">◉ Video call</button></div></header><div class="chatlog" id="unified-demo-log"></div><form class="composer" id="unified-demo-compose"><input placeholder="Write a demo message..." maxlength="1000" required><button class="primary">Send</button></form><p class="microcopy">Local demo only · Messages not sent to real users.</p>';
 side.innerHTML='<div class="inspectorAvatar">'+p.name[0]+'</div><div class="inspectorName">'+p.name+', '+p.age+'</div><div class="inspectorMeta">'+p.area+' · Demo</div><div class="inspectorActions"><button class="lightbtn giftbtn" id="demo-side-gift">🎁 Send gift</button><button class="lightbtn video-btn" id="demo-side-video">◉ Video call preview</button></div><p class="microcopy">Fictional contact. Gifts and calls are demos.</p>';
 const demoData=(id===1?[{mine:false,text:'สวัสดีค่ะ ยินดีที่ได้รู้จัก! (Hello, nice to meet you!)'},{mine:true,text:'Hi! Nice to meet you too. How is your day?'}]:[{mine:false,text:'Hi! Great to meet you here.'}]);
 window.pdDemoMessages=window.pdDemoMessages||{};const arr=window.pdDemoMessages[id]||(window.pdDemoMessages[id]=demoData);
 const draw=()=>{const log=document.getElementById('unified-demo-log');if(!log)return;log.replaceChildren();for(const m of arr){const bubble=document.createElement('div');bubble.className='bubble'+(m.mine?' mine':'');bubble.textContent=m.text;log.append(bubble)}log.scrollTop=log.scrollHeight};draw();
 document.getElementById('unified-demo-compose').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;arr.push({mine:true,text:f.querySelector('input').value.trim()});f.reset();draw()};
 for(const el of ['demo-gift','demo-side-gift'])document.getElementById(el).onclick=()=>window.openGiftShop?.(id);
 for(const el of ['demo-video','demo-side-video'])document.getElementById(el).onclick=()=>window.openVideoCall?.(id);
}
async function openConversation(c){
 halt();selected=c.id;renderContactList();
 await client().rpc('dating_mark_read',{conv_id:c.id});refreshContacts();
 const center=document.getElementById('unified-center'),side=document.getElementById('unified-side');if(!center||!side)return;
 center.innerHTML='<header class="chat-head"><span class="contactAvatar">'+esc(c.display_name[0]||'?')+'</span><div><h2>'+esc(c.display_name)+'</h2><span class="chatSub">'+esc(c.status==='pending'?'Message request · Live member':'Live member · '+c.status)+'</span></div></header><div class="chatlog" id="live-messages">Loading…</div><div id="live-chat-actions"></div><p id="live-chat-note" class="microcopy" role="status"></p>';
 const actions=document.getElementById('live-chat-actions');
 if(c.status==='pending'&&c.incoming){
  for(const action of ['accepted','declined']){const b=document.createElement('button');b.className='pd-outline';b.textContent=action==='accepted'?'Accept request':'Decline request';b.onclick=async()=>{const {error}=await client().rpc('dating_set_request',{conv_id:c.id,action});if(error)alert(error.message);else list(document.getElementById('content'))};actions.append(b)}
 }else if(c.status==='accepted'){
  actions.innerHTML='<form id="live-send-form" class="composer"><input name="body" maxlength="2000" required placeholder="Write a message…"><button class="primary">Send</button></form>';
  document.getElementById('live-send-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,body=f.elements.body.value.trim();if(!body)return;const {error}=await client().rpc('dating_send_message',{target:c.other_id,message_body:body});if(error)document.getElementById('live-chat-note').textContent=error.message;else{f.reset();await loadMessages(c.id)}};
 }else actions.textContent=c.status==='pending'?'Waiting for acceptance.':'Request declined.';
 side.innerHTML='<div class="inspectorAvatar">'+esc(c.display_name[0]||'?')+'</div><div class="inspectorName">'+esc(c.display_name)+'</div><div class="inspectorMeta">Real member · '+esc(c.status)+'</div><div class="inspectorActions"><button class="lightbtn giftbtn" id="live-gift">🎁 Gifts · Demo</button><button class="lightbtn video-btn" id="live-video">◉ Video · Demo</button><button class="lightbtn" id="live-block">Block this member</button></div><p class="microcopy">Gifts and video calls for real users are not yet available.</p>';
 document.getElementById('live-gift').onclick=()=>alert('Virtual gifts for real members are not active yet.');
 document.getElementById('live-video').onclick=()=>alert('Real video calls are not available yet.');
 document.getElementById('live-block').onclick=async()=>{if(!confirm('Block this member?'))return;const {error}=await client().from('member_blocks').insert({blocker_id:user(),blocked_id:c.other_id});if(error)alert(error.message);else{selected=null;list(document.getElementById('content'))}};
 await loadMessages(c.id);
 timer=setInterval(()=>{if(document.getElementById('live-messages')&&user())loadMessages(c.id);else halt()},4000);
}
async function loadMessages(id){
 const el=document.getElementById('live-messages');if(!el)return;
 const {data,error}=await client().from('member_messages').select('sender_id,body,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(200);
 if(!el.isConnected)return;if(error){el.textContent=error.message;return}
 el.replaceChildren();for(const m of data||[]){const b=document.createElement('div');b.className='bubble'+(m.sender_id===user()?' mine':'');b.textContent=m.body;el.append(b)}el.scrollTop=el.scrollHeight;if(selected===id&&document.visibilityState==='visible')await client().rpc('dating_mark_read',{conv_id:id});
}
window.datingOpenChats=function(){window.go('chats')};
window.datingStartConversation=async function(target){if(!user())return alert('Please sign in first.');const msg=prompt('First message (request):');if(!msg?.trim())return;const {error}=await client().rpc('dating_send_message',{target,message_body:msg.trim()});if(error)alert(error.message);else window.go('chats')};
window.renderDemoChats=window.renderChats;
window.renderChats=function(el){list(el)};
window.PattayaChat={refresh:()=>{if(document.getElementById('unified-contacts'))list(document.getElementById('content'))}};
})();