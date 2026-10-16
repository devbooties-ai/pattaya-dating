/* Pattaya Dating v0.16 — real member messaging beta */
(function(){
const auth=()=>window.PattayaAuth,client=()=>auth()?.getClient(),user=()=>auth()?.getSession()?.user?.id;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=null,timer=null;
function halt(){if(timer)clearInterval(timer);timer=null}
async function list(el){
 halt();
 if(!user()){window.renderDemoChats(el);return}
 el.innerHTML='<div class="real-chat-layout"><aside class="panel real-contacts"><h2>Messages</h2><p class="muted">Your real conversations</p><div id="live-chat-list">Loading…</div></aside><section class="panel real-chat-center"><div id="live-chat-window" class="real-chat-window"><div class="empty">Select a conversation on the left.</div></div></section><aside class="panel real-chat-side"><div id="real-chat-inspector"><h3>Member details</h3><p class="muted">Select a contact to see details and available actions.</p></div></aside></div>';
 const {data,error}=await client().rpc('dating_my_conversations');const target=document.getElementById('live-chat-list');if(!target)return;
 if(error){target.textContent=error.message;return}
 target.replaceChildren();
 if(!data?.length){target.textContent='No conversations yet. Open a real profile in Discover to send a request.';return}
 for(const c of data){const btn=document.createElement('button');btn.type='button';btn.className='real-contact'+(selected===c.id?' active':'');btn.innerHTML='<span class="contactAvatar">'+esc(c.display_name[0]||'?')+'</span><span class="contactData"><strong>'+esc(c.display_name)+'</strong><small>'+(c.status==='pending'?(c.incoming?'New request':'Awaiting acceptance'):c.status)+'</small></span>';btn.onclick=()=>openConversation(c);target.append(btn)}
 const match=data.find(x=>x.id===selected)||data[0];if(match)openConversation(match);
}
async function openConversation(c){
 halt();selected=c.id;
 document.querySelectorAll('.real-contact').forEach(b=>b.classList.toggle('active',b.textContent.includes(c.display_name)));
 const el=document.getElementById('live-chat-window');if(!el)return;
 el.innerHTML='<header class="real-chat-header"><span class="contactAvatar">'+esc(c.display_name[0]||'?')+'</span><div><h3>'+esc(c.display_name)+'</h3><small>'+esc(c.status==='pending'?'Message request':c.status)+'</small></div></header><div id="live-messages" class="chatlog">Loading…</div><div id="live-chat-actions"></div><p id="live-chat-note" role="status" class="pd-help"></p>';
 const actions=document.getElementById('live-chat-actions');
 if(c.status==='pending'&&c.incoming){for(const action of ['accepted','declined']){const b=document.createElement('button');b.className='pd-outline';b.textContent=action==='accepted'?'Accept request':'Decline request';b.onclick=async()=>{const {error}=await client().rpc('dating_set_request',{conv_id:c.id,action});if(error)alert(error.message);else list(document.getElementById('content'))};actions.append(b)}}
 if(c.status==='accepted'){actions.innerHTML='<form id="live-send-form" class="composer"><input name="body" maxlength="2000" required placeholder="Write a message…"><button class="primary">Send</button></form>';document.getElementById('live-send-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,body=f.elements.body.value.trim();if(!body)return;const {error}=await client().rpc('dating_send_message',{target:c.other_id,message_body:body});if(error)document.getElementById('live-chat-note').textContent=error.message;else{f.reset();await loadMessages(c.id)}}}
 if(c.status==='pending'&&!c.incoming)actions.textContent='Request sent. Waiting for acceptance.';
 if(c.status==='declined')actions.textContent='Request declined.';
 const inspector=document.getElementById('real-chat-inspector');
 if(inspector){inspector.replaceChildren();const heading=document.createElement('h3');heading.textContent=c.display_name;inspector.append(heading);const desc=document.createElement('p');desc.className='muted';desc.textContent='Real member · '+c.status;inspector.append(desc);
 const gift=document.createElement('button');gift.className='pd-outline';gift.textContent='🎁 Virtual gifts · Demo only';gift.onclick=()=>alert('Gift purchases and delivery for real accounts are not active yet.');
 const video=document.createElement('button');video.className='pd-outline';video.textContent='◉ Video call · Demo only';video.onclick=()=>alert('Real video calling is not available yet. Consent and WebRTC will be implemented later.');
 const block=document.createElement('button');block.className='pd-danger';block.textContent='Block this member';block.onclick=async()=>{if(!confirm('Block this member and hide the conversation?'))return;const {error}=await client().from('member_blocks').insert({blocker_id:user(),blocked_id:c.other_id});if(error)alert(error.message);else{selected=null;list(document.getElementById('content'))}};
 inspector.append(gift,video,block);const note=document.createElement('p');note.className='pd-help';note.textContent='Coins and video calling are preview features, not active for real members.';inspector.append(note)}
 await loadMessages(c.id);
 timer=setInterval(()=>{if(document.getElementById('live-messages')&&user())loadMessages(c.id);else halt()},4000);
}
async function loadMessages(id){
 const el=document.getElementById('live-messages');if(!el)return;
 const {data,error}=await client().from('member_messages').select('sender_id,body,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(200);
 if(!el.isConnected)return;if(error){el.textContent=error.message;return}
 el.replaceChildren();for(const m of data||[]){const b=document.createElement('div');b.className='bubble'+(m.sender_id===user()?' mine':'');b.textContent=m.body;el.append(b)}el.scrollTop=el.scrollHeight;
}
window.datingOpenChats=function(){window.go('chats')};
window.datingStartConversation=async function(target){if(!user())return alert('Please sign in first.');const msg=prompt('First message (request):');if(!msg?.trim())return;const {error}=await client().rpc('dating_send_message',{target,message_body:msg.trim()});if(error)alert(error.message);else window.go('chats')};
window.renderDemoChats=window.renderChats;
window.renderChats=function(el){list(el)};
})();