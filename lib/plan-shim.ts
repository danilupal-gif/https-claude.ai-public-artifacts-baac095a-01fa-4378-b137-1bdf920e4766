import 'server-only'

/**
 * The plan pages were written for Claude artifacts and save through `window.claude.use('db')`
 * (a small Firestore-style API). This provides the same API backed by the portal's store endpoint,
 * so the pages run unchanged and their ticks, notes and hours are shared between Keon and Danielle.
 */
export function planShim(config: { slug: string; space: string }) {
  const cfg = JSON.stringify({
    url: `/api/portal/${encodeURIComponent(config.slug)}/store`,
    space: config.space,
  }).replace(/</g, '\\u003c')

  return `<script>
(function(){
  var CFG=${cfg};
  var state=null,last='',listeners=[],writes=0,ready=null;
  function docs(col){return ((state&&state[col])||[]).map(function(d){return {id:d.id,data:function(){return d.data}}})}
  function colSnap(col){return {docs:docs(col),metadata:{fromCache:false}}}
  function docSnap(col,id){var d=((state&&state[col])||[]).filter(function(x){return x.id===id})[0];return {exists:!!d,data:function(){return d?d.data:undefined},metadata:{fromCache:false}}}
  function notify(){listeners.forEach(function(l){try{l.cb(l.id?docSnap(l.col,l.id):colSnap(l.col))}catch(e){}})}
  function load(){
    return fetch(CFG.url+'?space='+CFG.space,{credentials:'same-origin',cache:'no-store'})
      .then(function(r){if(!r.ok)throw new Error('load failed');return r.json()})
      .then(function(j){if(writes)return;var s=JSON.stringify(j.collections||{});state=j.collections||{};if(s!==last){last=s;notify()}});
  }
  function put(col,id,data){
    writes++;state=state||{};
    var list=(state[col]=state[col]||[]),found=false;
    list.forEach(function(x){if(x.id===id){x.data=data;found=true}});
    if(!found)list.push({id:id,data:data});
    last=JSON.stringify(state);
    return fetch(CFG.url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({space:CFG.space,collection:col,id:id,data:data})})
      .then(function(r){writes--;if(!r.ok)throw new Error('save failed')},function(e){writes--;throw e});
  }
  function listen(col,id,cb,err){
    var l={col:col,id:id,cb:cb};listeners.push(l);
    ready.then(function(){cb(id?docSnap(col,id):colSnap(col))},function(e){if(err)err(e)});
    return function(){listeners=listeners.filter(function(x){return x!==l})};
  }
  var db={collection:function(col){return {
    onSnapshot:function(cb,err){return listen(col,null,cb,err)},
    doc:function(id){return {set:function(data){return put(col,id,data)},onSnapshot:function(cb,err){return listen(col,id,cb,err)}}}
  }}};
  window.claude={use:function(name){
    if(name!=='db')return Promise.resolve(null);
    if(!ready){ready=load();setInterval(function(){if(!document.hidden)load().catch(function(){})},15000);}
    return Promise.resolve(db);
  }};
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var href=a.getAttribute('href')||'';if(href.charAt(0)==='#')return;
    a.target=/^https?:/i.test(href)&&a.host!==location.host?'_blank':'_top';
    if(a.target==='_blank')a.rel='noopener noreferrer';
  },true);
})();
</script>`
}
