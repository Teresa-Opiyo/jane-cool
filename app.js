(function(){
'use strict';
var KEY='bridevilla.v1';
var REGIONS={KE:{n:'Kenya',cur:'KES',cc:'254'},US:{n:'United States',cur:'USD',cc:'1'},EU:{n:'Europe',cur:'EUR',cc:''},OTHER:{n:'Other',cur:'USD',cc:''}};
var AREAS=['Nairobi','Kiambu','Naivasha','Nakuru','Nanyuki','Mombasa','Diani','Kisumu','Eldoret','Machakos','Other'];
var CATS=['Venue','Catering','Attire','Decor and flowers','Photo and video','Music and MC','Transport','Cake','Rings','Invitations','Dowry or bride price','Honeymoon','Other'];
var VCATS=['Venue','Caterer','Photographer','Videographer','Decor','Dress or suit','Makeup and hair','MC or DJ','Transport','Cake','Other'];
var STAT=['Shortlist','Contacted','Visited','Chosen','Dropped'];
var TABS=['home','checklist','budget','guests','committee','vendors','venues','settings'];
var TAB_NAMES={home:'Home',checklist:'Checklist',budget:'Budget',guests:'Guests',committee:'Committee',vendors:'Vendors',venues:'Venues',settings:'Settings'};
var SEED={
 General:['Agree a total budget and who contributes','Set the date and choose a planning committee','Choose the wedding party and helpers','Start the guest list','Book key vendors early','Plan the honeymoon or rest after'],
 Civil:['Check the legal requirements and book the registry','Gather IDs and documents needed','Choose two witnesses','Plan outfits for the civil ceremony','Arrange photos at the registry'],
 Traditional:['Agree the date with both families','Plan the family introduction and negotiations','Prepare the dowry or gifts list','Choose traditional attire for both sides','Plan food and drinks for the guests','Choose elders who will speak for each family'],
 Church:['Meet the pastor or priest and book the date','Complete any required classes or counselling','Choose the choir, ushers and readers','Plan the church decor and programme','Order the programme booklets'],
 Reception:['Choose and book the reception venue','Book catering and agree the menu','Book the MC, music and sound','Plan the seating and the programme','Order the cake','Arrange transport for the couple and guests']
};
var S=null,tab='home',gFilter={q:'',side:'',rsvp:'',cer:''},editG=null,editM=null;

function uid(){return Math.random().toString(36).slice(2,9)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(v){var n=parseFloat(String(v==null?'':v).replace(/,/g,''));return isFinite(n)?n:0}
function def(){
 var cers=['Civil','Traditional','Church','Reception'].map(function(n){return{id:n.toLowerCase(),name:n,on:true}});
 var tasks=[];Object.keys(SEED).forEach(function(k){SEED[k].forEach(function(t){tasks.push({id:uid(),cer:k==='General'?'general':k.toLowerCase(),text:t,done:false})})});
 return{region:'KE',cur:'KES',cur2:'USD',rate:'',names:'',date:'',inviteTpl:'Dear {guest}, {names} warmly invite you to our wedding ({ceremony}) on {date}. Please let us know if you can join us. With love.',
  ceremonies:cers,tasks:tasks,total:'',budget:[],guests:[],members:[],pay:{mpesa:'',paybill:'',account:'',till:'',other:''},priv:{names:true,amounts:true,pay:true},
  meet:{title:'Wedding committee meeting',date:'',time:'',place:'',link:''},vendors:[],venues:[],event:'wedding'}
}
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r),d=def();Object.keys(d).forEach(function(k){if(o[k]===undefined)o[k]=d[k]});return o}}catch(e){}return def()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Could not save on this device')}}
function toast(m){var t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},2200)}

