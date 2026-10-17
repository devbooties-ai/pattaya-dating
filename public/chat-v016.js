/* Pattaya Dating v0.16 — real member messaging beta */
(function(){
const auth=()=>window.PattayaAuth,client=()=>auth()?.getClient(),user=()=>auth()?.getSession()?.user?.id;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=null,timer=null,contactsTimer=null,contactRefreshBusy=false,realtimeChannel=null,realtimeUser=null;
function halt(){if(timer)clearInterval(timer);timer=null}
let conversations=[],activeDemo=1;
try{window.pdDemoMessages=Object.assign({},JSON.parse(sessionStorage.getItem('pd-demo-messages')||'{}'),window.pdDemoMessages||{})}catch(e){window.pdDemoMessages=window.pdDemoMessages||{}}
const demoPeople=()=>window.pdDemoProfiles||[{id:1,name:'Mali',age:28,area:'Jomtien'}];
const demoPhoto=id=>'./assets/social-2026/demo-profile-'+String(({1:1,2:5,3:2,4:6,5:3,6:7,7:4,8:8})[id]||1).padStart(2,'0')+'.webp';
const demoAvatar=(p,side=false)=>'<span class="'+(side?'inspectorAvatar':'contactAvatar')+' pd-photo-avatar"><img src="'+demoPhoto(p.id)+'" alt="'+esc(p.name)+' demo portrait" loading="lazy"></span>';
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
 if(user())await refreshSupport();
 renderContactList();
 if(window.pdRequestedDemoId){activeDemo=Number(window.pdRequestedDemoId);window.pdRequestedDemoId=null}
 const found=conversations.find(c=>c.id===selected);
 if(found)openConversation(found);else if(activeDemo===0&&supportItems.length)showSupportConversation();else openDemo(activeDemo);
 contactsTimer=setInterval(refreshContacts,12000);attachRealtime();
}
async function refreshContacts(){
 if(contactRefreshBusy||!document.getElementById('unified-contacts')||!user()){if(!document.getElementById('unified-contacts')&&contactsTimer){clearInterval(contactsTimer);contactsTimer=null}return}
 contactRefreshBusy=true;
 try{const {data,error}=await client().rpc('dating_my_conversations');if(!error&&document.getElementById('unified-contacts')){await refreshSupport();const previous=conversations;conversations=data||[];renderContactList();const total=conversations.reduce((n,c)=>n+Number(c.unread_count||0),0);const nav=document.querySelector('#sidebarNav .nav:nth-child(3)');if(nav){nav.title=total?total+' unread messages':'Chats';nav.setAttribute('aria-label',total?'Chats, '+total+' unread':'Chats')};const active=conversations.find(c=>c.id===selected);if(active&&previous.find(c=>c.id===selected)?.status!==active.status)openConversation(active)}}
 finally{contactRefreshBusy=false}
}
function attachRealtime(){
 const uid=user();
 if(!uid){if(realtimeChannel){client()?.removeChannel(realtimeChannel);realtimeChannel=null;realtimeUser=null}return}
 if(realtimeChannel&&realtimeUser===uid)return;
 if(realtimeChannel)client().removeChannel(realtimeChannel);
 realtimeUser=uid;
 realtimeChannel=client().channel('dating-chat-changes-'+uid)
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'member_messages'},payload=>{
  if(document.getElementById('unified-contacts')){refreshContacts();if(selected===payload.new.conversation_id)loadMessages(selected)}
 })
 .on('postgres_changes',{event:'UPDATE',schema:'public',table:'member_conversations'},()=>{if(document.getElementById('unified-contacts'))refreshContacts()})
 .subscribe();
}

