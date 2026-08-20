
(()=> {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const data=(window.ACJ_DATA||{}).properties||[], cfg=window.ACJ_CONFIG||{};
  const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
  const digits=v=>String(v||'').replace(/\D/g,'');

  const header=$('.header');
  const sync=()=>header?.classList.toggle('scrolled',scrollY>24);
  sync(); addEventListener('scroll',sync,{passive:true});
  $('.menu')?.addEventListener('click',()=>document.body.classList.toggle('menu-open'));

  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}
  }),{threshold:.12});
  $$('.reveal').forEach(x=>io.observe(x));

  const list=$('#projectList');
  if(list){
    list.innerHTML=data.map((p,i)=>`
      <a class="project-row" href="empreendimento.html?id=${encodeURIComponent(p.id)}">
        <div class="project-index">${String(i+1).padStart(2,'0')}</div>
        <div class="project-main">
          <h3>${p.title}</h3>
          <small>📍 ${p.district}</small>
        </div>
        <div class="project-facts">
          <span class="fact"><b>□</b>${p.area} m²</span>
          <span class="fact"><b>▱</b>${p.beds} dorm.</span>
        </div>
        <div class="project-status">
          <strong>${p.status==='Pronto'?'Pronto para morar':p.status}</strong>
          <span>${p.type}</span>
        </div>
        <div class="project-thumb" style="background-image:url('${p.gallery?.[1]||p.hero}')"></div>
        <div class="project-open">→</div>
      </a>
    `).join('');
  }

  const cards=$('#cards');
  function renderCards(){
    if(!cards)return;
    const st=$('#status')?.value||'', ty=$('#type')?.value||'';
    const rows=data.filter(p=>(!st||p.status===st)&&(!ty||p.type===ty));
    cards.innerHTML=rows.map(p=>`
      <a class="card" href="empreendimento.html?id=${encodeURIComponent(p.id)}" style="background-image:url('${p.hero}')">
        <div class="card-info">
          <small>${p.status} · ${p.district}</small>
          <h3>${p.title}</h3>
          <div class="card-meta"><span>${p.area} m²</span><span>${p.beds} dorm.</span><span>${money(p.price)}</span></div>
        </div>
      </a>
    `).join('');
  }
  renderCards();
  ['status','type'].forEach(id=>$('#'+id)?.addEventListener('change',renderCards));

  const id=new URLSearchParams(location.search).get('id');
  if(id && $('#detailTitle')){
    const p=data.find(x=>x.id===id)||data[0];
    $('#detail').style.backgroundImage=`url('${p.hero}')`;
    $('#detailTitle').textContent=p.title;
    $('#detailLoc').textContent=`${p.district} · ${p.city}`;
    $('#detailMeta').innerHTML=`<span>${p.area} m²</span><span>${p.beds} dormitórios</span><span>${p.suites} suítes</span><span>${p.parking} vagas</span><span>${money(p.price)}</span>`;
    $('#detailDesc').textContent=p.description;
    $('#gallery').innerHTML=(p.gallery||[]).map(src=>`<img src="${src}" alt="${p.title}">`).join('');
  }

  $$('form[data-lead-form]').forEach(f=>f.addEventListener('submit',e=>{
    e.preventDefault();
    if(!f.reportValidity()) return;
    const fd=new FormData(f);
    const msg=[`Olá, ACJ Prime! Tenho interesse em ${f.dataset.leadForm}.`,...[...fd.entries()].map(([k,v])=>`${k}: ${v}`)].join('\n');
    const wa=digits(cfg.whatsapp);
    if(wa) open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');
    else $('.feedback',f).textContent='Formulário pronto. O WhatsApp será conectado em config.js.';
  }));
})();
