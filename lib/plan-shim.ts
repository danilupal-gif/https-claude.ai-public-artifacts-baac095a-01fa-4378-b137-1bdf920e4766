import 'server-only'

/**
 * The plan pages were written for Claude artifacts and save through `window.claude.use('db')`
 * (a small Firestore-style API). This provides the same API backed by the portal's store endpoint,
 * so the pages run unchanged and their ticks, notes and hours are shared between client and consultant.
 * It also labels ticked items with who ticked them and when, and tells the portal page when something saved.
 */
export function planShim(config: { slug: string; space: string; viewerName: string; replied?: string[]; contact?: string }) {
  const cfg = JSON.stringify({
    url: `/api/portal/${encodeURIComponent(config.slug)}/store`,
    space: config.space,
    me: config.viewerName,
    replied: config.replied ?? [],
    contact: config.contact ?? '',
  }).replace(/</g, '\\u003c')

  return `<style>
.v0-upd{display:inline-block;margin-left:8px;font-family:var(--mono);font-size:.7rem;letter-spacing:.04em;color:var(--muted);white-space:nowrap}
@media print{.v0-upd{color:#555}}
</style><script>
(function(){
  var CFG=${cfg};
  var state=null,last='',listeners=[],writes=0,ready=null;
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function docs(col){return ((state&&state[col])||[]).map(function(d){return {id:d.id,data:function(){return d.data}}})}
  function colSnap(col){return {docs:docs(col),metadata:{fromCache:false}}}
  function find(col,id){return ((state&&state[col])||[]).filter(function(x){return x.id===id})[0]}
  function docSnap(col,id){var d=find(col,id);return {exists:!!d,data:function(){return d?d.data:undefined},metadata:{fromCache:false}}}
  function notify(){listeners.forEach(function(l){try{l.cb(l.id?docSnap(l.col,l.id):colSnap(l.col))}catch(e){}});annotate()}
  function load(){
    return fetch(CFG.url+'?space='+CFG.space,{credentials:'same-origin',cache:'no-store'})
      .then(function(r){if(!r.ok)throw new Error('load failed');return r.json()})
      .then(function(j){if(writes)return;var s=JSON.stringify(j.collections||{});state=j.collections||{};if(s!==last){last=s;notify()}});
  }
  function put(col,id,data){
    writes++;state=state||{};
    var list=(state[col]=state[col]||[]),entry=find(col,id),meta={by:CFG.me,at:new Date().toISOString()};
    if(entry){entry.data=data;entry.by=meta.by;entry.at=meta.at}else list.push({id:id,data:data,by:meta.by,at:meta.at});
    last=JSON.stringify(state);
    return fetch(CFG.url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({space:CFG.space,collection:col,id:id,data:data})})
      .then(function(r){writes--;if(!r.ok)throw new Error('save failed');annotate();try{parent!==window&&parent.postMessage({type:'plan:saved'},location.origin)}catch(e){}},function(e){writes--;throw e});
  }
  function listen(col,id,cb,err){
    var l={col:col,id:id,cb:cb};listeners.push(l);
    ready.then(function(){cb(id?docSnap(col,id):colSnap(col))},function(e){if(err)err(e)});
    return function(){listeners=listeners.filter(function(x){return x!==l})};
  }
  function stamp(e){var d=new Date(e.at),day;try{day=d.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'America/New_York'})}catch(x){day=MON[d.getMonth()]+' '+d.getDate()}return (e.by||'')+' \\u00b7 '+day}
  var pending=false;
  function annotate(){
    if(pending)return;pending=true;
    requestAnimationFrame(function(){
      pending=false;if(!state)return;
      ((state.progress)||[]).forEach(function(e){
        var box=document.getElementById('task-'+e.id);if(!box)return;
        var label=document.querySelector('label[for="task-'+e.id+'"]');if(!label)return;
        var tag=label.querySelector('.v0-upd'),want=e.data&&e.data.done&&box.checked?stamp(e):'';
        if(!want){if(tag)tag.remove();return}
        if(!tag){tag=document.createElement('span');tag.className='v0-upd';label.appendChild(tag)}
        if(tag.textContent!==want)tag.textContent=want;
      });
      CFG.replied.forEach(function(id){
        var label=document.querySelector('label[for="task-'+id+'"]');if(!label||label.querySelector('.v0-replied'))return;
        var tag=document.createElement('span');tag.className='v0-upd v0-replied';tag.textContent=CFG.contact+' replied';label.appendChild(tag);
      });
      ((state.responses)||[]).forEach(function(e){
        var box=document.getElementById('req-'+e.id),card=box&&box.closest('[data-req]');if(!card||dirty[e.id])return;
        var text=(e.data&&e.data.text)||'';if(box.value!==text)box.value=text;
        var st=card.querySelector('.v0-req-status');if(text&&st&&!st.dataset.busy){st.className='v0-req-status ok';st.textContent='Sent '+stamp(e).replace(/^[^\\u00b7]*\\u00b7 /,'')}
      });
      var conf=find('discovery','confirm'),cs=document.getElementById('confStatus');
      if(conf&&cs&&conf.data&&conf.data.status&&cs.textContent.indexOf(' by ')<0)cs.textContent+=' by '+conf.by;
    });
  }
  new MutationObserver(annotate).observe(document.documentElement,{childList:true,subtree:true});
  var db={collection:function(col){return {
    onSnapshot:function(cb,err){return listen(col,null,cb,err)},
    doc:function(id){return {set:function(data){return put(col,id,data)},onSnapshot:function(cb,err){return listen(col,id,cb,err)}}}
  }}};
  window.claude={use:function(name){
    if(name!=='db')return Promise.resolve(null);
    if(!ready){ready=load();setInterval(function(){if(!document.hidden)load().catch(function(){})},15000);}
    return Promise.resolve(db);
  }};
  var dirty={};
  document.addEventListener('input',function(e){
    var t=e.target;if(!t.id||t.id.indexOf('req-')!==0)return;
    var id=t.id.slice(4);dirty[id]=true;
    var st=t.closest('[data-req]').querySelector('.v0-req-status');st.className='v0-req-status';st.textContent='Not sent yet';
  });
  function ensureDb(){return window.claude.use('db')}
  document.addEventListener('click',function(e){
    var send=e.target.closest&&e.target.closest('[data-send]');
    if(send){
      var id=send.getAttribute('data-send'),box=document.getElementById('req-'+id),st=send.parentNode.querySelector('.v0-req-status'),text=box.value.trim();
      if(!text){st.className='v0-req-status err';st.textContent='Write something first.';box.focus();return}
      send.disabled=true;st.dataset.busy='1';st.className='v0-req-status';st.textContent='Sending\\u2026';
      ensureDb().then(function(){return ready}).then(function(){return put('responses',id,{text:text,at:new Date().toISOString()})}).then(function(){
        dirty[id]=false;delete st.dataset.busy;st.className='v0-req-status ok';st.textContent='Sent. '+send.textContent.replace(/^Send to /,'')+' has it.';
      },function(){delete st.dataset.busy;st.className='v0-req-status err';st.textContent='Couldn\\u2019t send. Check your connection and try again.'}).then(function(){send.disabled=false});
      return;
    }
    var rev=e.target.closest&&e.target.closest('[data-review]');
    if(rev){
      var rid=rev.getAttribute('data-review'),card=rev.closest('[data-reply]'),rst=rev.parentNode.querySelector('.v0-req-status');
      rev.disabled=true;
      ensureDb().then(function(){return ready}).then(function(){return put('inbox',rid,{reviewedAt:new Date().toISOString()})}).then(function(){
        card.classList.add('is-reviewed');var pill=card.querySelector('[data-reply-pill]');if(pill){pill.textContent='Reviewed';pill.classList.remove('new')}rev.parentNode.remove();
        var left=document.querySelectorAll('[data-reply] [data-review]').length,eb=document.querySelector('#from-client .eyebrow');if(eb)eb.textContent='Inbox \\u00b7 '+(left?left+' to review':'all reviewed');
      },function(){rev.disabled=false;rst.className='v0-req-status err';rst.textContent='Couldn\\u2019t save. Try again.'});
      return;
    }
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var href=a.getAttribute('href')||'';if(href.charAt(0)==='#')return;
    a.target=/^https?:/i.test(href)&&a.host!==location.host?'_blank':'_top';
    if(a.target==='_blank')a.rel='noopener noreferrer';
  },true);
})();
</script>`
}
