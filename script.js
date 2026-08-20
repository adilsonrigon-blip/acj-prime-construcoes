// ACJ Prime V3 - contraste e legibilidade

(() => {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const cfg=window.ACJ_CONFIG||{}, data=(window.ACJ_DATA||{}).properties||[];
  const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
  const digits=v=>String(v||'').replace(/\D/g,'');
  const maskPhone=v=>{const d=digits(v).slice(0,11);if(d.length<=2)return d?`(${d}`:'';if(d.length<=6)return`(${d.slice(0,2)}) ${d.slice(2)}`;if(d.length<=10)return`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;return`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`};

  const header=$('.site-header');
  const sync=()=>header?.classList.toggle('scrolled',scrollY>24); sync(); addEventListener('scroll',sync,{passive:true});
  $('.menu-toggle')?.addEventListener('click',()=>document.body.classList.toggle('menu-open'));
  $$('.site-nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu-open')));

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  const card=p=>`<article class="property-card reveal is-visible">
    <a class="property-media" href="empreendimento.html?id=${encodeURIComponent(p.id)}" style="background-image:url('${p.hero}')">
      <span class="property-badge">${p.status}</span>${p.status==='Em obras'?`<span class="property-progress">${p.progress}% da obra</span>`:''}
      <div class="property-caption"><small>${p.district} · ${p.city}</small><h3>${p.title}</h3></div>
    </a>
    <div class="property-body"><div class="property-specs"><span>${p.area} m²</span><span>${p.beds} dorm.</span><span>${p.suites} suíte${p.suites===1?'':'s'}</span><span>${p.parking} vaga${p.parking===1?'':'s'}</span></div>
    <div class="property-bottom"><strong>${money(p.price)}</strong><a class="text-link" href="empreendimento.html?id=${encodeURIComponent(p.id)}">Conhecer projeto →</a></div></div></article>`;

  const render=(filter='Todos')=>{
    const grid=$('#propertyGrid'); if(!grid)return;
    let rows=data;
    if(filter!=='Todos') rows=data.filter(p=>p.status===filter);
    const type=$('#filterType')?.value||'', district=$('#filterDistrict')?.value||'', status=$('#filterStatus')?.value||'';
    rows=rows.filter(p=>(!type||p.type===type)&&(!district||p.district===district)&&(!status||p.status===status));
    grid.innerHTML=rows.map(card).join('')||'<div style="grid-column:1/-1;padding:40px;border:1px solid #ded8cc">Nenhuma oportunidade encontrada.</div>';
    if($('#resultCount')) $('#resultCount').textContent=`${rows.length} oportunidade${rows.length===1?'':'s'}`;
  };
  $$('.segment-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.segment-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)}));
  ['filterType','filterDistrict','filterStatus'].forEach(id=>$('#'+id)?.addEventListener('change',()=>render('Todos')));
  render('Todos');

  $$('input[type="tel"]').forEach(i=>i.addEventListener('input',()=>i.value=maskPhone(i.value)));
  $$('form[data-lead-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault(); if(!form.reportValidity())return;
    const fd=new FormData(form), msg=[`Olá, ACJ Prime! Tenho interesse em ${form.dataset.leadForm}.`,...[...fd.entries()].map(([k,v])=>`${k}: ${v}`)].join('\n'), wa=digits(cfg.whatsapp);
    if(wa) open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');
    else $('.form-feedback',form).textContent='Estrutura pronta. Configure o WhatsApp real em config.js.';
  }));

  const id=new URLSearchParams(location.search).get('id');
  if(id&&$('#detailTitle')){
    const p=data.find(x=>x.id===id)||data[0];
    $('#detailHero').style.backgroundImage=`url('${p.hero}')`;
    $('#detailTitle').textContent=p.title; $('#detailStatus').textContent=p.status; $('#detailLocation').textContent=`${p.district} · ${p.city}`;
    $('#detailPrice').textContent=money(p.price); $('#detailDescription').textContent=p.description; $('#detailDelivery').textContent=p.delivery;
    $('#detailSpecs').innerHTML=`<span>${p.area} m²</span><span>${p.beds} dormitórios</span><span>${p.suites} suítes</span><span>${p.parking} vagas</span>`;
    $('#detailProgressLabel').textContent=`${p.progress}%`; $('#detailProgress').style.width=`${p.progress}%`;
    $('#detailGallery').innerHTML=p.gallery.map(src=>`<img src="${src}" alt="${p.title}">`).join('');
  }
})();