function fmt(n,cur){var v=Math.round(n*100)/100;return (cur||S.cur)+' '+v.toLocaleString('en-US',{maximumFractionDigits:2})}
function cc(){return(REGIONS[S.region]||REGIONS.OTHER).cc}
function normPhone(p){
 var raw=String(p||'').trim();if(!raw)return'';
 var plus=raw.charAt(0)==='+',d=raw.replace(/\D/g,'');if(!d)return'';
 if(plus)return d;
 if(d.indexOf('00')===0)return d.slice(2);
 var c=cc();
 if(c==='254'){if(d.charAt(0)==='0')return'254'+d.slice(1);if(d.length===9)return'254'+d;return d}
 if(c==='1'){if(d.length===10)return'1'+d;return d}
 return d.charAt(0)==='0'?d.slice(1):d;
}
function waLink(p,msg){var n=normPhone(p);return'https://wa.me/'+(n?n:'')+'?text='+encodeURIComponent(msg)}
function waShare(msg){return'https://wa.me/?text='+encodeURIComponent(msg)}
function mailLink(e,sub,msg){return'mailto:'+encodeURIComponent(e||'')+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(msg)}
function niceDate(d){if(!d)return'a date to be confirmed';var x=new Date(d+'T00:00:00');return isNaN(x)?d:x.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function names(){return S.names||'the couple'}
function cerName(id){if(id==='general')return'General';var c=S.ceremonies.filter(function(x){return x.id===id})[0];return c?c.name:id}
function activeCers(){return S.ceremonies.filter(function(c){return c.on})}
function toMain(amount,curKey){
 if(curKey!=='second')return amount;
 var r=num(S.rate);return r>0?amount*r:null;
}
function curOf(k){return k==='second'?S.cur2:S.cur}
function inviteMsg(g){
 var cl=(g.cers&&g.cers.length?g.cers.map(cerName).join(', '):'wedding');
 return S.inviteTpl.replace(/\{guest\}/g,g.name).replace(/\{names\}/g,names()).replace(/\{date\}/g,niceDate(S.date)).replace(/\{ceremony\}/g,cl);
}

/* totals */
function budgetTotals(){
 var planned=0,paid=0,other={planned:0,paid:0},cats={};
 S.budget.forEach(function(b){
  var p=num(b.planned),d=num(b.paid);
  if(b.cur==='second'){var r=num(S.rate);if(r>0){planned+=p*r;paid+=d*r;cats[b.cat]=(cats[b.cat]||0)+p*r}else{other.planned+=p;other.paid+=d}}
  else{planned+=p;paid+=d;cats[b.cat]=(cats[b.cat]||0)+p}
 });
 return{planned:planned,paid:paid,other:other,cats:cats};
}
function pledgeTotals(){var p=0,d=0;S.members.forEach(function(m){p+=num(m.pledged);d+=num(m.paid)});return{pledged:p,paid:d}}
function daysLeft(){if(!S.date)return null;var t=new Date(S.date+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.round((t-n)/864e5)}

/* views */
function bar(p){return'<div class="bar"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>'}
function vHome(){
 var dl=daysLeft(),h='';
 var sub=S.names?esc(S.names):'Add your names in Settings';
 var big=dl===null?'Set your date':(dl>0?dl+' days to go':(dl===0?'Today is the day':Math.abs(dl)+' days since the wedding'));
 h+='<div class="card hero"><h2>'+sub+'</h2><div style="font-size:26px;font-weight:700">'+esc(big)+'</div><div>'+esc(S.date?niceDate(S.date):'Choose a date when you are ready')+'</div></div>';
 h+='<div class="card"><h3>Event type</h3><div class="row"><button class="chip on">Wedding</button><span class="chip soon">Birthday: coming soon</span><span class="chip soon">Graduation: coming soon</span><span class="chip soon">Baby shower: coming soon</span></div></div>';
 var done=S.tasks.filter(function(t){return t.done}).length,tot=S.tasks.length,bt=budgetTotals(),pt=pledgeTotals();
 var yes=S.guests.filter(function(g){return g.rsvp==='yes'}).length;
 var heads=S.guests.reduce(function(a,g){return a+(g.rsvp==='yes'?1+num(g.plus):0)},0);
 h+='<div class="grid"><div class="stat"><b>'+done+'/'+tot+'</b><span>Tasks done</span></div><div class="stat"><b>'+S.guests.length+'</b><span>Guests ('+yes+' confirmed, '+heads+' people)</span></div><div class="stat"><b>'+esc(fmt(bt.planned))+'</b><span>Planned spend</span></div><div class="stat"><b>'+esc(fmt(pt.paid))+'</b><span>Pledges received of '+esc(fmt(pt.pledged))+'</span></div></div>';
 h+='<div class="card"><h3>Progress by ceremony</h3>';
 activeCers().forEach(function(c){var ts=S.tasks.filter(function(t){return t.cer===c.id}),d=ts.filter(function(t){return t.done}).length,p=ts.length?d/ts.length*100:0;
  h+='<div class="cer"><div class="row between"><b>'+esc(c.name)+'</b><span class="note">'+d+' of '+ts.length+'</span></div>'+bar(p)+'</div>'});
 h+='</div>';
 h+='<div class="card"><h3>Install Bride Villa</h3><p class="note">On Android Chrome: open the menu and tap Install app or Add to Home screen. On iPhone Safari: tap Share, then Add to Home Screen. Your plan is saved only on this device, so use Settings to export a backup now and then.</p></div>';
 return h;
}
function vChecklist(){
 var h='<h2>Checklist</h2><p class="lead">A starter list for each ceremony. Edit, add or remove anything.</p>';
 h+='<form class="card f" data-form="task"><label class="full">New task<input name="text" required placeholder="e.g. Book the tent"></label><label>For<select name="cer"><option value="general">General</option>'+activeCers().map(function(c){return'<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join('')+'</select></label><div style="align-self:end"><button class="btn">Add task</button></div></form>';
 var groups=[{id:'general',name:'General'}].concat(activeCers());
 groups.forEach(function(c){
  var ts=S.tasks.filter(function(t){return t.cer===c.id});if(!ts.length)return;
  h+='<div class="card"><h3>'+esc(c.name)+'</h3>';
  ts.forEach(function(t){h+='<div class="task'+(t.done?' done':'')+'"><input type="checkbox" data-act="tgl" data-id="'+t.id+'"'+(t.done?' checked':'')+' aria-label="Done"><span class="t">'+esc(t.text)+'</span><button class="btn del sm" data-act="deltask" data-id="'+t.id+'" aria-label="Delete">Delete</button></div>'});
  h+='</div>'});
 return h;
}
function vBudget(){
 var bt=budgetTotals(),h='<h2>Budget</h2><p class="lead">Track what you plan to spend and what is paid. You can use two currencies if you set a rate in Settings.</p>';
 var tot=num(S.total);
 h+='<div class="grid"><div class="stat"><b>'+esc(fmt(tot))+'</b><span>Total budget</span></div><div class="stat"><b>'+esc(fmt(bt.planned))+'</b><span>Planned</span></div><div class="stat"><b>'+esc(fmt(bt.paid))+'</b><span>Paid</span></div><div class="stat"><b>'+esc(fmt(tot-bt.planned))+'</b><span>Left to plan</span></div></div>';
 if(bt.other.planned||bt.other.paid)h+='<p class="note">Items in '+esc(S.cur2)+' are not added to the totals until you enter an exchange rate in Settings. Planned '+esc(fmt(bt.other.planned,S.cur2))+', paid '+esc(fmt(bt.other.paid,S.cur2))+'.</p>';
 h+='<form class="card f" data-form="total"><label class="full">Total budget ('+esc(S.cur)+')<input name="total" inputmode="decimal" value="'+esc(S.total)+'"></label><div><button class="btn sec">Save total</button></div></form>';
 h+='<form class="card f" data-form="budget"><label class="full">Item<input name="name" required placeholder="e.g. Reception venue deposit"></label><label>Category<select name="cat">'+CATS.map(function(c){return'<option>'+esc(c)+'</option>'}).join('')+'</select></label><label>Ceremony<select name="cer"><option value="general">General</option>'+activeCers().map(function(c){return'<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join('')+'</select></label><label>Planned<input name="planned" inputmode="decimal"></label><label>Paid so far<input name="paid" inputmode="decimal"></label><label>Currency<select name="cur"><option value="main">'+esc(S.cur)+'</option><option value="second">'+esc(S.cur2)+'</option></select></label><div style="align-self:end"><button class="btn">Add item</button></div></form>';
 var ks=Object.keys(bt.cats);
 if(ks.length){h+='<div class="card"><h3>By category</h3><div class="bars">';var mx=Math.max.apply(null,ks.map(function(k){return bt.cats[k]}));ks.forEach(function(k){h+='<div><div class="l"><span>'+esc(k)+'</span><span>'+esc(fmt(bt.cats[k]))+'</span></div>'+bar(mx?bt.cats[k]/mx*100:0)+'</div>'});h+='</div></div>'}
 h+='<div class="card"><div class="row between"><h3>Items</h3><button class="btn sec sm" data-act="csvb">Download budget (Excel)</button></div>';
 if(!S.budget.length)h+='<div class="empty">No items yet.</div>';
 S.budget.forEach(function(b){var c=curOf(b.cur);h+='<div class="item"><div class="grow"><div class="name">'+esc(b.name)+'</div><div class="meta">'+esc(b.cat)+' | '+esc(cerName(b.cer))+' | Planned '+esc(fmt(num(b.planned),c))+' | Paid '+esc(fmt(num(b.paid),c))+'</div></div><button class="btn del sm" data-act="delbud" data-id="'+b.id+'">Delete</button></div>'});
 return h+'</div>';
}
function guestForm(g){
 g=g||{};var cers=g.cers||activeCers().map(function(c){return c.id});
 return'<form class="card f" data-form="guest"><input type="hidden" name="id" value="'+esc(g.id||'')+'"><label class="full">Name<input name="name" required value="'+esc(g.name||'')+'"></label><label>Phone (WhatsApp)<input name="phone" type="tel" value="'+esc(g.phone||'')+'" placeholder="'+(cc()==='254'?'0712 345 678':'phone number')+'"></label><label>Email<input name="email" type="email" value="'+esc(g.email||'')+'"></label><label>Side<select name="side">'+['My side','Partner\'s side','Shared'].map(function(s){return'<option'+(g.side===s?' selected':'')+'>'+esc(s)+'</option>'}).join('')+'</select></label><label>Extra guests (plus ones)<input name="plus" inputmode="numeric" value="'+esc(g.plus||0)+'"></label><label class="full">Diet or notes<input name="diet" value="'+esc(g.diet||'')+'"></label><div class="full"><label>Invited to</label><div class="checks">'+activeCers().map(function(c){return'<label><input type="checkbox" name="cers" value="'+c.id+'"'+(cers.indexOf(c.id)>-1?' checked':'')+'>'+esc(c.name)+'</label>'}).join('')+'</div></div><div class="full row"><button class="btn">'+(g.id?'Save guest':'Add guest')+'</button>'+(g.id?'<button type="button" class="btn sec" data-act="cancelg">Cancel</button>':'')+'</div></form>';
}
function vGuests(){
 var h='<h2>Guests</h2><p class="lead">Add guests one by one or paste a whole list. Send invitations by WhatsApp or email.</p>';
 h+=guestForm(editG?S.guests.filter(function(g){return g.id===editG})[0]:null);
 h+='<form class="card f" data-form="bulk"><label class="full">Paste many guests (one per line: Name, phone, email)<textarea name="bulk" placeholder="Mary Wanjiru, 0712345678\nJohn Otieno, 0722000111, john@example.com"></textarea></label><div><button class="btn sec">Add pasted guests</button></div></form>';
 var gs=S.guests.filter(function(g){
  var q=gFilter.q.toLowerCase();
  if(q&&(g.name+' '+(g.phone||'')+' '+(g.email||'')).toLowerCase().indexOf(q)<0)return false;
  if(gFilter.side&&g.side!==gFilter.side)return false;
  if(gFilter.rsvp&&g.rsvp!==gFilter.rsvp)return false;
  if(gFilter.cer&&(g.cers||[]).indexOf(gFilter.cer)<0)return false;return true});
 var cnt={yes:0,no:0,pending:0};S.guests.forEach(function(g){cnt[g.rsvp||'pending']++});
 h+='<div class="grid"><div class="stat"><b>'+S.guests.length+'</b><span>Invited</span></div><div class="stat"><b>'+cnt.yes+'</b><span>Yes</span></div><div class="stat"><b>'+cnt.no+'</b><span>No</span></div><div class="stat"><b>'+cnt.pending+'</b><span>Waiting</span></div></div>';
 h+='<div class="card"><div class="f" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px"><label>Search<input data-filter="q" value="'+esc(gFilter.q)+'"></label><label>Side<select data-filter="side"><option value="">All</option><option'+(gFilter.side==='My side'?' selected':'')+'>My side</option><option'+(gFilter.side==="Partner's side"?' selected':'')+'>Partner\'s side</option><option'+(gFilter.side==='Shared'?' selected':'')+'>Shared</option></select></label><label>RSVP<select data-filter="rsvp"><option value="">All</option><option value="pending"'+(gFilter.rsvp==='pending'?' selected':'')+'>Waiting</option><option value="yes"'+(gFilter.rsvp==='yes'?' selected':'')+'>Yes</option><option value="no"'+(gFilter.rsvp==='no'?' selected':'')+'>No</option></select></label><label>Ceremony<select data-filter="cer"><option value="">All</option>'+activeCers().map(function(c){return'<option value="'+c.id+'"'+(gFilter.cer===c.id?' selected':'')+'>'+esc(c.name)+'</option>'}).join('')+'</select></label></div></div>';
 h+='<div class="row" style="margin-bottom:10px"><button class="btn sec sm" data-act="csvg">Download guest list (Excel)</button></div>';
 h+='<div class="card" id="guestlist">';
 if(!gs.length)h+='<div class="empty">No guests to show.</div>';
 gs.forEach(function(g){var r=g.rsvp||'pending',lbl={yes:'Yes',no:'No',pending:'Waiting'}[r];
  h+='<div class="item"><div class="grow"><div class="name">'+esc(g.name)+(num(g.plus)?' +'+num(g.plus):'')+'</div><div class="meta">'+esc(g.side)+' | '+esc((g.cers||[]).map(cerName).join(', ')||'no ceremony')+(g.phone?' | '+esc(g.phone):'')+(g.diet?' | '+esc(g.diet):'')+'</div><div class="row" style="margin-top:6px"><button class="pill '+r+'" data-act="rsvp" data-id="'+g.id+'" style="border:0;cursor:pointer">'+lbl+'</button>'+(g.phone?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(waLink(g.phone,inviteMsg(g)))+'">WhatsApp invite</a>':'')+(g.email?'<a class="btn sec sm" href="'+esc(mailLink(g.email,'Invitation',inviteMsg(g)))+'">Email invite</a>':'')+'<button class="btn sec sm" data-act="editg" data-id="'+g.id+'">Edit</button><button class="btn del sm" data-act="delg" data-id="'+g.id+'">Delete</button></div></div></div>'});
 return h+'</div>';
}
function copyField(label,val,key){return'<div class="copyrow"><label>'+esc(label)+'<input data-pay="'+key+'" value="'+esc(val)+'"></label><button class="btn sec sm" data-act="copy" data-key="'+key+'">Copy</button></div>'}
function summaryText(){
 var pt=pledgeTotals(),L=[];
 L.push('*'+names()+' wedding committee update*');
 if(S.date)L.push('Date: '+niceDate(S.date));
 if(S.priv.amounts)L.push('Pledged: '+fmt(pt.pledged)+' | Received: '+fmt(pt.paid)+' | Still to come: '+fmt(Math.max(0,pt.pledged-pt.paid)));
 if(S.priv.names&&S.members.length){L.push('');L.push('Contributors:');S.members.forEach(function(m){L.push('- '+m.name+(S.priv.amounts?': pledged '+fmt(num(m.pledged))+', paid '+fmt(num(m.paid)):''))})}
 if(S.priv.pay){var p=S.pay,P=[];if(p.mpesa)P.push('M-Pesa send money: '+p.mpesa);if(p.paybill)P.push('Paybill: '+p.paybill+(p.account?' Account: '+p.account:''));if(p.till)P.push('Buy Goods Till: '+p.till);if(p.other)P.push(p.other);if(P.length){L.push('');L.push('How to contribute:');P.forEach(function(x){L.push(x)})}}
 L.push('');L.push('Thank you for walking with us.');
 return L.join('\n');
}
function meetMsg(){var m=S.meet;return m.title+'\nDate: '+(m.date?niceDate(m.date):'to be confirmed')+(m.time?'\nTime: '+m.time:'')+(m.place?'\nPlace: '+m.place:'')+(m.link?'\nLink: '+m.link:'')+'\nPlease reply to confirm.'}
function vCommittee(){
 var pt=pledgeTotals(),h='<h2>Committee and pledges</h2><p class="lead">Record who pledged and what has come in. Bride Villa never holds or moves money. People pay you or your treasurer directly, for example by M-Pesa.</p>';
 h+='<div class="grid"><div class="stat"><b>'+esc(fmt(pt.pledged))+'</b><span>Pledged</span></div><div class="stat"><b>'+esc(fmt(pt.paid))+'</b><span>Received</span></div><div class="stat"><b>'+esc(fmt(Math.max(0,pt.pledged-pt.paid)))+'</b><span>Still to come</span></div></div>';
 var em=editM?S.members.filter(function(m){return m.id===editM})[0]:null;em=em||{};
 h+='<form class="card f" data-form="member"><input type="hidden" name="id" value="'+esc(em.id||'')+'"><label>Name<input name="name" required value="'+esc(em.name||'')+'"></label><label>Role<select name="role">'+['Contributor','Chair','Treasurer','Secretary','Family elder','Friend','Other'].map(function(r){return'<option'+(em.role===r?' selected':'')+'>'+r+'</option>'}).join('')+'</select></label><label>Phone<input name="phone" type="tel" value="'+esc(em.phone||'')+'"></label><label>Email<input name="email" type="email" value="'+esc(em.email||'')+'"></label><label>Pledged ('+esc(S.cur)+')<input name="pledged" inputmode="decimal" value="'+esc(em.pledged||'')+'"></label><label>Paid so far<input name="paid" inputmode="decimal" value="'+esc(em.paid||'')+'"></label><div class="full row"><button class="btn">'+(em.id?'Save':'Add person')+'</button>'+(em.id?'<button type="button" class="btn sec" data-act="cancelm">Cancel</button>':'')+'</div></form>';
 h+='<div class="card"><div class="row between"><h3>People</h3><button class="btn sec sm" data-act="csvp">Download pledges (Excel)</button></div>';
 if(!S.members.length)h+='<div class="empty">No one added yet.</div>';
 S.members.forEach(function(m){var left=Math.max(0,num(m.pledged)-num(m.paid));
  var rem='Hello '+m.name+', a gentle reminder about your kind pledge towards the '+names()+' wedding'+(left?' (balance '+fmt(left)+')':'')+'. Thank you so much for your support.';
  h+='<div class="item"><div class="grow"><div class="name">'+esc(m.name)+' <span class="pill">'+esc(m.role||'Contributor')+'</span></div><div class="meta">Pledged '+esc(fmt(num(m.pledged)))+' | Paid '+esc(fmt(num(m.paid)))+' | Balance '+esc(fmt(left))+'</div>'+bar(num(m.pledged)?num(m.paid)/num(m.pledged)*100:0)+'<div class="row"><button class="btn gold sm" data-act="addpay" data-id="'+m.id+'">+ Payment</button>'+(m.phone&&left?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(waLink(m.phone,rem))+'">Gentle reminder</a>':'')+'<button class="btn sec sm" data-act="editm" data-id="'+m.id+'">Edit</button><button class="btn del sm" data-act="delm" data-id="'+m.id+'">Delete</button></div></div></div>'});
 h+='</div>';
 h+='<div class="card"><h3>Payment details to share</h3><p class="note">Add only what you want to share. Copy a detail or include it in the summary below.</p>'+copyField('M-Pesa phone number',S.pay.mpesa,'mpesa')+copyField('Paybill number',S.pay.paybill,'paybill')+copyField('Account name or number',S.pay.account,'account')+copyField('Buy Goods Till number',S.pay.till,'till')+copyField('Other (bank, PayPal, Zelle)',S.pay.other,'other')+'</div>';
 h+='<div class="card"><h3>Shared summary</h3><p class="note">Choose what the summary shows before you send it to the group.</p><div class="checks"><label><input type="checkbox" data-priv="names"'+(S.priv.names?' checked':'')+'>Show names</label><label><input type="checkbox" data-priv="amounts"'+(S.priv.amounts?' checked':'')+'>Show amounts</label><label><input type="checkbox" data-priv="pay"'+(S.priv.pay?' checked':'')+'>Show payment details</label></div><pre id="sum" style="white-space:pre-wrap;background:#fbeaf3;border-radius:10px;padding:10px;font:inherit;font-size:14px">'+esc(summaryText())+'</pre><div class="row"><a class="btn wa" target="_blank" rel="noopener" href="'+esc(waShare(summaryText()))+'">Send on WhatsApp</a><button class="btn sec" data-act="copysum">Copy text</button></div></div>';
 var m=S.meet;
 h+='<form class="card f" data-form="meet"><h3 class="full">Meeting invite</h3><label class="full">Title<input name="title" value="'+esc(m.title)+'"></label><label>Date<input name="date" type="date" value="'+esc(m.date)+'"></label><label>Time<input name="time" type="time" value="'+esc(m.time)+'"></label><label>Place<input name="place" value="'+esc(m.place)+'"></label><label>Video link<input name="link" value="'+esc(m.link)+'"></label><div class="full row"><button class="btn sec">Save</button><a class="btn wa" target="_blank" rel="noopener" href="'+esc(waShare(meetMsg()))+'">WhatsApp</a><a class="btn sec" href="'+esc(mailLink(S.members.filter(function(x){return x.email}).map(function(x){return x.email}).join(','),m.title,meetMsg()))+'">Email all</a><button type="button" class="btn sec" data-act="ics">Add to calendar (.ics)</button></div></form>';
 return h;
}
function vVendors(){
 var h='<h2>Vendors</h2><p class="lead">Keep every quote and payment in one place.</p>';
 h+='<form class="card f" data-form="vendor"><label>Name<input name="name" required></label><label>Type<select name="cat">'+VCATS.map(function(c){return'<option>'+esc(c)+'</option>'}).join('')+'</select></label><label>Phone<input name="phone" type="tel"></label><label>Status<select name="status">'+STAT.map(function(c){return'<option>'+c+'</option>'}).join('')+'</select></label><label>Quote ('+esc(S.cur)+')<input name="quote" inputmode="decimal"></label><label>Paid<input name="paid" inputmode="decimal"></label><label class="full">Notes<input name="notes"></label><div><button class="btn">Add vendor</button></div></form>';
 h+='<div class="card">';if(!S.vendors.length)h+='<div class="empty">No vendors yet.</div>';
 S.vendors.forEach(function(v){h+='<div class="item"><div class="grow"><div class="name">'+esc(v.name)+' <span class="pill">'+esc(v.status)+'</span></div><div class="meta">'+esc(v.cat)+' | Quote '+esc(fmt(num(v.quote)))+' | Paid '+esc(fmt(num(v.paid)))+(v.notes?' | '+esc(v.notes):'')+'</div><div class="row" style="margin-top:6px">'+(v.phone?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(waLink(v.phone,'Hello '+v.name+', I am planning a wedding and would like to ask about your services.'))+'">WhatsApp</a>':'')+'<button class="btn sec sm" data-act="vnext" data-id="'+v.id+'">Next status</button><button class="btn del sm" data-act="delv" data-id="'+v.id+'">Delete</button></div></div></div>'});
 return h+'</div>';
}
function vVenues(){
 var h='<h2>Venues</h2><p class="lead">Add the places you are considering. Pick the area first, then enter the venue you found.</p>';
 h+='<datalist id="areas">'+AREAS.map(function(a){return'<option value="'+a+'">'}).join('')+'</datalist>';
 h+='<form class="card f" data-form="venue"><label>Venue name<input name="name" required></label><label>Area or town<input name="area" list="areas"></label><label>For<select name="cer"><option value="general">Any</option>'+activeCers().map(function(c){return'<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join('')+'</select></label><label>Status<select name="status">'+STAT.map(function(c){return'<option>'+c+'</option>'}).join('')+'</select></label><label>Phone<input name="phone" type="tel"></label><label>Cost ('+esc(S.cur)+')<input name="cost" inputmode="decimal"></label><label class="full">Notes (capacity, parking, rooms)<input name="notes"></label><div><button class="btn">Add venue</button></div></form>';
 h+='<div class="card">';if(!S.venues.length)h+='<div class="empty">No venues yet.</div>';
 S.venues.forEach(function(v){h+='<div class="item"><div class="grow"><div class="name">'+esc(v.name)+' <span class="pill">'+esc(v.status)+'</span></div><div class="meta">'+esc(v.area||'Area not set')+' | '+esc(cerName(v.cer))+' | '+esc(fmt(num(v.cost)))+(v.notes?' | '+esc(v.notes):'')+'</div><div class="row" style="margin-top:6px">'+(v.phone?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(waLink(v.phone,'Hello, I would like to ask about booking '+v.name+' for a wedding event.'))+'">WhatsApp</a>':'')+'<a class="btn sec sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/'+encodeURIComponent(v.name+' '+(v.area||''))+'">Map</a><button class="btn sec sm" data-act="vsnext" data-id="'+v.id+'">Next status</button><button class="btn del sm" data-act="delvn" data-id="'+v.id+'">Delete</button></div></div></div>'});
 return h+'</div>';
}
function vSettings(){
 var h='<h2>Settings</h2>';
 h+='<form class="card f" data-form="settings"><label>Your names<input name="names" value="'+esc(S.names)+'" placeholder="Teresa and Peter"></label><label>Wedding date<input name="date" type="date" value="'+esc(S.date)+'"></label><label>Region<select name="region">'+Object.keys(REGIONS).map(function(k){return'<option value="'+k+'"'+(S.region===k?' selected':'')+'>'+REGIONS[k].n+'</option>'}).join('')+'</select></label><label>Main currency code<input name="cur" value="'+esc(S.cur)+'" maxlength="4"></label><label>Second currency code<input name="cur2" value="'+esc(S.cur2)+'" maxlength="4"></label><label>1 '+esc(S.cur2)+' equals how many '+esc(S.cur)+'?<input name="rate" inputmode="decimal" value="'+esc(S.rate)+'" placeholder="Enter today\'s rate yourself"></label><div class="full"><label>Ceremonies you are having</label><div class="checks">'+S.ceremonies.map(function(c){return'<label><input type="checkbox" name="cer_'+c.id+'"'+(c.on?' checked':'')+'>'+esc(c.name)+'</label>'}).join('')+'</div></div><label class="full">Invitation message. Use {guest}, {names}, {date}, {ceremony}<textarea name="inviteTpl">'+esc(S.inviteTpl)+'</textarea></label><div class="full"><button class="btn">Save settings</button></div></form>';
 h+='<div class="card"><h3>Your data</h3><p class="note">Everything is stored only in this browser on this device. Export a backup to keep it safe or to move to another device.</p><div class="row"><button class="btn" data-act="export">Export backup</button><label class="btn sec" style="margin:0;cursor:pointer">Import backup<input type="file" accept="application/json,.json" data-import style="display:none"></label><button class="btn sec" data-act="print">Print progress report</button><button class="btn del" data-act="reset">Erase everything</button></div></div>';
 return h;
}
var VIEWS={home:vHome,checklist:vChecklist,budget:vBudget,guests:vGuests,committee:vCommittee,vendors:vVendors,venues:vVenues,settings:vSettings};

function render(keepScroll){
 var app=document.getElementById('app');if(!app)return;
 var y=window.scrollY;
 app.innerHTML=VIEWS[tab]();
 document.querySelectorAll('nav [data-tab]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab)});
 if(keepScroll)window.scrollTo(0,y);
}
function setTab(t){tab=t;editG=null;editM=null;render();window.scrollTo(0,0)}

/* helpers for actions */
function fd(form){var o={},f=new FormData(form);f.forEach(function(v,k){if(k==='cers'){(o.cers=o.cers||[]).push(v)}else o[k]=v});return o}
function download(name,type,text){var a=document.createElement('a'),b=new Blob([text],{type:type});a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function csv(rows){return rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);if(/^[=+\-@]/.test(c))c="'"+c;return'"'+c.replace(/"/g,'""')+'"'}).join(',')}).join('\r\n')}
function dlCSV(name,rows){download(name,'text/csv;charset=utf-8','\ufeff'+csv(rows))}
function exportGuests(){var r=[['Name','Phone','Email','Side','Plus ones','Diet or notes','Invited to','RSVP']];S.guests.forEach(function(g){r.push([g.name,g.phone,g.email,g.side,g.plus,g.diet,(g.cers||[]).map(cerName).join('; '),g.rsvp||'pending'])});dlCSV('guest-list.csv',r)}
function exportBudget(){var r=[['Item','Category','Ceremony','Currency','Planned','Paid','Balance']];S.budget.forEach(function(b){r.push([b.name,b.cat,cerName(b.cer),curOf(b.cur),num(b.planned),num(b.paid),num(b.planned)-num(b.paid)])});dlCSV('budget.csv',r)}
function exportPledges(){var r=[['Name','Role','Phone','Email','Pledged','Paid','Balance']];S.members.forEach(function(m){r.push([m.name,m.role,m.phone,m.email,num(m.pledged),num(m.paid),Math.max(0,num(m.pledged)-num(m.paid))])});dlCSV('pledges.csv',r)}
function icsDate(d,t){var x=d.replace(/-/g,'');return t?x+'T'+t.replace(':','')+'00':x}
function makeICS(){
 var m=S.meet;if(!m.date){toast('Choose a date first, then Save');return}
 var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bride Villa//EN','BEGIN:VEVENT','UID:'+uid()+'@bridevilla','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,''),
  'SUMMARY:'+m.title.replace(/[,;]/g,' ')];
 if(m.time){L.push('DTSTART:'+icsDate(m.date,m.time));var h=parseInt(m.time.slice(0,2),10)+1;L.push('DTEND:'+icsDate(m.date,(h<10?'0':'')+(h%24)+m.time.slice(2)))}
 else{L.push('DTSTART;VALUE=DATE:'+icsDate(m.date))}
 if(m.place)L.push('LOCATION:'+m.place.replace(/[,;]/g,' '));
 L.push('DESCRIPTION:'+(m.link?'Link '+m.link:'Wedding committee'));L.push('END:VEVENT','END:VCALENDAR');
 download('committee-meeting.ics','text/calendar',L.join('\r\n'));
}
function copy(text){
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast('Copied')},function(){toast('Copy not allowed here')})}
 else toast('Copy not supported here');
}
function byId(arr,id){return arr.filter(function(x){return x.id===id})[0]}
function cycle(list,v){var i=list.indexOf(v);return list[(i+1)%list.length]}

document.addEventListener('click',function(e){
 var tb=e.target.closest('[data-tab]');if(tb){setTab(tb.getAttribute('data-tab'));return}
 var el=e.target.closest('[data-act]');if(!el)return;
 var a=el.getAttribute('data-act'),id=el.getAttribute('data-id'),x;
 if(a==='tgl'){x=byId(S.tasks,id);x.done=!x.done;save();render(true)}
 else if(a==='deltask'){S.tasks=S.tasks.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='delbud'){S.budget=S.budget.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='rsvp'){x=byId(S.guests,id);x.rsvp=cycle(['pending','yes','no'],x.rsvp||'pending');save();render(true)}
 else if(a==='editg'){editG=id;render();window.scrollTo(0,0)}
 else if(a==='cancelg'){editG=null;render()}
 else if(a==='delg'){if(confirm('Delete this guest?')){S.guests=S.guests.filter(function(t){return t.id!==id});save();render(true)}}
 else if(a==='editm'){editM=id;render();window.scrollTo(0,0)}
 else if(a==='cancelm'){editM=null;render()}
 else if(a==='delm'){if(confirm('Delete this person?')){S.members=S.members.filter(function(t){return t.id!==id});save();render(true)}}
 else if(a==='addpay'){x=byId(S.members,id);var v=prompt('Amount received from '+x.name+' ('+S.cur+')');if(v!==null){var n=num(v);if(n>0){x.paid=num(x.paid)+n;save();render(true);toast('Payment recorded')}}}
 else if(a==='copy'){copy(S.pay[el.getAttribute('data-key')]||'')}
 else if(a==='copysum'){copy(summaryText())}
 else if(a==='ics'){makeICS()}
 else if(a==='vnext'){x=byId(S.vendors,id);x.status=cycle(STAT,x.status);save();render(true)}
 else if(a==='delv'){S.vendors=S.vendors.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='vsnext'){x=byId(S.venues,id);x.status=cycle(STAT,x.status);save();render(true)}
 else if(a==='delvn'){S.venues=S.venues.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='export'){download('bride-villa-backup.json','application/json',JSON.stringify(S,null,1))}
 else if(a==='print'){window.print()}
 else if(a==='csvg'){exportGuests()}
 else if(a==='csvb'){exportBudget()}
 else if(a==='csvp'){exportPledges()}
 else if(a==='reset'){if(confirm('Erase everything on this device? Export a backup first if unsure.')){S=def();save();render();toast('Erased')}}
});

document.addEventListener('submit',function(e){
 var f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
 var k=f.getAttribute('data-form'),o=fd(f);
 if(k==='task'){S.tasks.push({id:uid(),cer:o.cer,text:o.text.trim(),done:false});toast('Task added')}
 else if(k==='total'){S.total=o.total}
 else if(k==='budget'){S.budget.push({id:uid(),name:o.name.trim(),cat:o.cat,cer:o.cer,planned:o.planned,paid:o.paid,cur:o.cur});toast('Item added')}
 else if(k==='guest'){
  var g={name:o.name.trim(),phone:o.phone.trim(),email:o.email.trim(),side:o.side,plus:Math.max(0,parseInt(o.plus,10)||0),diet:o.diet.trim(),cers:o.cers||[]};
  if(o.id){var x=byId(S.guests,o.id);Object.keys(g).forEach(function(q){x[q]=g[q]});editG=null;toast('Guest saved')}
  else{g.id=uid();g.rsvp='pending';S.guests.push(g);toast('Guest added')}
 }
 else if(k==='bulk'){
  var n=0,all=activeCers().map(function(c){return c.id});
  o.bulk.split(/\r?\n/).forEach(function(line){line=line.trim();if(!line)return;var p=line.split(/[,;\t]/).map(function(s){return s.trim()});
   var email='',phone='';p.slice(1).forEach(function(s){if(s.indexOf('@')>-1)email=s;else if(/\d/.test(s))phone=s});
   if(!p[0])return;S.guests.push({id:uid(),name:p[0],phone:phone,email:email,side:'Shared',plus:0,diet:'',cers:all.slice(),rsvp:'pending'});n++});
  toast(n+' guests added');
 }
 else if(k==='member'){
  var m={name:o.name.trim(),role:o.role,phone:o.phone.trim(),email:o.email.trim(),pledged:o.pledged,paid:o.paid};
  if(o.id){var y=byId(S.members,o.id);Object.keys(m).forEach(function(q){y[q]=m[q]});editM=null;toast('Saved')}else{m.id=uid();S.members.push(m);toast('Person added')}
 }
 else if(k==='meet'){S.meet={title:o.title,date:o.date,time:o.time,place:o.place,link:o.link};toast('Saved')}
 else if(k==='vendor'){S.vendors.push({id:uid(),name:o.name.trim(),cat:o.cat,phone:o.phone,status:o.status,quote:o.quote,paid:o.paid,notes:o.notes});toast('Vendor added')}
 else if(k==='venue'){S.venues.push({id:uid(),name:o.name.trim(),area:o.area,cer:o.cer,status:o.status,phone:o.phone,cost:o.cost,notes:o.notes});toast('Venue added')}
 else if(k==='settings'){
  S.names=o.names.trim();S.date=o.date;S.region=o.region;
  S.cur=(o.cur||'').trim().toUpperCase()||REGIONS[o.region].cur;S.cur2=(o.cur2||'').trim().toUpperCase()||'USD';S.rate=o.rate;S.inviteTpl=o.inviteTpl;
  S.ceremonies.forEach(function(c){c.on=o['cer_'+c.id]!==undefined});toast('Settings saved');
 }
 save();render(true);
});

document.addEventListener('change',function(e){
 var t=e.target;
 if(t.hasAttribute('data-filter')){gFilter[t.getAttribute('data-filter')]=t.value;render(true);return}
 if(t.hasAttribute('data-priv')){S.priv[t.getAttribute('data-priv')]=t.checked;save();render(true);return}
 if(t.hasAttribute('data-pay')){S.pay[t.getAttribute('data-pay')]=t.value.trim();save();render(true);return}
 if(t.hasAttribute('data-import')&&t.files&&t.files[0]){
  var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(!o||typeof o!=='object'||!o.tasks)throw 0;var d=def();Object.keys(d).forEach(function(k){if(o[k]===undefined)o[k]=d[k]});S=o;save();render();toast('Backup restored')}catch(x){toast('That file is not a Bride Villa backup')}};r.readAsText(t.files[0]);
 }
});
document.addEventListener('input',function(e){
 var t=e.target;
 if(t.getAttribute&&t.getAttribute('data-filter')==='q'){gFilter.q=t.value;var pos=t.selectionStart;render(true);var n=document.querySelector('[data-filter="q"]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
});

S=load();
render();
if('serviceWorker' in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('sw.js').catch(function(){})}
window.__bv={get:function(){return S},normPhone:normPhone,waLink:waLink,summaryText:summaryText};
})();
