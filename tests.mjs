import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=f=>fs.readFileSync(new URL(f, import.meta.url),'utf8');
const pages=['index.html','imoveis.html','empreendimento.html','contato.html','parceiros.html'];
for(const p of pages){
  const h=read(p);
  assert.match(h,/name="viewport"/);
  assert.match(h,/logo-acj-prime\.png/);
  assert.match(h,/Parceiros/);
}
const js=read('script.js');
assert.ok(js.includes('loadProperties'));
assert.ok(js.includes('acj_empreendimentos'));
assert.ok(js.includes('acj_parceiros'));
assert.ok(js.includes('uploadPartnerFile'));
const sql=read('supabase-acj-prime-v6.sql');
for(const t of ['acj_empreendimentos','acj_empreendimento_imagens','acj_parceiros','acj_leads']) assert.ok(sql.includes(t));
assert.ok(sql.includes("bucket_id='acj-parceiros'"));
console.log('ACJ Prime V6: testes aprovados');