function openReportDialog(c){
 document.getElementById('pd-report-overlay')?.remove();
 const overlay=document.createElement('div');overlay.id='pd-report-overlay';overlay.className='pd-report-overlay';
 overlay.innerHTML='<div class="pd-report-dialog" role="dialog" aria-modal="true" aria-labelledby="pd-report-title"><button type="button" class="pd-report-close" aria-label="Close">×</button><h2 id="pd-report-title">Report member</h2><p class="muted">Report '+esc(c.display_name)+' to Pattaya Dating Support. Reports are confidential.</p><form id="pd-report-form"><label for="pd-report-reason">Why are you reporting this member?</label><select id="pd-report-reason" name="reason" required><option value="">Choose a reason</option><option value="spam">Spam or unwanted messages</option><option value="scam">Fraud or scam attempt</option><option value="harassment">Harassment or threats</option><option value="fake_profile">Fake profile / impersonation</option><option value="inappropriate_content">Inappropriate content</option><option value="other">Other</option></select><label for="pd-report-details">Additional information (optional)</label><textarea id="pd-report-details" name="details" maxlength="1000" rows="4" placeholder="Tell us what happened..."></textarea><p class="pd-help" id="pd-report-feedback" role="status"></p><div class="pd-report-actions"><button type="button" class="pd-outline" id="pd-report-cancel">Cancel</button><button type="submit" class="primary">Submit report</button></div></form></div>';
 document.body.append(overlay);const close=()=>overlay.remove();
 overlay.querySelector('.pd-report-close').onclick=close;overlay.querySelector('#pd-report-cancel').onclick=close;
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 overlay.querySelector('form').onsubmit=async e=>{
 e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type=submit]'),reason=form.elements.reason.value,details=form.elements.details.value;
 if(!reason)return;button.disabled=true;const feedback=overlay.querySelector('#pd-report-feedback');feedback.textContent='Sending your report…';
 try{const {error}=await client().rpc('dating_submit_report',{target:c.other_id,convo:c.id,report_reason:reason,report_details:details});
 if(error)throw error;close();await refreshSupport();showSupportConversation();}
 catch(err){feedback.textContent=err.message||'Unable to send report.';button.disabled=false}
 };
 overlay.querySelector('select').focus();
}
let supportItems=[];
async function refreshSupport(){
 if(!user())return;
 const {data,error}=await client().from('support_messages').select('id,body,created_at,read_at,sender_type').eq('user_id',user()).order('created_at',{ascending:true}).limit(100);
 if(!error){supportItems=data||[];renderContactList();window.PattayaNotifications?.refresh?.()}
}
function showSupportConversation(){
 halt();selected=null;activeDemo=0;renderContactList();
 const center=document.getElementById('unified-center'),side=document.getElementById('unified-side');if(!center||!side)return;
 center.innerHTML='<header class="chat-head"><span class="contactAvatar">♥</span><div><h2>Pattaya Dating Support</h2><span class="chatSub">Official system messages</span></div></header><div class="chatlog" id="support-chat-messages"></div><form class="composer" id="pd-support-compose"><input name="message" maxlength="2000" placeholder="Write to Support…" required><button class="primary">Send</button></form><p class="microcopy" id="pd-support-status">Messages are sent to Pattaya Dating Support.</p>';
 side.innerHTML='<div class="inspectorAvatar">♥</div><div class="inspectorName">Pattaya Dating Support</div><div class="inspectorMeta">Official platform account</div><p class="microcopy">This is a system conversation, not a dating profile.</p>';
 addChatDesignDetails();
 const log=document.getElementById('support-chat-messages');for(const m of supportItems){const bubble=document.createElement('div');bubble.className='bubble'+(m.sender_type==='member'?' mine':'');bubble.textContent=m.body;log.append(bubble)}log.scrollTop=log.scrollHeight;
 document.getElementById('pd-support-compose').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,msg=form.elements.message.value.trim();if(!msg)return;const btn=form.querySelector('button');btn.disabled=true;const {error}=await client().rpc('dating_support_send',{message_body:msg});btn.disabled=false;if(error){document.getElementById('pd-support-status').textContent=error.message;return}form.reset();await refreshSupport();showSupportConversation()};
 client().rpc('dating_mark_support_read').then(()=>{supportItems.forEach(x=>x.read_at=x.read_at||new Date().toISOString());renderContactList();window.PattayaNotifications?.refresh?.()});
}

