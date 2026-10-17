/* Pattaya Dating Social 2026 • Presentation only • no fake data transactions */
(function(){
'use strict';
const $=id=>document.getElementById(id);
function feature(title,description,emoji,items){
 const root=$('content');if(!root)return;
 root.innerHTML='<section class="pd-page-feature"><div><h2>'+title+'</h2><p>'+description+'</p><button class="pd-gold-btn" style="max-width:220px" id="pd-learn-button">Explore benefits →</button></div><div class="pd-promo-art" aria-hidden="true">'+emoji+'</div></section><div class="pd-feature-list">'+items.map(a=>'<article class="panel"><h3>'+a[0]+'</h3><p>'+a[1]+'</p></article>').join('')+'</div><p class="notice">Preview only. Live subscriptions, paid gifts and remote calls are not enabled.</p>';
 $('pd-learn-button').onclick=()=>{const target=document.querySelector('.pd-feature-list');target?.scrollIntoView({behavior:'smooth'})};
}
function upgrade(){window.go?.('vip')}
function decorate(){
 const p=location.hash.slice(1)||'discover';const content=$('content');if(!content)return;
 const foot=document.querySelector('.sidebarfoot');if(foot&&!foot.querySelector('.pd-vip-cta')){const b=document.createElement('button');b.className='pd-vip-cta';b.textContent='Explore VIP Plans →';b.onclick=upgrade;foot.append(b)}
 const headings={discover:'Discover Amazing People',chats:'Messages & Connections',likes:'Your Likes',activity:'Your Activity',profile:'Your Profile',live:'Live Connections',vip:'VIP Club'};
 const title=$('pageTitle');if(title&&headings[p])title.textContent=headings[p];
 if(p==='live'){feature('Get closer. Go live.','A comfortable place for members to discover social video and request private video conversations. Real calls require both people’s consent.','◉', [['Private video requests','Send a request to connect face to face. Calls begin only when both participants agree.'],['A familiar experience','Simple video controls inspired by modern messaging and video apps.'],['Live gifting','Express appreciation with digital gifts once the verified gifting system launches.']]);return}
 if(p==='vip'){feature('More ways to connect.','Choose the experience that fits you. Pricing and paid features remain previews until checkout and subscriptions are implemented.','♛',[['Free','Explore members with limited messaging and free basic access.'],['Premium','More access to conversations and member profiles, subject to safety and consent.'],['VIP','An elevated experience with premium visibility, profile benefits and exclusive customization.']]);return}
 if(p==='discover'&&!content.querySelector('.pd-discover-intro')){
 const intro=document.createElement('div');intro.className='pd-discover-intro';intro.innerHTML='<h2>Discover <span>Amazing People</span></h2><p>Real connections start with a simple hello. Explore Pattaya and beyond.</p><div class="pd-social-stories" id="pd-stories"></div>';const stories=intro.querySelector('#pd-stories');['For You','Nearby','Online','New','Verified','Popular','VIP'].forEach((n,i)=>{const d=document.createElement('div');d.className='pd-story';d.innerHTML='<div class="pd-story-ring"><span>'+['♥','⌖','●','✦','✓','★','♛'][i]+'</span></div>'+n;stories.append(d)});content.prepend(intro);
 const layout=content.querySelector('.discoverLayout');if(layout&&!layout.querySelector('.pd-discover-rail')){const rail=document.createElement('aside');rail.className='pd-discover-rail';rail.innerHTML='<section class="pd-rail-card pd-premium-card"><h3>♛ Premium Members</h3><p>Unlock more opportunities to connect and express interest. An enhanced dating experience, your way.</p><button class="pd-gold-btn" id="pd-discover-upgrade">Explore Premium →</button></section><section class="pd-rail-card"><h3>✦ Discover highlights</h3><p>Browse profiles and connect with people who share your interests.</p><div class="pd-mini-user"><span class="pd-mini-avatar">♥</span><div>New connections<small>Explore people nearby</small></div><span class="pd-live-chip">Explore</span></div><div class="pd-mini-user"><span class="pd-mini-avatar">✦</span><div>Profile tips<small>Stand out authentically</small></div></div></section>';layout.append(rail);$('pd-discover-upgrade').onclick=upgrade}}
 }
 if(p==='chats'&&!content.querySelector('.pd-chat-banner')){const el=document.createElement('div');el.className='pd-chat-banner';el.innerHTML='<span><strong>♥ A better way to connect</strong> · Chats, message requests and Pattaya Dating Support in one place.</span><span>🎁 Gifts preview</span>';content.prepend(el)}
}
function init(){const labels=window.labels;decorate();const root=$('content');if(!root)return;const observer=new MutationObserver(()=>{if(!root.isConnected)return;observer.disconnect();decorate();observer.observe(root,{childList:true})});observer.observe(root,{childList:true});window.addEventListener('hashchange',()=>setTimeout(decorate,80));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.PDSocial2026={decorate};
})();
