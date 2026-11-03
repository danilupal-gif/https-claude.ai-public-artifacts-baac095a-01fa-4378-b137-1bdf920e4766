import 'server-only'

/**
 * The plan pages were written for Claude artifacts and save through `window.claude.use('db')`
 * (a small Firestore-style API). This provides the same API backed by the portal's store endpoint,
 * so the pages run unchanged and their ticks, notes and hours are shared between client and consultant.
 * It also labels ticked items with who ticked them and when, and tells the portal page when something saved.
 */
export function planShim(config: {
  slug: string
  space: string
  viewerName: string
  replied?: string[]
  contact?: string
  consultant?: string
  baseline?: { label: string; w1: string; end: string }[]
}) {
  const cfg = JSON.stringify({
    url: `/api/portal/${encodeURIComponent(config.slug)}/store`,
    space: config.space,
    me: config.viewerName,
    replied: config.replied ?? [],
    contact: config.contact ?? '',
    consultant: config.consultant ?? 'Your consultant',
    baseline: config.baseline ?? [],
  }).replace(/</g, '\\u003c')

  return `<style>
.v0-upd{display:inline-block;margin-left:8px;font-family:var(--mono);font-size:.7rem;letter-spacing:.04em;color:var(--muted);white-space:nowrap}
.v0-chart{margin-top:22px;border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:18px 20px;display:grid;gap:16px}
.v0-chart-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.v0-chart-head h3{margin:0;font-size:1.25rem}
.v0-chart-key{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.v0-chart-key i{display:inline-block;width:12px;height:8px;border-radius:2px;margin-left:6px}
.v0-chart-key .k-w1,.v0-bar .b-w1{background:var(--muted)}
.v0-chart-key .k-end,.v0-bar .b-end{background:var(--gold)}
.v0-metric{display:grid;gap:6px}
.v0-metric-head{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.92rem}
.v0-change{font-family:var(--mono);font-size:.78rem;color:var(--leaf)}
.v0-bar-row{display:grid;grid-template-columns:1fr minmax(90px,30%);align-items:center;gap:10px}
.v0-bar{height:10px;border-radius:999px;background:var(--paper);overflow:hidden}
.v0-bar span{display:block;height:100%;border-radius:999px;transition:width .5s ease}
.v0-bar-val{font-size:.82rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (prefers-reduced-motion:reduce){.v0-bar span{transition:none}}
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
      drawChart();
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
  function num(v){var m=String(v||'').replace(/,(?=\\d{3}\\b)/g,'').match(/-?\\d+(?:\\.\\d+)?/);return m?parseFloat(m[0]):null}
  function chartRows(){
    var table=document.getElementById('baseTable');
    if(!table)return CFG.baseline;
    return [].slice.call(table.querySelectorAll('tbody tr')).map(function(tr){
      var w=tr.querySelector('[data-p="w1"]'),en=tr.querySelector('[data-p="end"]');
      return {label:tr.cells[0].textContent,w1:w?w.value:'',end:en?en.value:''};
    });
  }
  function drawChart(){
    var host=document.getElementById('v0-chart');
    if(!host){
      var sec=document.getElementById('measure');if(!sec||!(document.getElementById('baseTable')||CFG.baseline.length))return;
      host=document.createElement('div');host.id='v0-chart';host.className='v0-chart';
      var anchor=document.getElementById('baseNote')||sec.querySelector('.tbl');if(!anchor)return;
      anchor.parentNode.insertBefore(host,anchor.nextSibling);
    }
    var rows=chartRows().filter(function(r){return num(r.w1)!==null||num(r.end)!==null});
    var html='<div class="v0-chart-head"><h3>At a glance</h3><span class="v0-chart-key"><i class="k-w1"></i>Week 1<i class="k-end"></i>Dec 18</span></div>';
    if(!rows.length)html+='<p class="muted">The chart fills in as numbers are added to the table.</p>';
    else html+=rows.map(function(r){
      var a=num(r.w1),b=num(r.end),max=Math.max(Math.abs(a||0),Math.abs(b||0))||1;
      function bar(v,cls,txt){return '<div class="v0-bar-row"><div class="v0-bar"><span class="'+cls+'" style="width:'+(v===null?0:Math.max(2,Math.round(Math.abs(v)/max*100)))+'%"></span></div><span class="v0-bar-val">'+(txt?esc(txt):'\\u2014')+'</span></div>'}
      var change='';
      if(a!==null&&b!==null&&a!==b){var d=b-a,pct=a?Math.round(d/Math.abs(a)*100):null;change=(d>0?'+':'\\u2212')+Math.abs(Math.round(d*10)/10)+(pct!==null?' ('+(pct>0?'+':'\\u2212')+Math.abs(pct)+'%)':'')}
      else if(a!==null&&b===null)change='Dec 18 number still to come';
      return '<div class="v0-metric"><div class="v0-metric-head"><span>'+esc(r.label)+'</span><span class="v0-change">'+change+'</span></div>'+bar(a,'b-w1',r.w1)+bar(b,'b-end',r.end)+'</div>';
    }).join('');
    if(host.getAttribute('data-sig')===html)return;
    host.setAttribute('data-sig',html);host.innerHTML=html;
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  document.addEventListener('input',function(e){if(e.target.closest&&e.target.closest('#baseTable'))drawChart()});
  var FILES=CFG.url.replace(/\\/store$/,'/files');
  function fileRow(f){
    var li=document.createElement('li');
    var a=document.createElement('a');a.href=f.href;a.setAttribute('data-file','');a.textContent=f.name;li.appendChild(a);
    var s=document.createElement('span');s.className='v0-meta';s.textContent=f.size;li.appendChild(s);
    var b=document.createElement('button');b.type='button';b.className='v0-file-del';b.setAttribute('data-del-file',f.id);b.textContent='Remove';b.setAttribute('aria-label','Remove '+f.name);li.appendChild(b);
    return li;
  }
  document.addEventListener('change',function(e){
    var input=e.target;if(!input.matches||!input.matches('input[data-upload]'))return;
    var id=input.getAttribute('data-upload'),card=input.closest('[data-req]'),list=card.querySelector('.v0-files'),st=card.querySelector('.v0-file-status');
    var files=[].slice.call(input.files||[]);input.value='';if(!files.length)return;
    st.className='v0-file-status';st.textContent='Uploading\\u2026';
    files.reduce(function(chain,file){return chain.then(function(){
      var fd=new FormData();fd.append('itemId',id);fd.append('file',file);
      return fetch(FILES,{method:'POST',body:fd,credentials:'same-origin'}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Upload failed');return j})}).then(function(f){list.appendChild(fileRow(f));list.hidden=false});
    })},Promise.resolve()).then(function(){st.className='v0-file-status ok';st.textContent=files.length>1?'Files attached. '+CFG.consultant+' has them.':'Attached. '+CFG.consultant+' has it.'},
      function(err){st.className='v0-file-status err';st.textContent=err.message||'Upload failed. Try again.'});
  });
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
    var delBtn=e.target.closest&&e.target.closest('[data-del-file]');
    if(delBtn){
      var li=delBtn.closest('li'),name=li.querySelector('a').textContent;
      if(!confirm('Remove '+name+'?'))return;
      delBtn.disabled=true;
      fetch(FILES+'?id='+encodeURIComponent(delBtn.getAttribute('data-del-file')),{method:'DELETE',credentials:'same-origin'}).then(function(r){
        if(!r.ok)throw new Error();var ul=li.parentNode;li.remove();if(!ul.children.length)ul.hidden=true;
      }).catch(function(){delBtn.disabled=false;alert('Couldn\\u2019t remove that file. Try again.')});
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
    if(a.hasAttribute('data-file')){a.target='_blank';a.rel='noopener';return}
    a.target=/^https?:/i.test(href)&&a.host!==location.host?'_blank':'_top';
    if(a.target==='_blank')a.rel='noopener noreferrer';
  },true);
})();
</script>`
}
