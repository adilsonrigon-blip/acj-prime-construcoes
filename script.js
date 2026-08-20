
(() => {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
  const cfg = window.ACJ_CONFIG || {};
  const money = n => new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0}).format(n);
  const digits = v => String(v||'').replace(/\D/g,'');
  const maskPhone = v => {
    const d = digits(v).slice(0,11);
    if (d.length <= 2) return d ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };

  const header = $('.site-header');
  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  syncHeader();
  window.addEventListener('scroll', syncHeader, {passive:true});

  $('.menu-toggle')?.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $$('.site-nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.14});
  $$('.reveal').forEach(el => io.observe(el));

  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = Number(el.dataset.counter || 0);
      const suffix = el.dataset.suffix || '';
      const start = performance.now(), duration = 1100;
      const tick = now => {
        const p = Math.min(1, (now-start)/duration);
        el.textContent = `${Math.round(target*(1-Math.pow(1-p,3)))}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, {threshold:.7});
  $$('[data-counter]').forEach(el => cio.observe(el));

  const properties = [
    {status:'Pronto', title:'ACJ Prime Residence', city:'São Paulo', district:'Vila Prudente', type:'Apartamento', area:84, beds:3, suites:1, parking:2, price:920000, image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84'},
    {status:'Pronto', title:'Prime Urban House', city:'São Paulo', district:'Ipiranga', type:'Sobrado', area:132, beds:3, suites:1, parking:2, price:1180000, image:'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=84'},
    {status:'Em obras', title:'ACJ Skyline', city:'São Paulo', district:'Mooca', type:'Apartamento', area:96, beds:3, suites:1, parking:2, price:1040000, image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=84'},
    {status:'Em obras', title:'Prime Studios', city:'São Paulo', district:'Tatuapé', type:'Studio', area:38, beds:1, suites:0, parking:0, price:430000, image:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=84'},
    {status:'Lançamento', title:'Reserva Prime', city:'São Paulo', district:'Anália Franco', type:'Apartamento', area:148, beds:4, suites:2, parking:3, price:1780000, image:'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=84'},
    {status:'Lançamento', title:'ACJ Garden', city:'São Paulo', district:'Vila Mariana', type:'Apartamento', area:112, beds:3, suites:2, parking:2, price:1490000, image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84'}
  ];

  const card = p => `
    <article class="property-card reveal is-visible">
      <a class="property-media" href="empreendimento.html?nome=${encodeURIComponent(p.title)}" style="background-image:url('${p.image}')">
        <span class="property-status">${p.status}</span>
        <span class="property-arrow">↗</span>
      </a>
      <div class="property-body">
        <span class="eyebrow">${p.district} · ${p.city}</span>
        <h3>${p.title}</h3>
        <div class="property-specs">
          <span>${p.area} m²</span><span>${p.beds} dorm.</span><span>${p.parking} vaga${p.parking===1?'':'s'}</span>
        </div>
        <div class="property-bottom"><strong>A partir de ${money(p.price)}</strong><a href="empreendimento.html?nome=${encodeURIComponent(p.title)}">Conhecer</a></div>
      </div>
    </article>`;

  const grid = $('#propertyGrid');
  const renderProps = () => {
    if (!grid) return;
    const st = $('#filterStatus')?.value || '';
    const ty = $('#filterType')?.value || '';
    const di = $('#filterDistrict')?.value || '';
    const rows = properties.filter(p => (!st||p.status===st)&&(!ty||p.type===ty)&&(!di||p.district===di));
    grid.innerHTML = rows.map(card).join('') || '<div class="empty-result">Nenhum imóvel encontrado para os filtros selecionados.</div>';
    if ($('#resultCount')) $('#resultCount').textContent = `${rows.length} oportunidade${rows.length===1?'':'s'}`;
  };
  ['filterStatus','filterType','filterDistrict'].forEach(id => $('#'+id)?.addEventListener('change', renderProps));
  renderProps();

  $$('input[type="tel"]').forEach(i => i.addEventListener('input', () => i.value = maskPhone(i.value)));

  $$('form[data-lead-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const kind = form.dataset.leadForm;
      const msg = [
        `Olá, ACJ Prime! Tenho interesse em: ${kind}.`,
        ...[...fd.entries()].filter(([,v]) => String(v).trim()).map(([k,v]) => `${k}: ${v}`)
      ].join('\n');
      const wa = digits(cfg.whatsapp);
      if (wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');
      else {
        const box = $('.form-feedback', form);
        if (box) box.textContent = 'Estrutura pronta. Configure o WhatsApp real em config.js para envio dos contatos.';
      }
    });
  });

  const detailName = new URLSearchParams(location.search).get('nome');
  if (detailName && $('#detailTitle')) {
    const p = properties.find(x => x.title === detailName) || properties[0];
    $('#detailTitle').textContent = p.title;
    $('#detailLocation').textContent = `${p.district} · ${p.city}`;
    $('#detailHero').style.backgroundImage = `linear-gradient(90deg,rgba(8,8,8,.72),rgba(8,8,8,.15)),url('${p.image}')`;
    $('#detailStatus').textContent = p.status;
    $('#detailPrice').textContent = `A partir de ${money(p.price)}`;
    $('#detailSpecs').innerHTML = `<span>${p.area} m²</span><span>${p.beds} dormitórios</span><span>${p.suites} suítes</span><span>${p.parking} vagas</span>`;
  }
})();
