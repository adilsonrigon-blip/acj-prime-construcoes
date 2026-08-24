-- ACJ PRIME CONSTRUÇÕES — V6
-- Banco de dados, parceiros, imóveis, imagens e storage.
-- Execute no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.acj_empreendimentos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  status text not null default 'Em obras',
  tipo text,
  bairro text,
  cidade text default 'São Paulo',
  area_m2 numeric,
  dormitorios integer,
  suites integer,
  vagas integer,
  preco numeric,
  entrega text,
  progresso integer default 0 check (progresso between 0 and 100),
  descricao text,
  imagem_capa_url text,
  destaque boolean not null default false,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acj_empreendimento_imagens (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.acj_empreendimentos(id) on delete cascade,
  url text not null,
  alt_text text,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.acj_parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text,
  telefone text not null,
  email text not null,
  tipo_parceria text not null,
  cidade text,
  estado text,
  mensagem text,
  arquivo_path text,
  status text not null default 'novo',
  consentimento_lgpd boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.acj_leads (
  id uuid primary key default gen_random_uuid(),
  nome text,
  telefone text,
  email text,
  assunto text,
  mensagem text,
  origem text,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);

alter table public.acj_empreendimentos enable row level security;
alter table public.acj_empreendimento_imagens enable row level security;
alter table public.acj_parceiros enable row level security;
alter table public.acj_leads enable row level security;

drop policy if exists "acj empreendimentos leitura publica" on public.acj_empreendimentos;
create policy "acj empreendimentos leitura publica" on public.acj_empreendimentos for select to anon, authenticated using (ativo = true);

drop policy if exists "acj imagens leitura publica" on public.acj_empreendimento_imagens;
create policy "acj imagens leitura publica" on public.acj_empreendimento_imagens for select to anon, authenticated using (true);

drop policy if exists "acj parceiros cadastro publico" on public.acj_parceiros;
create policy "acj parceiros cadastro publico" on public.acj_parceiros for insert to anon, authenticated with check (consentimento_lgpd = true);

drop policy if exists "acj leads cadastro publico" on public.acj_leads;
create policy "acj leads cadastro publico" on public.acj_leads for insert to anon, authenticated with check (true);

-- Storage para anexos enviados por interessados em parceria.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('acj-parceiros','acj-parceiros',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "acj parceiros upload publico" on storage.objects;
create policy "acj parceiros upload publico" on storage.objects for insert to anon, authenticated
with check (bucket_id='acj-parceiros');

-- Dados demonstrativos com imagens do Unsplash.
insert into public.acj_empreendimentos
(slug,nome,status,tipo,bairro,cidade,area_m2,dormitorios,suites,vagas,preco,entrega,progresso,descricao,imagem_capa_url,destaque,ordem)
values
('prime-residence','ACJ Prime Residence','Pronto','Apartamento','Vila Prudente','São Paulo',84,3,1,2,920000,'Pronto para morar',100,'Um projeto contemporâneo pensado para quem busca praticidade, conforto e valorização em uma localização estratégica.','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88',true,1),
('urban-house','Prime Urban House','Pronto','Sobrado','Ipiranga','São Paulo',132,3,1,2,1180000,'Pronto para morar',100,'Arquitetura urbana, ambientes bem resolvidos e uma proposta de moradia que privilegia funcionalidade e privacidade.','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=88',true,2),
('acj-skyline','ACJ Skyline','Em obras','Apartamento','Mooca','São Paulo',96,3,1,2,1040000,'Previsão: 2º semestre de 2027',62,'Um empreendimento em desenvolvimento com foco em localização, mobilidade e plantas inteligentes.','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=88',false,3),
('prime-studios','Prime Studios','Em obras','Studio','Tatuapé','São Paulo',38,1,0,0,430000,'Previsão: 1º semestre de 2027',41,'Compacto, contemporâneo e conectado à cidade. Uma solução inteligente para moradia e investimento.','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=88',false,4)
on conflict (slug) do update set nome=excluded.nome, imagem_capa_url=excluded.imagem_capa_url, updated_at=now();

-- Galeria demonstrativa.
insert into public.acj_empreendimento_imagens (empreendimento_id,url,alt_text,ordem)
select e.id,x.url,e.nome,x.ordem
from public.acj_empreendimentos e
join (values
 ('prime-residence','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=86',1),
 ('prime-residence','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86',2),
 ('prime-residence','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=86',3),
 ('urban-house','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=86',1),
 ('urban-house','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=86',2),
 ('acj-skyline','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=86',1),
 ('acj-skyline','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=86',2),
 ('prime-studios','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=86',1)
) as x(slug,url,ordem) on x.slug=e.slug
where not exists (
  select 1 from public.acj_empreendimento_imagens i where i.empreendimento_id=e.id and i.url=x.url
);
