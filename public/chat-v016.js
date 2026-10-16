/* Pattaya Dating v0.16 — real member messaging beta */
(function(){
const auth=()=>window.PattayaAuth,client=()=>auth()?.getClient(),user=()=>auth()?.getSession()?.user?.id;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=null,timer=null;
function halt(){if(timer)clearInterval(timer);timer=null}
async function list(el){
 halt();
 if(!user()){window.renderDemoChats(el);return}
 el.innerHTML='<section class="panel"><h2>Messages · Live beta</h2><p class="muted">Requests must be accepted before normal chat begins.</p><div id="live-chat-list">Loading…</div><div id="live-chat-window"></div></section>';
 const {data,error}=await client().rpc('dating_my_conversations');const target=document.getElementById('live-chat-list');if(!target)return;
 if(error){target.textContent=error.message;return}
 target.replaceChildren();
 if(!data?.length){target.textContent='No real conversations yet. Open a real profile in Discover to send a request.';return}
 for(const c of data){const btn=document.createElement('button');btn.type='button';btn.className='pd-outline';btn.style.margin='0 8px 8px 0';btn.textContent=c.display_name+' · '+(c.status==='pending'?(c.incoming?'New request':'Awaiting acceptance'):c.status);btn.onclick=()=>openConversation(c);target.append(btn)}
 if(selected){const match=data.find(x=>x.id===selected);if(match)openConversation(match)}
}
async function openConversation(c){
 selected=c.id;const el=document.getElementById('live-chat-window');if(!el)return;el.innerHTML='<div class="pd-rule"></div><h3>'+esc(c.display_name)+'</h3><div id="live-messages" class="chatlog">Loading…</div><div id="live-chat-actions"></div><p id="live-chat-note" role="status" class="pd-help"></p>';const actions=document.getElementById('live-chat-actions');
 if(c.status==='pending'&&c.incoming){for(const action of ['accepted','declined']){const b=document.createElement('button');b.className='pd-outline';b.textContent=action==='accepted'?'Accept request':'Decline request';b.onclick=async()=>{const {error}=await client().rpc('dating_set_request',{conv_id:c.id,action});if(error)alert(error.message);else list(document.getElementById('content'))};actions.append(b)}}
 if(c.status==='accepted'){actions.innerHTML='<form id="live-send-form" class="composer"><input name="body" maxlength="2000" required placeholder="Write a message…"><button class="primary">Send</button></form>';document.getElementById('live-send-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,body=f.elements.body.value.trim();if(!body)return;const {error}=await client().rpc('dating_send_message',{target:c.other_id,message_body:body});if(error)document.getElementById('live-chat-note').textContent=error.message;else{f.reset();await loadMessages(c.id)}}}
 if(c.status==='pending'&&!c.incoming)actions.textContent='Request sent. Waiting for a reply.';
 if(c.status==='declined')actions.textContent='Request declined.';
 const block=document.createElement('button');block.className='pd-danger';block.textContent='Block this member';block.onclick=async()=>{if(!confirm('Block this member and hide the conversation?'))return;const {error}=await client().from('member_blocks').insert({blocker_id:user(),blocked_id:c.other_id});if(error)alert(error.message);else{selected=null;list(document.getElementById('content'))}};actions.append(block);
 await loadMessages(c.id);
 halt();timer=setInterval(()=>{if(document.getElementById('live-messages')&&user())loadMessages(c.id);else halt()},4000);
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