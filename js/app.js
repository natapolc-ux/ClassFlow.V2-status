const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let meta = { levels: [], classesByLevel: {} };
function query(params) { const p=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v)p.set(k,v)}); return p.toString(); }
async function get(params) {
  if (!API_URL || API_URL.includes('PASTE_YOUR')) throw new Error('กรุณาตั้งค่า API_URL ใน js/config.js');
  const r=await fetch(API_URL+'?'+query(params)), data=await r.json(); if(!data.ok)throw new Error(data.error||'โหลดข้อมูลไม่สำเร็จ'); return data;
}
async function init() {
  try { meta=await get({action:'publicStatus'}); fillLevels(); render([]); } catch(e){ $('message').textContent=e.message; }
}
function fillLevels(){
  $('level').innerHTML='<option value="">เลือกระดับชั้น</option>'+meta.levels.map(x=>'<option>'+esc(x)+'</option>').join('');
}
function levelChanged(){
  const l=$('level').value, rooms=meta.classesByLevel[l]||[];
  $('className').innerHTML='<option value="">เลือกห้อง</option>'+rooms.map(x=>'<option>'+esc(x)+'</option>').join('');
}
async function searchStatus(){
  const level=$('level').value, className=$('className').value, studentId=$('studentId').value.trim();
  if(!level||!className){$('message').textContent='กรุณาเลือกระดับชั้นและห้อง';return;}
  $('message').textContent='กำลังโหลด...';
  try { const d=await get({action:'publicStatus',level,className,studentId}); render(d.rows||[]); $('message').textContent=d.rows.length?'':'ไม่พบข้อมูล'; }
  catch(e){$('message').textContent=e.message;}
}
function render(rows){
  $('results').innerHTML=rows.map(r=>`<section class="card"><h2>เลขที่ ${esc(r.student.No)} — ${esc(r.student.Name)}</h2><div class="room">${esc(r.student.Level)} / ${esc(r.student.ClassName)}</div><div class="table-wrap"><table><thead><tr><th>งาน</th><th>สถานะ</th></tr></thead><tbody>${r.works.map(w=>`<tr><td>${esc(w.Topic)}</td><td><span class="status ${w.status==='ตรวจแล้ว'?'checked':w.status==='ส่งแล้ว'?'sent':'missing'}">${esc(w.status)}</span></td></tr>`).join('')}</tbody></table></div></section>`).join('');
}
window.addEventListener('load',init);
