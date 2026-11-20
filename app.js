(function(){
'use strict';
var KEY='bridevilla.v1';
var CONTACT_EMAIL='tessaakumu@yahoo.com';
var REGIONS={KE:{n:'Kenya',cur:'KES',cc:'254'},US:{n:'United States',cur:'USD',cc:'1'},EU:{n:'Europe',cur:'EUR',cc:''},OTHER:{n:'Other',cur:'USD',cc:''}};
var CURS=[['KES','Kenyan shilling'],['USD','US dollar'],['EUR','Euro'],['GBP','British pound'],['UGX','Ugandan shilling'],['TZS','Tanzanian shilling'],['RWF','Rwandan franc'],['ETB','Ethiopian birr'],['NGN','Nigerian naira'],['GHS','Ghanaian cedi'],['ZAR','South African rand'],['ZMW','Zambian kwacha'],['XOF','West African CFA franc'],['MAD','Moroccan dirham'],['EGP','Egyptian pound'],['HUF','Hungarian forint'],['CHF','Swiss franc'],['SEK','Swedish krona'],['NOK','Norwegian krone'],['DKK','Danish krone'],['PLN','Polish zloty'],['CAD','Canadian dollar'],['AUD','Australian dollar'],['NZD','New Zealand dollar'],['INR','Indian rupee'],['AED','UAE dirham'],['SAR','Saudi riyal'],['JPY','Japanese yen'],['CNY','Chinese yuan'],['BRL','Brazilian real'],['MXN','Mexican peso']];
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
var PARTNERS={disclosure:'',vendors:[],shop:[]},vtab='mine',pcat='',parea='';
var S=null,tab='home',gFilter={q:'',side:'',rsvp:'',cer:''},editG=null,editM=null;


/* languages */
var LANGS=[['en','English','en-GB'],['sw','Kiswahili','sw-KE'],['fr','Français','fr-FR']];
var FLAGS={
 en:'<svg viewBox="0 0 60 30" width="30" height="15"><clipPath id="fs"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="ft"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#fs)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#ft)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
 sw:'<svg viewBox="0 0 90 60" width="26" height="17"><rect width="90" height="18" fill="#000"/><rect y="18" width="90" height="3" fill="#fff"/><rect y="21" width="90" height="18" fill="#BB0000"/><rect y="39" width="90" height="3" fill="#fff"/><rect y="42" width="90" height="18" fill="#006600"/><path d="M30 12 60 48M60 12 30 48" stroke="#fff" stroke-width="2.5"/><ellipse cx="45" cy="30" rx="10" ry="16" fill="#BB0000"/><ellipse cx="45" cy="30" rx="10" ry="16" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="45" cy="30" rx="3.5" ry="9" fill="#fff"/><ellipse cx="45" cy="30" rx="1.5" ry="5" fill="#000"/></svg>',
 fr:'<svg viewBox="0 0 30 20" width="26" height="17"><rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#EF4135"/></svg>'
};
function detectLang(){try{var l=(navigator.language||'en').toLowerCase();if(l.indexOf('sw')===0)return'sw';if(l.indexOf('fr')===0)return'fr'}catch(e){}return'en'}
function curLang(){return(S&&S.lang)||'en'}
var PCACHE={};
function patterns(L){
 if(PCACHE[L])return PCACHE[L];var d=(window.I18N||{})[L]||{},out=[];
 Object.keys(d).forEach(function(k){if(k.indexOf('{')>-1){var n=0,src=k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{(\d)\}/g,function(){n++;return'(.+?)'});out.push({re:new RegExp('^'+src+'$'),to:d[k],len:k.length})}});
 out.sort(function(a,b){return b.len-a.len});PCACHE[L]=out;return out;
}
function tx(L,str){
 var d=(window.I18N||{})[L];if(!d||!str)return str;
 if(Object.prototype.hasOwnProperty.call(d,str))return d[str];
 if(str.indexOf(' | ')>-1)return str.split(' | ').map(function(q){return tx(L,q)}).join(' | ');
 var ps=patterns(L);
 for(var i=0;i<ps.length;i++){var m=ps[i].re.exec(str);if(m)return ps[i].to.replace(/\{(\d)\}/g,function(_,n){return m[+n+1]!==undefined?m[+n+1]:''})}
 if(str.indexOf(' | ')>-1)return str.split(' | ').map(function(q){return tx(L,q)}).join(' | ');
 if(str.indexOf(', ')>-1&&str.length<120){var pr=str.split(', '),ch=false,po=pr.map(function(q){var r=tx(L,q);if(r!==q)ch=true;return r});if(ch)return po.join(', ')}
 if(str.indexOf('\n')>-1&&str.length<400)return str.split('\n').map(function(q){return q.trim()?tx(L,q):q}).join('\n');
 return str;
}
function tr(str){var L=curLang();return L==='en'?str:tx(L,String(str))}
function tf(key,args){
 var L=curLang(),d=(window.I18N||{})[L],t=(L!=='en'&&d&&Object.prototype.hasOwnProperty.call(d,key))?d[key]:key;
 return t.replace(/\{(\d)\}/g,function(_,n){return args&&args[+n]!==undefined?args[+n]:''});
}
function translateDom(root){
 var L=curLang(),w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,nodes=[];
 while((n=w.nextNode()))nodes.push(n);
 nodes.forEach(function(t){
  var p=t.parentNode&&t.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE'||(t.parentNode&&t.parentNode.id==='sum'))return;
  if(t.__en===undefined)t.__en=t.nodeValue;
  var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(t.__en);
  var out=L==='en'?t.__en:m[1]+tx(L,m[2])+m[3];
  if(t.nodeValue!==out)t.nodeValue=out;
 });
 root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function(el){
  ['placeholder','aria-label','title'].forEach(function(a){
   if(!el.hasAttribute(a))return;el.__en=el.__en||{};if(el.__en[a]===undefined)el.__en[a]=el.getAttribute(a);
   var o=L==='en'?el.__en[a]:tx(L,el.__en[a]);if(el.getAttribute(a)!==o)el.setAttribute(a,o);
  });
 });
}
function renderLangBar(){
 var b=document.getElementById('langbar');if(!b)return;
 b.innerHTML=LANGS.map(function(l){return'<button type="button" class="lg'+(curLang()===l[0]?' on':'')+'" data-lang="'+l[0]+'" aria-label="'+l[1]+'" title="'+l[1]+'">'+FLAGS[l[0]]+'<span>'+l[0].toUpperCase()+'</span></button>'}).join('');
 document.documentElement.lang=curLang();
}
function dateLocale(){var l=LANGS.filter(function(x){return x[0]===curLang()})[0];return l?l[2]:'en-GB'}
var DEFAULT_TPL='Dear {guest}, {names} warmly invite you to our wedding ({ceremony}). Date: {date}. Please let us know if you can join us. With love.';
function isDefaultTpl(x){var I=window.I18N||{};return x===DEFAULT_TPL||(I.sw&&x===I.sw[DEFAULT_TPL])||(I.fr&&x===I.fr[DEFAULT_TPL])}
function uid(){return Math.random().toString(36).slice(2,9)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(v){var n=parseFloat(String(v==null?'':v).replace(/,/g,''));return isFinite(n)?n:0}
function def(){
 var cers=['Civil','Traditional','Church','Reception'].map(function(n){return{id:n.toLowerCase(),name:n,on:false}});
 var tasks=[];Object.keys(SEED).forEach(function(k){SEED[k].forEach(function(t){tasks.push({id:uid(),cer:k==='General'?'general':k.toLowerCase(),text:t,done:false})})});
 return{region:'KE',cur:'KES',cur2:'USD',rate:'',names:'',date:'',inviteTpl:DEFAULT_TPL,lang:detectLang(),
  ceremonies:cers,tasks:tasks,total:'',budget:[],guests:[],members:[],pay:{mpesa:'',paybill:'',account:'',till:'',other:''},priv:{names:true,amounts:true,pay:true},
  meet:{title:'Wedding committee meeting',date:'',time:'',place:'',link:''},vendors:[],venues:[],event:'wedding',setup:false,guestTarget:0,site:null}
}
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r),d=def();Object.keys(d).forEach(function(k){if(o[k]===undefined)o[k]=d[k]});return o}}catch(e){}return def()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Could not save on this device')}}
function toast(m){var t=document.getElementById('toast');if(!t)return;t.textContent=tr(m);t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},2200)}

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
function niceDate(d){if(!d)return tr('a date to be confirmed');var x=new Date(d+'T00:00:00');return isNaN(x)?d:x.toLocaleDateString(dateLocale(),{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function names(){return S.names||tr('the couple')}
function cerName(id){if(id==='general')return'General';var c=S.ceremonies.filter(function(x){return x.id===id})[0];return c?c.name:id}
function activeCers(){return S.ceremonies.filter(function(c){return c.on})}
function toMain(amount,curKey){
 if(curKey!=='second')return amount;
 var r=num(S.rate);return r>0?amount*r:null;
}
function curOf(k){return k==='second'?S.cur2:S.cur}
function inviteMsg(g){
 var cl=(g.cers&&g.cers.length?g.cers.map(function(id){return tr(cerName(id))}).join(', '):tr('wedding'));
 var tpl=isDefaultTpl(S.inviteTpl)?tr(DEFAULT_TPL):S.inviteTpl;
 return tpl.replace(/\{guest\}/g,g.name).replace(/\{names\}/g,names()).replace(/\{date\}/g,niceDate(S.date)).replace(/\{ceremony\}/g,cl);
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
 h+='<div class="card hero">'+botan('r')+'<div class="eyebrow">Bride <span class="v">V</span>illa</div><h2>'+sub+'</h2><div class="countdown">'+esc(big)+'</div><div class="note">'+esc(S.date?niceDate(S.date):'Choose a date when you are ready')+'</div></div>';
 h+='<div class="card"><h3>Event type</h3><div class="row"><button class="chip on">Bride Villa (weddings)</button><span class="chip soon">Birthday Villa: coming soon</span><span class="chip soon">Graduation Villa: coming soon</span><span class="chip soon">Baby Shower Villa: coming soon</span></div></div>';
 var vis=visibleTasks(),done=vis.filter(function(t){return t.done}).length,tot=vis.length,bt=budgetTotals(),pt=pledgeTotals();
 var yes=S.guests.filter(function(g){return g.rsvp==='yes'}).length;
 var heads=S.guests.reduce(function(a,g){return a+(g.rsvp==='yes'?1+num(g.plus):0)},0);
 h+='<div class="grid"><div class="stat"><b>'+done+'/'+tot+'</b><span>Tasks done</span></div><div class="stat"><b>'+S.guests.length+'</b><span>'+(S.guestTarget?'Guests, target '+S.guestTarget+' ('+yes+' confirmed)':'Guests ('+yes+' confirmed, '+heads+' people)')+'</span></div><div class="stat"><b>'+esc(fmt(bt.planned))+'</b><span>Planned spend</span></div><div class="stat"><b>'+esc(fmt(pt.paid))+'</b><span>Pledges received of '+esc(fmt(pt.pledged))+'</span></div></div>';
 h+='<div class="card"><h3>Progress by ceremony</h3>';
 if(!activeCers().length)h+='<div class="row between"><span class="note">No ceremonies chosen yet.</span><button class="btn sec sm" data-act="wzopen">Tailor my plan</button></div>';
 activeCers().forEach(function(c){var ts=S.tasks.filter(function(t){return t.cer===c.id}),d=ts.filter(function(t){return t.done}).length,p=ts.length?d/ts.length*100:0;
  h+='<div class="cer"><div class="row between"><b>'+esc(c.name)+'</b><span class="note">'+d+' of '+ts.length+'</span></div>'+bar(p)+'</div>'});
 h+='</div>';
 h+='<div class="card"><h3>Install Jane Cool</h3><p class="note">On Android Chrome: open the menu and tap Install app or Add to Home screen. On iPhone Safari: tap Share, then Add to Home Screen. Your plan is saved only on this device, so use Settings to export a backup now and then.</p></div>';
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
  h+='<div class="item"><span class="num">'+(S.guests.indexOf(g)+1)+'</span><div class="grow"><div class="name">'+esc(g.name)+(num(g.plus)?' +'+num(g.plus):'')+'</div><div class="meta">'+esc(g.side)+' | '+esc((g.cers||[]).map(cerName).join(', ')||'no ceremony')+(g.phone?' | '+esc(g.phone):'')+(g.diet?' | '+esc(g.diet):'')+'</div><div class="row" style="margin-top:6px"><button class="pill '+r+'" data-act="rsvp" data-id="'+g.id+'" style="border:0;cursor:pointer">'+lbl+'</button>'+(g.phone?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(waLink(g.phone,inviteMsg(g)))+'">WhatsApp invite</a>':'')+(g.email?'<a class="btn sec sm" href="'+esc(mailLink(g.email,'Invitation',inviteMsg(g)))+'">Email invite</a>':'')+'<button class="btn sec sm" data-act="editg" data-id="'+g.id+'">Edit</button><button class="btn del sm" data-act="delg" data-id="'+g.id+'">Delete</button></div></div></div>'});
 return h+'</div>';
}
function copyField(label,val,key){return'<div class="copyrow"><label>'+esc(label)+'<input data-pay="'+key+'" value="'+esc(val)+'"></label><button class="btn sec sm" data-act="copy" data-key="'+key+'">Copy</button></div>'}
function summaryText(){
 var pt=pledgeTotals(),L=[];
 L.push('*'+tf('{0} wedding committee update',[names()])+'*');
 if(S.date)L.push(tf('Date: {0}',[niceDate(S.date)]));
 if(S.priv.amounts)L.push(tf('Pledged: {0} | Received: {1} | Still to come: {2}',[fmt(pt.pledged),fmt(pt.paid),fmt(Math.max(0,pt.pledged-pt.paid))]));
 if(S.priv.names&&S.members.length){L.push('');L.push(tf('Contributors:'));S.members.forEach(function(m){L.push(S.priv.amounts?tf('- {0}: pledged {1}, paid {2}',[m.name,fmt(num(m.pledged)),fmt(num(m.paid))]):'- '+m.name)})}
 if(S.priv.pay){var p=S.pay,P=[];if(p.mpesa)P.push(tf('M-Pesa send money: {0}',[p.mpesa]));if(p.paybill)P.push(p.account?tf('Paybill: {0}, Account: {1}',[p.paybill,p.account]):tf('Paybill: {0}',[p.paybill]));if(p.till)P.push(tf('Buy Goods Till: {0}',[p.till]));if(p.other)P.push(p.other);if(P.length){L.push('');L.push(tf('How to contribute:'));P.forEach(function(x){L.push(x)})}}
 L.push('');L.push(tf('Thank you for walking with us.'));
 return L.join('\n');
}
function meetMsg(){var m=S.meet;return m.title+'\n'+tf('Date: {0}',[m.date?niceDate(m.date):tr('to be confirmed')])+(m.time?'\n'+tf('Time: {0}',[m.time]):'')+(m.place?'\n'+tf('Place: {0}',[m.place]):'')+(m.link?'\n'+tf('Link: {0}',[m.link]):'')+'\n'+tf('Please reply to confirm.')}
function vCommittee(){
 var pt=pledgeTotals(),h='<h2>Committee and pledges</h2><p class="lead">Record who pledged and what has come in. Bride Villa never holds or moves money. People pay you or your treasurer directly, for example by M-Pesa.</p>';
 h+='<div class="grid"><div class="stat"><b>'+esc(fmt(pt.pledged))+'</b><span>Pledged</span></div><div class="stat"><b>'+esc(fmt(pt.paid))+'</b><span>Received</span></div><div class="stat"><b>'+esc(fmt(Math.max(0,pt.pledged-pt.paid)))+'</b><span>Still to come</span></div></div>';
 var em=editM?S.members.filter(function(m){return m.id===editM})[0]:null;em=em||{};
 h+='<form class="card f" data-form="member"><input type="hidden" name="id" value="'+esc(em.id||'')+'"><label>Name<input name="name" required value="'+esc(em.name||'')+'"></label><label>Role<select name="role">'+['Contributor','Chair','Treasurer','Secretary','Family elder','Friend','Other'].map(function(r){return'<option'+(em.role===r?' selected':'')+'>'+r+'</option>'}).join('')+'</select></label><label>Phone<input name="phone" type="tel" value="'+esc(em.phone||'')+'"></label><label>Email<input name="email" type="email" value="'+esc(em.email||'')+'"></label><label>Pledged ('+esc(S.cur)+')<input name="pledged" inputmode="decimal" value="'+esc(em.pledged||'')+'"></label><label>Paid so far<input name="paid" inputmode="decimal" value="'+esc(em.paid||'')+'"></label><div class="full row"><button class="btn">'+(em.id?'Save':'Add person')+'</button>'+(em.id?'<button type="button" class="btn sec" data-act="cancelm">Cancel</button>':'')+'</div></form>';
 h+='<div class="card"><div class="row between"><h3>People</h3><button class="btn sec sm" data-act="csvp">Download pledges (Excel)</button></div>';
 if(!S.members.length)h+='<div class="empty">No one added yet.</div>';
 S.members.forEach(function(m){var left=Math.max(0,num(m.pledged)-num(m.paid));
  var rem=left?tf('Hello {0}, a gentle reminder about your kind pledge towards the {1} wedding (balance {2}). Thank you so much for your support.',[m.name,names(),fmt(left)]):tf('Hello {0}, a gentle reminder about your kind pledge towards the {1} wedding. Thank you so much for your support.',[m.name,names()]);
  h+='<div class="item"><div class="grow"><div class="name">'+esc(m.name)+' <span class="pill">'+esc(m.role||'Contributor')+'</span></div><div class="meta">Pledged '+esc(fmt(num(m.pledged)))+' | Paid '+esc(fmt(num(m.paid)))+' | Balance '+esc(fmt(left))+'</div>'+bar(num(m.pledged)?num(m.paid)/num(m.pledged)*100:0)+'<div class="row"><button class="btn gold sm" data-act="addpay" data-id="'+m.id+'">+ Payment</button>'+(m.phone&&left?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(waLink(m.phone,rem))+'">Gentle reminder</a>':'')+'<button class="btn sec sm" data-act="editm" data-id="'+m.id+'">Edit</button><button class="btn del sm" data-act="delm" data-id="'+m.id+'">Delete</button></div></div></div>'});
 h+='</div>';
 h+='<div class="card"><h3>Payment details to share</h3><p class="note">Add only what you want to share. Copy a detail or include it in the summary below.</p>'+copyField('M-Pesa phone number',S.pay.mpesa,'mpesa')+copyField('Paybill number',S.pay.paybill,'paybill')+copyField('Account name or number',S.pay.account,'account')+copyField('Buy Goods Till number',S.pay.till,'till')+copyField('Other (bank, PayPal, Zelle)',S.pay.other,'other')+'</div>';
 h+='<div class="card"><h3>Shared summary</h3><p class="note">Choose what the summary shows before you send it to the group.</p><div class="checks"><label><input type="checkbox" data-priv="names"'+(S.priv.names?' checked':'')+'>Show names</label><label><input type="checkbox" data-priv="amounts"'+(S.priv.amounts?' checked':'')+'>Show amounts</label><label><input type="checkbox" data-priv="pay"'+(S.priv.pay?' checked':'')+'>Show payment details</label></div><pre id="sum" style="white-space:pre-wrap;background:#fbeaf3;border-radius:10px;padding:10px;font:inherit;font-size:14px">'+esc(summaryText())+'</pre><div class="row"><a class="btn wa" target="_blank" rel="noopener" href="'+esc(waShare(summaryText()))+'">Send on WhatsApp</a><button class="btn sec" data-act="copysum">Copy text</button></div></div>';
 var m=S.meet;
 h+='<form class="card f" data-form="meet"><h3 class="full">Meeting invite</h3><label class="full">Title<input name="title" value="'+esc(m.title)+'"></label><label>Date<input name="date" type="date" value="'+esc(m.date)+'"></label><label>Time<input name="time" type="time" value="'+esc(m.time)+'"></label><label>Place<input name="place" value="'+esc(m.place)+'"></label><label>Video link<input name="link" value="'+esc(m.link)+'"></label><div class="full row"><button class="btn sec">Save</button><a class="btn wa" target="_blank" rel="noopener" href="'+esc(waShare(meetMsg()))+'">WhatsApp</a><a class="btn sec" href="'+esc(mailLink(S.members.filter(function(x){return x.email}).map(function(x){return x.email}).join(','),m.title,meetMsg()))+'">Email all</a><button type="button" class="btn sec" data-act="ics">Add to calendar (.ics)</button></div></form>';
 return h;
}
function vVendors(){
 var h='<h2>Vendors</h2><p class="lead">Use the Jane Cool partner list, or keep your own vendors, quotes and payments in one place.</p>'+subTabs(vtab,[['mine','My vendors'],['jane','Jane Cool partner list'],['join','Are you a vendor?']]);
 if(vtab==='jane')return h+partnerList();
 if(vtab==='join')return h+vendorJoin();
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
 var h='<h2>Settings</h2><div class="card row between"><span>Want to answer the quick questions again?</span><button class="btn sec" data-act="wzopen">Tailor my plan</button></div>';
 h+='<form class="card f" data-form="settings"><label>Your names<input name="names" value="'+esc(S.names)+'" placeholder="e.g. Amina and David"></label><label>Wedding date<input name="date" type="date" value="'+esc(S.date)+'"></label><label>Region<select name="region">'+Object.keys(REGIONS).map(function(k){return'<option value="'+k+'"'+(S.region===k?' selected':'')+'>'+REGIONS[k].n+'</option>'}).join('')+'</select></label><label>Main currency'+curSelect('cur',S.cur)+'</label><label>Second currency'+curSelect('cur2',S.cur2)+'</label><label>1 '+esc(S.cur2)+' equals how many '+esc(S.cur)+'?<input name="rate" inputmode="decimal" value="'+esc(S.rate)+'" placeholder="Enter today\'s rate yourself"></label><div class="full"><label>Type of wedding and extras. Choose only what you are planning</label><div class="checks">'+S.ceremonies.map(function(c){return'<label><input type="checkbox" name="cer_'+c.id+'"'+(c.on?' checked':'')+'>'+esc(c.name)+'</label>'}).join('')+'</div></div><label class="full">Invitation message. Use {guest}, {names}, {date}, {ceremony}<textarea name="inviteTpl">'+esc(S.inviteTpl)+'</textarea></label><div class="full"><button class="btn">Save settings</button></div></form>';
 h+='<div class="card"><h3>Your data</h3><p class="note">Everything is stored only in this browser on this device. Export a backup to keep it safe or to move to another device.</p><div class="row"><button class="btn" data-act="export">Export backup</button><label class="btn sec" style="margin:0;cursor:pointer">Import backup<input type="file" accept="application/json,.json" data-import style="display:none"></label><button class="btn sec" data-act="print">Print progress report</button><button class="btn del" data-act="reset">Erase everything</button></div></div>';
 return h;
}

function visibleTasks(){var on={general:1};activeCers().forEach(function(c){on[c.id]=1});return S.tasks.filter(function(t){return on[t.cer]})}
function pwaLink(num,msg){var d=String(num||'').replace(/\D/g,'');return'https://wa.me/'+d+'?text='+encodeURIComponent(msg)}
function curSelect(name,val){
 var list=CURS.slice();if(val&&!list.some(function(c){return c[0]===val}))list.unshift([val,'Your currency']);
 return'<select name="'+name+'">'+list.map(function(c){return'<option value="'+esc(c[0])+'"'+(c[0]===val?' selected':'')+'>'+esc(c[0])+', '+esc(c[1])+'</option>'}).join('')+'</select>';
}
function safeUrl(u){u=String(u||'').trim();return/^https?:\/\//i.test(u)?u:''}
function subTabs(cur,items){return'<div class="row" style="margin-bottom:12px">'+items.map(function(i){return'<button class="chip'+(cur===i[0]?' on':'')+'" data-act="vtab" data-v="'+i[0]+'">'+esc(i[1])+'</button>'}).join('')+'</div>'}
function safeImg(u){u=String(u||'').trim();return(/^https:\/\//i.test(u)||/^photos\/[\w.\-\/]+$/i.test(u))?u:''}
function moneyTxt(n,cur){return(cur||'')+' '+Number(n).toLocaleString('en-US')}
function priceHtml(v){
 var h='',cur=v.currency||'';
 var a=num(v.priceFrom),b=num(v.priceTo);
 if(a&&b)h+='<div class="price">Typically '+esc(moneyTxt(a,cur))+' to '+esc(moneyTxt(b,cur))+'</div>';
 else if(a)h+='<div class="price">From '+esc(moneyTxt(a,cur))+'</div>';
 if(v.priceNote)h+='<div class="pk">'+esc(v.priceNote)+'</div>';
 (Array.isArray(v.packages)?v.packages:[]).forEach(function(p){if(p&&p.name)h+='<div class="pk"><b>'+esc(p.name)+'</b>'+(p.guests?' for up to '+esc(p.guests)+' guests':'')+(p.from?': from '+esc(moneyTxt(num(p.from),p.currency||cur)):'')+'</div>'});
 if(h&&v.confirmed)h+='<div class="note">Prices last confirmed '+esc(v.confirmed)+'</div>';
 return h;
}
function partnerList(){
 if(S.region!=='KE')return'<div class="card"><h3>Jane Cool partner list</h3><p class="note">Our partner list currently covers Kenya only. Other countries are coming soon. In the meantime, add your own vendors under My vendors, or change your region to Kenya in Settings to see it.</p></div>';
 var L=(PARTNERS.vendors||[]).filter(function(v){return!v.country||String(v.country).toLowerCase()==='kenya'}),h='<div class="card"><h3>Jane Cool partner list</h3><p class="note">These vendors are chosen and listed by Jane Cool. Prices are ranges shared by the vendors and can change, so always confirm with the vendor. You are free to use them, or find your own under My vendors.'+(PARTNERS.disclosure?' '+esc(PARTNERS.disclosure):'')+'</p></div>';
 if(!L.length)return h+'<div class="card empty">The Jane Cool partner list is coming soon. In the meantime, add your own vendors under My vendors.</div>';
 var cats=[],areas=[];L.forEach(function(v){var c=v.category||'Other';if(cats.indexOf(c)<0)cats.push(c);if(v.area&&areas.indexOf(v.area)<0)areas.push(v.area)});
 h+='<div class="card"><div class="row"><label style="flex:1;min-width:160px">Type<select data-pcat><option value="">All types</option>'+cats.map(function(c){return'<option'+(pcat===c?' selected':'')+'>'+esc(c)+'</option>'}).join('')+'</select></label><label style="flex:1;min-width:160px">Area<select data-parea><option value="">All areas</option>'+areas.map(function(c){return'<option'+(parea===c?' selected':'')+'>'+esc(c)+'</option>'}).join('')+'</select></label></div></div><div class="card">';
 var shown=0;
 L.forEach(function(v,i){
  if(pcat&&(v.category||'Other')!==pcat)return;if(parea&&v.area!==parea)return;shown++;
  var w=safeUrl(v.website),ig=String(v.instagram||'').replace(/^@/,'').replace(/[^\w.]/g,''),ph=(Array.isArray(v.photos)?v.photos:[]).map(safeImg).filter(Boolean).slice(0,3);
  h+='<div class="item"><div class="grow"><div class="name">'+esc(v.name)+' <span class="pill">Jane Cool partner</span></div><div class="meta">'+esc(v.category||'')+(v.area?' | '+esc(v.area):'')+(v.country?' | '+esc(v.country):'')+'</div>'+priceHtml(v)+(v.note?'<div class="meta">'+esc(v.note)+'</div>':'')+(ph.length?'<div class="ph">'+ph.map(function(u){return'<img loading="lazy" src="'+esc(u)+'" alt="'+esc(v.name)+'">'}).join('')+'</div>':'')+'<div class="row" style="margin-top:8px">'+(v.whatsapp?'<a class="btn wa sm" target="_blank" rel="noopener" href="'+esc(pwaLink(v.whatsapp,'Hello '+v.name+', I found you on Jane Cool and would like to ask about your services for my wedding.'))+'">WhatsApp</a>':'')+(ig?'<a class="btn sec sm" target="_blank" rel="noopener" href="https://instagram.com/'+esc(ig)+'">Instagram</a>':'')+(w?'<a class="btn sec sm" target="_blank" rel="noopener sponsored" href="'+esc(w)+'">Website</a>':'')+'<button class="btn sec sm" data-act="savep" data-i="'+i+'">Save to My vendors</button></div></div></div>';
 });
 if(!shown)h+='<div class="empty">No vendors match this filter.</div>';
 return h+'</div>';
}
function vendorJoin(){
 return'<div class="card"><h3>Join the Jane Cool partner list</h3><p class="note">Are you a florist, decorator, caterer, photographer, venue or another wedding professional? Tell us about your business. Your details open in an email to the Jane Cool team, and nothing is published until we agree on it together. There is no payment to apply.</p></div>'+
 '<form class="card f" data-form="join"><label>Business name<input name="biz" required></label><label>Type of business<select name="cat">'+VCATS.map(function(c){return'<option>'+esc(c)+'</option>'}).join('')+'</select></label><label>Your name<input name="who" required></label><label>Area and country<input name="area" placeholder="e.g. Nairobi, Kenya"></label><label>WhatsApp number with country code<input name="phone" type="tel" placeholder="e.g. 254700000000"></label><label>Instagram handle<input name="ig" placeholder="@yourbusiness"></label><label>Website, if any<input name="web"></label><label>Currency<input name="cur" value="KES" maxlength="4"></label><label>Prices start from<input name="from" inputmode="decimal"></label><label>Prices go up to<input name="to" inputmode="decimal"></label><label class="full">Packages, for example a full setup for 100 guests and the starting price<textarea name="pk"></textarea></label><label class="full">Anything else you would like us to know<textarea name="msg"></textarea></label><div class="full note">After you send the email, please attach 2 or 3 photos of your work that you own the rights to, and say that you give us permission to share them.</div><div class="full"><button class="btn gold">Open email to apply</button></div></form>';
}
function joinSend(o){
 var L=['Partner application for Jane Cool','','Business: '+o.biz,'Type: '+o.cat,'Contact: '+o.who,'Area: '+(o.area||''),'WhatsApp: '+(o.phone||''),'Instagram: '+(o.ig||''),'Website: '+(o.web||''),'Price range: '+(o.cur||'')+' '+(o.from||'?')+' to '+(o.to||'?'),'','Packages:',o.pk||'','','Notes:',o.msg||'','','I will attach photos I own the rights to and give Jane Cool permission to share them.'];
 var url=mailLink(CONTACT_EMAIL,'Partner application: '+o.biz,L.join('\n'));
 window.__bv.lastMail=url;window.location.href=url;toast('Opening your email app');
}
function vShop(){
 var L=PARTNERS.shop||[],h='<h2>DIY and shop</h2><p class="lead">Ideas and supplies for planning your wedding your way.</p>';
 if(!L.length)return h+'<div class="card empty">The Jane Cool shop is coming soon.</div>';
 h+='<div class="shopgrid">';
 L.forEach(function(p){var u=safeUrl(p.url);
  h+='<div class="card"><div class="src">'+esc(p.source||'Jane Cool shop')+'</div><h3>'+esc(p.title)+'</h3><div class="note">'+esc(p.description||'')+'</div>'+(p.price?'<b>'+esc(p.price)+'</b>':'')+(u?'<div><a class="btn coral sm" target="_blank" rel="noopener sponsored" href="'+esc(u)+'">View</a></div>':'')+'</div>';
 });
 h+='</div>';
 if(PARTNERS.disclosure)h+='<p class="note" style="margin-top:12px">'+esc(PARTNERS.disclosure)+'</p>';
 return h;
}
var W=null;
function wizInit(){
 W={step:0,cers:{},reception:false,guests:0,names:S.names,date:S.date,region:S.region,cur:S.cur,total:S.total};
 S.ceremonies.forEach(function(c){if(c.id!=='reception')W.cers[c.id]=c.on});
 var r=S.ceremonies.filter(function(c){return c.id==='reception'})[0];W.reception=!!(r&&r.on);W.guests=S.guestTarget||0;
}
function bub(label,act,k,v,on,off){return'<button type="button" class="chip big'+(on?' on':'')+(off?' soon':'')+'"'+(off?' disabled':' data-act="'+act+'" data-k="'+k+'" data-v="'+esc(v)+'"')+'>'+esc(label)+'</button>'}
function vWizard(){
 if(!W)wizInit();
 var N=6,st=W.step,h='<div class="card hero big">'+botan('l')+botan('r')+'<div class="eyebrow">Welcome to</div><h1><span class="j">J</span>ane <span class="j">C</span>ool</h1><p>Plan the celebration you have been dreaming of. A few quick questions help us tailor your plan, and you can change every answer later.</p></div>';
 h+='<div class="card"><div class="row between"><span class="note">Question '+(st+1)+' of '+N+'</span><button class="btn sec sm" data-act="wzskip">Skip, I will explore on my own</button></div>'+bar((st+1)/N*100);
 if(st===0){
  h+='<h3>What are you planning?</h3><div class="row">'+bub('Bride Villa: a wedding','wzpick','event','wedding',true)+bub('Birthday Villa: coming soon','','','',false,true)+bub('Graduation Villa: coming soon','','','',false,true)+bub('Baby Shower Villa: coming soon','','','',false,true)+'</div>';
 }else if(st===1){
  h+='<h3>What kind of wedding are you planning?</h3><p class="note">Choose one or more. Not sure? Pick your best guess.</p><div class="row">'+S.ceremonies.filter(function(c){return c.id!=='reception'}).map(function(c){return bub(c.name+' wedding','wztoggle','cer',c.id,!!W.cers[c.id])}).join('')+'</div>';
 }else if(st===2){
  h+='<h3>Will you also have a reception or party?</h3><div class="row">'+bub('Yes, a reception','wzpick','reception','1',W.reception)+bub('No, not for now','wzpick','reception','0',!W.reception)+'</div>';
 }else if(st===3){
  h+='<h3>Roughly how many guests?</h3><p class="note">A guess is fine. It only helps us track your guest list.</p><div class="row">'+[['Up to 50',50],['50 to 100',100],['100 to 200',200],['200 to 400',400],['400 or more',600],['Not sure yet',0]].map(function(g){return bub(g[0],'wzpick','guests',String(g[1]),W.guests===g[1])}).join('')+'</div>';
 }else if(st===4){
  h+='<h3>Where are you planning, and which currency?</h3><form class="f" onsubmit="return false"><label>Country or region<select data-wzf="region">'+Object.keys(REGIONS).map(function(k){return'<option value="'+k+'"'+(W.region===k?' selected':'')+'>'+REGIONS[k].n+'</option>'}).join('')+'</select></label><label>Currency'+curSelect('cur',W.cur).replace('<select name="cur">','<select name="cur" data-wzf="cur">')+'</label></form>';
 }else{
  h+='<h3>Last bit, all optional</h3><form class="f" onsubmit="return false"><label>Your names<input id="wz_names" value="'+esc(W.names)+'" placeholder="e.g. Amina and David"></label><label>Wedding date<input id="wz_date" type="date" value="'+esc(W.date)+'"></label><label>Total budget in '+esc(W.cur)+'<input id="wz_total" inputmode="decimal" value="'+esc(W.total)+'" placeholder="You can add this later"></label></form>';
 }
 h+='<div class="row" style="margin-top:16px">'+(st>0?'<button class="btn sec" data-act="wzback">Back</button>':'')+(st<N-1?'<button class="btn gold" data-act="wznext">Next</button>':'<button class="btn gold" data-act="wzfinish">Start planning</button>')+'</div></div>';
 return h;
}
function loadPartners(){
 if(location.protocol==='file:'||!window.fetch)return;
 fetch('partners.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){
  if(j&&typeof j==='object'){PARTNERS={disclosure:String(j.disclosure||''),vendors:Array.isArray(j.vendors)?j.vendors:[],shop:Array.isArray(j.shop)?j.shop:[]};if(tab==='vendors'||tab==='shop')render(true)}
 }).catch(function(){});
}
function botan(cls){
 var P=[[30,250],[45,170],[90,90],[170,20]],out='',k;
 function bz(t){var u=1-t;return[u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0],u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1]]}
 for(k=1;k<=10;k++){var t=k/11,a=bz(t),b=bz(t+.01),ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,side=k%2?-1:1;
  out+='<ellipse rx="'+(17-k*.6).toFixed(1)+'" ry="6.5" transform="translate('+a[0].toFixed(1)+' '+a[1].toFixed(1)+') rotate('+(ang+side*50).toFixed(1)+') translate(14 0)"/>'}
 return'<svg class="botan '+cls+'" viewBox="0 0 200 260" aria-hidden="true"><path d="M30 250C45 170 90 90 170 20" fill="none" stroke="#7b8a62" stroke-width="2" opacity=".7"/><g fill="#7b8a62" fill-opacity=".28" stroke="#7b8a62" stroke-opacity=".5" stroke-width=".8">'+out+'</g><g fill="#d8c08c"><circle cx="176" cy="16" r="3.2"/><circle cx="186" cy="30" r="2.4"/><circle cx="60" cy="236" r="2.6"/></g></svg>';
}
var THEMES=[['sage','Sage'],['blush','Blush'],['champagne','Champagne']];
function siteData(){
 var st=S.site||{},ev=[];
 activeCers().forEach(function(c){var e=(st.ev&&st.ev[c.id])||{};ev.push({i:c.id,n:c.name,d:e.d||S.date||'',t:e.t||'',p:e.p||'',m:safeUrl(e.m)})});
 var o={v:1,n:S.names||'',d:S.date||'',t:st.tagline||'',s:st.story||'',dr:st.dress||'',rp:normPhone(st.rsvp||''),rb:st.rsvpBy||'',th:st.theme||'sage',l:curLang(),ev:ev};
 if(st.contrib){var p=S.pay||{},c={};if(p.mpesa)c.mp=p.mpesa;if(p.paybill)c.pb=p.paybill;if(p.account)c.ac=p.account;if(p.till)c.tl=p.till;if(p.other)c.ot=p.other;o.c=c}
 return o;
}
function siteLink(){
 var j=JSON.stringify(siteData()),b=btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 return new URL('w.html',location.href).href+'#'+b;
}
function vSite(){
 var st=S.site||{},h='<h2>Wedding page</h2><p class="lead">Create a simple page for your guests with the details of your day. Your planning stays private. Only what you enter here is shared.</p>';
 h+='<div class="card"><p class="note">Anyone who has your link can see this page, so do not add anything private. If you share payment details, they will be visible to everyone with the link.</p></div>';
 h+='<form class="card f" data-form="site"><label>Your names<input name="names" value="'+esc(S.names)+'" placeholder="e.g. Amina and David"></label><label>Short welcome line<input name="tagline" value="'+esc(st.tagline||'')+'" placeholder="e.g. We are getting married!"></label><label>Style<select name="theme">'+THEMES.map(function(t){return'<option value="'+t[0]+'"'+((st.theme||'sage')===t[0]?' selected':'')+'>'+t[1]+'</option>'}).join('')+'</select></label><label>Reply on WhatsApp number, with country code<input name="rsvp" type="tel" value="'+esc(st.rsvp||'')+'" placeholder="e.g. 254700000000"></label><label>Please reply by<input name="rsvpBy" type="date" value="'+esc(st.rsvpBy||'')+'"></label><label>Dress code<input name="dress" value="'+esc(st.dress||'')+'" placeholder="e.g. Smart casual in sage and cream"></label><label class="full">Our story<textarea name="story">'+esc(st.story||'')+'</textarea></label>';
 var cs=activeCers();
 if(!cs.length)h+='<div class="full note">Choose your ceremonies in Settings to add their times and places.</div>';
 cs.forEach(function(c){var e=(st.ev&&st.ev[c.id])||{};
  h+='<div class="full"><h3>'+esc(c.name)+'</h3></div><label>Date<input name="ev_'+c.id+'_d" type="date" value="'+esc(e.d||S.date||'')+'"></label><label>Time<input name="ev_'+c.id+'_t" type="time" value="'+esc(e.t||'')+'"></label><label>Place<input name="ev_'+c.id+'_p" value="'+esc(e.p||'')+'"></label><label>Map link, from Google Maps<input name="ev_'+c.id+'_m" value="'+esc(e.m||'')+'" placeholder="https://"></label>'});
 h+='<div class="full"><div class="checks"><label><input type="checkbox" name="contrib"'+(st.contrib?' checked':'')+'>Show my payment details for contributions (from the Committee tab)</label></div></div><div class="full"><button class="btn gold">Save and create my page</button></div></form>';
 if(S.site){
  var link=siteLink();
  h+='<div class="card"><h3>Your page is ready</h3><p class="note">Share this link with your guests. If you change anything, save again and share the new link.</p><div class="site-prev">'+esc(link)+'</div>'+(link.length>1900?'<p class="note">Your link is quite long and some apps may cut it. Try a shorter story.</p>':'')+'<div class="row" style="margin-top:12px"><a class="btn" target="_blank" rel="noopener" href="'+esc(link)+'">Open preview</a><a class="btn wa" target="_blank" rel="noopener" href="'+esc(waShare(tf('Our wedding details are here: {0}',[link])))+'">Share on WhatsApp</a><button class="btn sec" data-act="copysite">Copy link</button></div></div>';
 }
 return h;
}
var VIEWS={site:vSite,shop:vShop,home:vHome,checklist:vChecklist,budget:vBudget,guests:vGuests,committee:vCommittee,vendors:vVendors,venues:vVenues,settings:vSettings};

function render(keepScroll){
 var app=document.getElementById('app');if(!app)return;
 var y=window.scrollY;
 var setup=!S.setup||!!W;
 document.body.classList.toggle('setup',setup);
 app.innerHTML=setup?vWizard():VIEWS[tab]();
 document.querySelectorAll('nav [data-tab]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab)});
 translateDom(document.body);renderLangBar();
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
 var lb=e.target.closest('[data-lang]');if(lb){S.lang=lb.getAttribute('data-lang');save();render(true);return}
 var tb=e.target.closest('[data-tab]');if(tb){setTab(tb.getAttribute('data-tab'));return}
 var el=e.target.closest('[data-act]');if(!el)return;
 var a=el.getAttribute('data-act'),id=el.getAttribute('data-id'),x;
 if(a==='tgl'){x=byId(S.tasks,id);x.done=!x.done;save();render(true)}
 else if(a==='deltask'){S.tasks=S.tasks.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='delbud'){S.budget=S.budget.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='rsvp'){x=byId(S.guests,id);x.rsvp=cycle(['pending','yes','no'],x.rsvp||'pending');save();render(true)}
 else if(a==='editg'){editG=id;render();window.scrollTo(0,0)}
 else if(a==='cancelg'){editG=null;render()}
 else if(a==='delg'){if(confirm(tr('Delete this guest?'))){S.guests=S.guests.filter(function(t){return t.id!==id});save();render(true)}}
 else if(a==='editm'){editM=id;render();window.scrollTo(0,0)}
 else if(a==='cancelm'){editM=null;render()}
 else if(a==='delm'){if(confirm(tr('Delete this person?'))){S.members=S.members.filter(function(t){return t.id!==id});save();render(true)}}
 else if(a==='addpay'){x=byId(S.members,id);var v=prompt(tf('Amount received from {0} ({1})',[x.name,S.cur]));if(v!==null){var n=num(v);if(n>0){x.paid=num(x.paid)+n;save();render(true);toast('Payment recorded')}}}
 else if(a==='copy'){copy(S.pay[el.getAttribute('data-key')]||'')}
 else if(a==='copysum'){copy(summaryText())}
 else if(a==='copysite'){copy(siteLink())}
 else if(a==='ics'){makeICS()}
 else if(a==='vnext'){x=byId(S.vendors,id);x.status=cycle(STAT,x.status);save();render(true)}
 else if(a==='delv'){S.vendors=S.vendors.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='vsnext'){x=byId(S.venues,id);x.status=cycle(STAT,x.status);save();render(true)}
 else if(a==='delvn'){S.venues=S.venues.filter(function(t){return t.id!==id});save();render(true)}
 else if(a==='wzopen'){W=null;wizInit();render();window.scrollTo(0,0)}
 else if(a==='wzpick'){var wk=el.getAttribute('data-k'),wv=el.getAttribute('data-v');if(wk==='reception')W.reception=wv==='1';else if(wk==='guests')W.guests=parseInt(wv,10)||0;render(true)}
 else if(a==='wztoggle'){var ck=el.getAttribute('data-v');W.cers[ck]=!W.cers[ck];render(true)}
 else if(a==='wznext'){if(W.step===1&&!Object.keys(W.cers).some(function(q){return W.cers[q]})){toast('Choose at least one, or skip the questions');return}W.step++;render();window.scrollTo(0,0)}
 else if(a==='wzback'){W.step=Math.max(0,W.step-1);render();window.scrollTo(0,0)}
 else if(a==='wzskip'){S.setup=true;W=null;tab='home';save();render();window.scrollTo(0,0);toast('You can tailor your plan any time from Home or Settings')}
 else if(a==='wzfinish'){
  var gv=function(i){var n=document.getElementById(i);return n?n.value:''};
  S.names=gv('wz_names').trim();S.date=gv('wz_date');if(gv('wz_total'))S.total=gv('wz_total');
  S.region=W.region;S.cur=W.cur;S.cur2=S.cur==='USD'?'EUR':'USD';S.guestTarget=W.guests;
  S.ceremonies.forEach(function(c){c.on=c.id==='reception'?W.reception:!!W.cers[c.id]});
  S.setup=true;W=null;tab='home';save();render();window.scrollTo(0,0);toast('All set. Enjoy planning!')}
 else if(a==='vtab'){vtab=el.getAttribute('data-v');render(true)}
 else if(a==='savep'){var pv=(PARTNERS.vendors||[])[parseInt(el.getAttribute('data-i'),10)];if(pv){S.vendors.push({id:uid(),name:String(pv.name||''),cat:String(pv.category||'Other'),phone:pv.whatsapp?'+'+String(pv.whatsapp).replace(/\D/g,''):String(pv.phone||''),status:'Shortlist',quote:'',paid:'',notes:'From the Jane Cool list'});save();toast('Saved to My vendors')}}
 else if(a==='export'){download('bride-villa-backup.json','application/json',JSON.stringify(S,null,1))}
 else if(a==='print'){window.print()}
 else if(a==='csvg'){exportGuests()}
 else if(a==='csvb'){exportBudget()}
 else if(a==='csvp'){exportPledges()}
 else if(a==='reset'){if(confirm(tr('Erase everything on this device? Export a backup first if unsure.'))){var keepL=S.lang;S=def();S.lang=keepL;save();render();toast('Erased')}}
});

document.addEventListener('submit',function(e){
 var f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
 var k=f.getAttribute('data-form'),o=fd(f);
 if(k==='join'){joinSend(o);return}
 if(k==='site'){var sev={};activeCers().forEach(function(c){sev[c.id]={d:o['ev_'+c.id+'_d']||'',t:o['ev_'+c.id+'_t']||'',p:(o['ev_'+c.id+'_p']||'').trim(),m:(o['ev_'+c.id+'_m']||'').trim()}});S.names=(o.names||'').trim();S.site={tagline:(o.tagline||'').trim(),story:(o.story||'').trim(),dress:(o.dress||'').trim(),rsvp:(o.rsvp||'').trim(),rsvpBy:o.rsvpBy||'',theme:o.theme||'sage',contrib:o.contrib!==undefined,ev:sev};toast('Saved');save();render(true);return}
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
  S.cur=(o.cur||'').trim().toUpperCase()||REGIONS[o.region].cur;S.cur2=(o.cur2||'').trim().toUpperCase()||'USD';S.rate=o.rate;S.inviteTpl=isDefaultTpl(o.inviteTpl)?DEFAULT_TPL:o.inviteTpl;
  S.ceremonies.forEach(function(c){c.on=o['cer_'+c.id]!==undefined});toast('Settings saved');
 }
 save();render(true);
});

document.addEventListener('change',function(e){
 var t=e.target;
 if(t.hasAttribute('data-wzf')&&W){var f=t.getAttribute('data-wzf');if(f==='region'){W.region=t.value;if(REGIONS[t.value])W.cur=REGIONS[t.value].cur;render(true)}else{W[f]=t.value}return}
 if(t.hasAttribute('data-pcat')){pcat=t.value;render(true);return}
 if(t.hasAttribute('data-parea')){parea=t.value;render(true);return}
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
loadPartners();
if('serviceWorker' in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('sw.js').catch(function(){})}
window.__bv={get:function(){return S},normPhone:normPhone,waLink:waLink,summaryText:summaryText};
})();
