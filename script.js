(()=> {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const cfg=window.ACJ_CONFIG||{};
  let data=(window.ACJ_DATA||{}).properties||[];
  const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(n||0));
  const digits=v=>String(v||'').replace(/\D/g,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  $('.menu-toggle')?.addEventListener('click',e=>{
    const nav=$('.main-nav');
    const open=nav?.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded',open?'true':'false');
  });

  async function dbFetch(path,options={}){
    if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY) throw new Error('Supabase não configurado');
    return fetch(`${cfg.SUPABASE_URL}/rest/v1/${path}`,{
      ...options,
      headers:{
        apikey:cfg.SUPABASE_ANON_KEY,
        Authorization:`Bearer ${cfg.SUPABASE_ANON_KEY}`,
        'Content-Type':'application/json',
        ...(options.headers||{})
      }
    });
  }

  async function loadProperties(){
    if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY) return data;
    try{
      const r=await dbFetch('acj_empreendimentos?select=*,acj_empreendimento_imagens(url,ordem)&ativo=eq.true&order=ordem.asc');
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const rows=await r.json();
      if(rows?.length){
        data=rows.map(p=>{
          const imgs=(p.acj_empreendimento_imagens||[]).sort((a,b)=>(a.ordem||0)-(b.ordem||0)).map(i=>i.url);
          return {
            id:p.slug,status:p.status,title:p.nome,district:p.bairro,city:p.cidade,type:p.tipo,
            area:p.area_m2,beds:p.dormitorios,suites:p.suites,parking:p.vagas,price:p.preco,
            delivery:p.entrega,progress:p.progresso,hero:p.imagem_capa_url||imgs[0],
            gallery:imgs.length?imgs:[p.imagem_capa_url].filter(Boolean),description:p.descricao
          };
        });
      }
    }catch(err){console.warn('ACJ Prime: usando dados locais de fallback.',err)}
    return data;
  }

  function projectCard(p){
    return `<a class="property-card" href="empreendimento.html?id=${encodeURIComponent(p.id)}">
      <div class="property-image" style="background-image:url('${esc(p.hero)}')"></div>
      <div class="property-body">
        <small>${esc(p.status)} · ${esc(p.district)}</small>
        <h3>${esc(p.title)}</h3>
        <div class="property-meta"><span>${esc(p.area)} m²</span><span>${esc(p.beds)} dorm.</span><span>${money(p.price)}</span></div>
      </div>
    </a>`;
  }

  function renderFeatured(){
    const box=$('#featuredProjects'); if(!box)return;
    box.innerHTML=data.slice(0,2).map(p=>`<a class="feature-card" href="empreendimento.html?id=${encodeURIComponent(p.id)}" style="background-image:url('${esc(p.hero)}')">
      <div class="feature-info"><small>${esc(p.status)} · ${esc(p.district)}</small><h3>${esc(p.title)}</h3>
      <div class="feature-meta"><span>${esc(p.area)} m²</span><span>${esc(p.beds)} dorm.</span><span>${money(p.price)}</span></div></div></a>`).join('');
  }

  function renderCards(){
    const cards=$('#cards'); if(!cards)return;
    const st=$('#status')?.value||'',ty=$('#type')?.value||'';
    cards.innerHTML=data.filter(p=>(!st||p.status===st)&&(!ty||p.type===ty)).map(projectCard).join('');
  }

  function renderDetail(){
    const id=new URLSearchParams(location.search).get('id');
    if(!id||!$('#detailTitle'))return;
    const p=data.find(x=>x.id===id)||data[0]; if(!p)return;
    $('#detail').style.backgroundImage=`url('${p.hero}')`;
    $('#detailTitle').textContent=p.title;
    $('#detailLoc').textContent=`${p.district} · ${p.city}`;
    $('#detailDesc').textContent=p.description||'';
    $('#detailMeta').innerHTML=[
      `${p.area} m²`,`${p.beds} dormitórios`,`${p.suites||0} suítes`,`${p.parking||0} vagas`,money(p.price)
    ].map(v=>`<span>${esc(v)}</span>`).join('');
    $('#gallery').innerHTML=(p.gallery||[]).map(src=>`<img src="${esc(src)}" alt="${esc(p.title)}" loading="lazy">`).join('');
  }

  async function uploadPartnerFile(file){
    if(!file||!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return null;
    const clean=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
    const path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}-${clean}`;
    const r=await fetch(`${cfg.SUPABASE_URL}/storage/v1/object/acj-parceiros/${path}`,{
      method:'POST',
      headers:{apikey:cfg.SUPABASE_ANON_KEY,Authorization:`Bearer ${cfg.SUPABASE_ANON_KEY}`,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},
      body:file
    });
    if(!r.ok) throw new Error('Não foi possível enviar o arquivo.');
    return path;
  }

  $('#partnerForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget,feedback=$('#partnerFeedback');
    if(!form.reportValidity())return;
    const btn=form.querySelector('button[type=submit]');
    btn.disabled=true;feedback.textContent='Enviando cadastro...';
    try{
      if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY) throw new Error('Supabase ainda não configurado em config.js.');
      const fd=new FormData(form);
      const file=fd.get('arquivo');
      const arquivo_path=file&&file.size?await uploadPartnerFile(file):null;
      const payload={
        nome:fd.get('nome'),empresa:fd.get('empresa')||null,telefone:fd.get('telefone'),email:fd.get('email'),
        tipo_parceria:fd.get('tipo_parceria'),cidade:fd.get('cidade')||null,estado:(fd.get('estado')||'').toUpperCase()||null,
        mensagem:fd.get('mensagem')||null,arquivo_path,status:'novo',consentimento_lgpd:true
      };
      const r=await dbFetch('acj_parceiros',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});
      if(!r.ok) throw new Error(`Não foi possível salvar o cadastro (${r.status}).`);
      form.reset();feedback.textContent='Cadastro enviado com sucesso. Obrigado pelo interesse em construir novas oportunidades com a ACJ Prime.';
    }catch(err){feedback.textContent=err.message||'Não foi possível enviar. Tente novamente.'}
    finally{btn.disabled=false}
  });

  $$('form[data-lead-form]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const fd=new FormData(form),feedback=$('.feedback',form);
    const payload={nome:fd.get('nome'),telefone:fd.get('telefone'),email:fd.get('email')||null,assunto:fd.get('assunto')||form.dataset.leadForm,mensagem:fd.get('mensagem')||null,origem:location.pathname};
    try{
      if(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY){
        const r=await dbFetch('acj_leads',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});
        if(!r.ok)throw new Error();
        form.reset();feedback.textContent='Recebemos seu contato. Nossa equipe retornará em breve.';return;
      }
    }catch{}
    const wa=digits(cfg.whatsapp);
    if(wa){open(`https://wa.me/${wa}?text=${encodeURIComponent(`Olá, ACJ Prime! Meu nome é ${payload.nome||''}. Tenho interesse em ${payload.assunto}.`)}`,'_blank')}
    else feedback.textContent='Preencha o Supabase ou WhatsApp em config.js para ativar o envio.';
  }));

  (async()=>{
    await loadProperties();
    renderFeatured();renderCards();renderDetail();
    ['status','type'].forEach(id=>$('#'+id)?.addEventListener('change',renderCards));
  })();
})();
