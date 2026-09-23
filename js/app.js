const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let meta = { levels: [], classesByLevel: {} };
function query(params) { const p=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v)p.set(k,v)}); return p.toString(); }
async function get(params) {
  if (!API_URL || API_URL.includes('PASTE_YOUR')) throw new Error('กรุณาตั้งค่า API_URL ใน js/config.js');
  const r=await fetch(API_URL+'?'+query(params)), data=await r.json(); if(!data.ok)throw new Error(data.error||'โหลดข้อมูลไม่สำเร็จ'); return data;
}
async function init() {
  try { meta=await get({action:'publicStatus'}); fillLevels(); render([],[]); } catch(e){ $('message').textContent=e.message; }
}
function fillLevels(){ $('level').innerHTML='<option value="">เลือกระดับชั้น</option>'+meta.levels.map(x=>'<option>'+esc(x)+'</option>').join(''); }
function levelChanged(){
  const rooms=meta.classesByLevel[$('level').value]||[];
  $('className').innerHTML='<option value="">เลือกห้อง</option>'+rooms.map(x=>'<option>'+esc(x)+'</option>').join('');
}
async function searchStatus(){
  const level=$('level').value, className=$('className').value, search=$('studentSearch').value.trim();
  if(!level||!className){$('message').textContent='กรุณาเลือกระดับชั้นและห้อง';return;}
  $('message').textContent='กำลังโหลด...';
  try { const d=await get({action:'publicStatus',level,className,search}); render(d.assignments||[],d.rows||[]); $('message').textContent=d.rows.length?`พบ ${d.rows.length} คน`:'ไม่พบข้อมูล'; }
  catch(e){$('message').textContent=e.message;}
}
function statusClass(status){ return status==='ตรวจแล้ว'?'checked':status==='ส่งแล้ว'?'sent':'missing'; }
function render(assignments,rows){
  if(!rows.length){$('results').innerHTML='';return;}
  const headers=assignments.map(a=>`<th class="assignment">${esc(a.Topic)}</th>`).join('');
  const body=rows.map(r=>`<tr><td class="sticky no">${esc(r.student.No)}</td><td class="sticky name"><b>${esc(r.student.Name)}</b><small>${esc(r.student.UserID)}</small></td>${(r.statuses||[]).map(s=>`<td><span class="status ${statusClass(s)}">${esc(s)}</span></td>`).join('')}</tr>`).join('');
  $('results').innerHTML=`<div class="table-wrap"><table><thead><tr><th class="sticky no">เลขที่</th><th class="sticky name">ชื่อ–นามสกุล</th>${headers}</tr></thead><tbody>${body}</tbody></table></div>`;
}
window.addEventListener('load',init);