function renderContactList(){
 const box=document.getElementById('unified-contacts');if(!box)return;
 const q=(document.getElementById('unified-search')?.value||'').toLowerCase();
 box.replaceChildren();
 // Live contacts are sorted by latest activity. Sample contacts follow them.
 const real=conversations.filter(c=>c.display_name.toLowerCase().includes(q)).sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
 for(const c of real){
  const unread=Number(c.unread_count)||0,request=c.status==='pending'&&c.incoming;
  const b=document.createElement('button');
  b.className='chatitem pd-live-contact'+(selected===c.id?' selected':'')+(unread||request?' pd-contact-unread':'');
  const preview=esc((c.last_message||'').slice(0,65));
  b.innerHTML='<span class="contactAvatar">'+esc(c.display_name[0]||'?')+'</span><span class="contactData"><strong>'+esc(c.display_name)+'</strong><small>'+(request?'New request':c.status==='pending'?'Request sent':c.status==='accepted'?'Live conversation':'Declined')+'</small><small>'+preview+'</small></span>'+(request?'<span class="pd-unread-dot" aria-label="New request"></span>':unread?'<span class="pd-unread-count">'+unread+'</span>':'');
  b.onclick=()=>openConversation(c);box.append(b);
 }
 if(supportItems.length&&'Pattaya Dating Support'.toLowerCase().includes(q)){const unread=supportItems.filter(m=>!m.read_at).length;const b=document.createElement('button');b.className='chatitem'+(activeDemo===0?' selected':'')+(unread?' pd-contact-unread':'');b.innerHTML='<span class="contactAvatar">♥</span><span class="contactData"><strong>Pattaya Dating Support</strong><small>'+esc(supportItems[supportItems.length-1].body.slice(0,58))+'</small></span>'+(unread?'<span class="pd-unread-count">'+unread+'</span>':'');b.onclick=showSupportConversation;box.prepend(b)}
 const demos=demoPeople();
 for(const p of demos.filter(p=>p.name.toLowerCase().includes(q))){
  const b=document.createElement('button');b.className='chatitem'+(!selected&&activeDemo===p.id?' selected':'');
  b.innerHTML=demoAvatar(p)+'<span class="contactData"><strong>'+esc(p.name)+', '+p.age+'</strong><small>'+esc((window.pdDemoMessages?.[p.id]||[]).at(-1)?.text||'Demo conversation')+'</small></span>';
  b.onclick=()=>openDemo(p.id);box.append(b);if(!selected&&activeDemo===p.id)box.prepend(b);
 }
}
function addChatDesignDetails(){
 const contact=document.querySelector('.chatContacts'),side=document.getElementById('unified-side');
 if(contact&&!contact.querySelector('.pd-chat-contact-label')){const label=document.createElement('div');label.className='pd-chat-contact-label';label.innerHTML='<span>CONVERSATIONS</span><span class="pd-chat-mini-heart">♥</span>';contact.querySelector('.chatitems')?.before(label)}
 if(side&&!side.querySelector('.pd-chat-gift-preview')){
 const preview=document.createElement('section');preview.className='pd-chat-gift-preview';
 preview.innerHTML='<div class="pd-chat-gift-title"><strong>Make a sweet impression</strong><span>PREVIEW</span></div><div class="pd-chat-gift-items"><div><img src="./assets/social-2026/gift-diamond.webp" alt="Original diamond gift illustration" loading="lazy"><strong>Diamond</strong></div><div><span class="pd-chat-gift-emoji">🌹</span><strong>Rose</strong></div><div><span class="pd-chat-gift-emoji">💝</span><strong>Heart</strong></div></div><p>Gifts and coin purchases are not available for real accounts yet.</p>';
 side.append(preview);
 }
}
function openDemo(id){
 halt();selected=null;activeDemo=id;renderContactList();
 // Use the original, established chat content as a template, without switching pages.
 const p=demoPeople().find(person=>person.id===id)||demoPeople()[0];
 const center=document.getElementById('unified-center'),side=document.getElementById('unified-side');if(!center||!side)return;
 center.innerHTML='<header class="chat-head">'+demoAvatar(p)<div><h2>'+p.name+'</h2><span class="chatSub">'+p.area+' · Demo contact</span></div><div class="head-actions"><button class="lightbtn giftbtn" id="demo-gift">🎁 Gift</button><button class="lightbtn video-btn" id="demo-video">◉ Video call</button></div></header><div class="chatlog" id="unified-demo-log"></div><form class="composer" id="unified-demo-compose"><input placeholder="Write a demo message..." maxlength="1000" required><button class="primary">Send</button></form><p class="microcopy">Local demo only · Messages not sent to real users.</p>';
 side.innerHTML=demoAvatar(p,true)<div class="inspectorName">'+p.name+', '+p.age+'</div><div class="inspectorMeta">'+p.area+' · Demo</div><div class="inspectorActions"><button class="lightbtn giftbtn" id="demo-side-gift">🎁 Send gift</button><button class="lightbtn video-btn" id="demo-side-video">◉ Video call preview</button></div><p class="microcopy">Fictional contact. Gifts and calls are demos.</p>';
 addChatDesignDetails();
 const demoData=[];
 window.pdDemoMessages=window.pdDemoMessages||{};const arr=window.pdDemoMessages[id]||(window.pdDemoMessages[id]=demoData);
 const draw=()=>{const log=document.getElementById('unified-demo-log');if(!log)return;log.replaceChildren();for(const m of arr){const bubble=document.createElement('div');bubble.className='bubble'+(m.mine?' mine':'');bubble.textContent=m.text;log.append(bubble)}log.scrollTop=log.scrollHeight};draw();
 document.getElementById('unified-demo-compose').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;arr.push({mine:true,text:f.querySelector('input').value.trim()});try{sessionStorage.setItem('pd-demo-messages',JSON.stringify(window.pdDemoMessages))}catch(e){}f.reset();draw();renderContactList()};
 for(const el of ['demo-gift','demo-side-gift'])document.getElementById(el).onclick=()=>window.openGiftShop?.(id);
 for(const el of ['demo-video','demo-side-video'])document.getElementById(el).onclick=()=>window.openVideoCall?.(id);
}
async function openConversation(c){
 halt();selected=c.id;renderContactList();
 {const {error:readError}=await client().rpc('dating_mark_read',{conv_id:c.id});if(!readError){c.unread_count=0;renderContactList();window.PattayaNotifications?.refresh?.()}}
 const center=document.getElementById('unified-center'),side=document.getElementById('unified-side');if(!center||!side)return;
 center.innerHTML='<header class="chat-head"><span class="contactAvatar">'+esc(c.display_name[0]||'?')+'</span><div><h2>'+esc(c.display_name)+'</h2><span class="chatSub">'+esc(c.status==='pending'?'Message request · Live member':'Live member · '+c.status)+'</span></div></header><div class="chatlog" id="live-messages">Loading…</div><div id="live-chat-actions"></div><p id="live-chat-note" class="microcopy" role="status"></p>';
 const actions=document.getElementById('live-chat-actions');
 if(c.status==='pending'&&c.incoming){
  for(const action of ['accepted','declined']){const b=document.createElement('button');b.className='pd-outline';b.textContent=action==='accepted'?'Accept request':'Decline request';b.onclick=async()=>{const {error}=await client().rpc('dating_set_request',{conv_id:c.id,action});if(error)alert(error.message);else list(document.getElementById('content'))};actions.append(b)}
 }else if(c.status==='accepted'){
  actions.innerHTML='<form id="live-send-form" class="composer"><input name="body" maxlength="2000" required placeholder="Write a message…"><button class="primary">Send</button></form>';
  document.getElementById('live-send-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,body=f.elements.body.value.trim();if(!body)return;const {error}=await client().rpc('dating_send_message',{target:c.other_id,message_body:body});if(error)document.getElementById('live-chat-note').textContent=error.message;else{f.reset();await loadMessages(c.id)}};
 }else actions.textContent=c.status==='pending'?'Waiting for acceptance.':'Request declined.';
 side.innerHTML='<div class="inspectorAvatar">'+esc(c.display_name[0]||'?')+'</div><div class="inspectorName">'+esc(c.display_name)+'</div><div class="inspectorMeta">Real member · '+esc(c.status)+'</div><div class="inspectorActions"><button class="lightbtn giftbtn" id="live-gift">🎁 Gifts · Demo</button><button class="lightbtn video-btn" id="live-video">◉ Video · Demo</button><button class="lightbtn" id="live-report">Report member</button><button class="lightbtn" id="live-block">Block this member</button></div><p class="microcopy">Gifts and video calls for real users are not yet available.</p>';
 addChatDesignDetails();
 document.getElementById('live-gift').onclick=()=>alert('Virtual gifts for real members are not active yet.');
 document.getElementById('live-video').onclick=()=>alert('Real video calls are not available yet.');
 document.getElementById('live-report').onclick=()=>openReportDialog(c);

 document.getElementById('live-block').onclick=async()=>{if(!confirm('Block this member?'))return;const {error}=await client().from('member_blocks').insert({blocker_id:user(),blocked_id:c.other_id});if(error)alert(error.message);else{selected=null;list(document.getElementById('content'))}};
 await loadMessages(c.id);
 timer=setInterval(()=>{if(document.getElementById('live-messages')&&user())loadMessages(c.id);else halt()},4000);
}
async function loadMessages(id){
 const el=document.getElementById('live-messages');if(!el)return;
 const {data,error}=await client().from('member_messages').select('sender_id,body,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(200);
 if(!el.isConnected)return;if(error){el.textContent=error.message;return}
 el.replaceChildren();for(const m of data||[]){const b=document.createElement('div');b.className='bubble'+(m.sender_id===user()?' mine':'');b.textContent=m.body;el.append(b)}el.scrollTop=el.scrollHeight;if(selected===id&&document.visibilityState==='visible'){const {error:readError}=await client().rpc('dating_mark_read',{conv_id:id});if(!readError){const item=conversations.find(x=>x.id===id);if(item){item.unread_count=0;renderContactList()}window.PattayaNotifications?.refresh?.()}}
}
window.datingOpenChats=function(){window.go('chats')};
window.datingStartConversation=async function(target){if(!user())return alert('Please sign in first.');const msg=prompt('First message (request):');if(!msg?.trim())return;const {error}=await client().rpc('dating_send_message',{target,message_body:msg.trim()});if(error)alert(error.message);else window.go('chats')};
window.renderDemoChats=window.renderChats;
window.renderChats=function(el){list(el)};
window.PattayaChat={refresh:()=>{if(location.hash==='#chats'||document.getElementById('pageTitle')?.textContent==='Chats'){const root=document.getElementById('content');if(root)list(root)}}};
})();