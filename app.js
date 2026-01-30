// Simple state
const state = { experience:[], education:[] };
const KEY = 'resume_builder_data_v1';

// DOM refs
const $ = id => document.getElementById(id);
const templateSelect = $('template');
const previewRoot = document.querySelector('#preview-root');
const resumePreview = $('resume-preview');

function addExperience(company, role, dates){
  if(!company && !role) return;
  state.experience.unshift({company, role, dates});
  renderLists(); renderPreview();
}
function addEducation(school, degree, dates){
  if(!school && !degree) return;
  state.education.unshift({school, degree, dates});
  renderLists(); renderPreview();
}

function removeListItem(type, idx){
  state[type].splice(idx,1); renderLists(); renderPreview();
}

function renderLists(){
  const exp = $('experience-list'); exp.innerHTML = '';
  state.experience.forEach((e,i)=>{
    const div = document.createElement('div'); div.className='list-item';
    div.innerHTML = `<input value="${escapeHtml(e.company)} - ${escapeHtml(e.role)} (${escapeHtml(e.dates)})" readonly><button class='small' onclick='removeListItem("experience", ${i})'>Remove</button>`;
    exp.appendChild(div);
  });
  const edu = $('education-list'); edu.innerHTML = '';
  state.education.forEach((e,i)=>{
    const div = document.createElement('div'); div.className='list-item';
    div.innerHTML = `<input value="${escapeHtml(e.school)} - ${escapeHtml(e.degree)} (${escapeHtml(e.dates)})" readonly><button class='small' onclick='removeListItem("education", ${i})'>Remove</button>`;
    edu.appendChild(div);
  });
}

function renderPreview(){
  const data = collectForm();
  const skills = (data.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
  resumePreview.innerHTML = `
    <div class="r-header">
      <div>
        <div class="name">${escapeHtml(data.name||'Your Name')}</div>
        <div class="title">${escapeHtml(data.title||'Your Title')} • <span class='muted'>${escapeHtml(data.email||'')}</span></div>
      </div>
      <div class='muted'>${escapeHtml(data.phone||'')}</div>
    </div>
    <div class='section'><div class='muted'>Summary</div><div>${escapeHtml(data.summary||'Short summary about you...')}</div></div>
    <div class='section'><h3>Experience</h3>${state.experience.map(e=>`<div class='item'><strong>${escapeHtml(e.role)}</strong> — ${escapeHtml(e.company)} <div class='muted' style='font-size:12px'>${escapeHtml(e.dates||'')}</div></div>`).join('')}</div>
    <div class='section'><h3>Education</h3>${state.education.map(e=>`<div class='item'><strong>${escapeHtml(e.degree)}</strong> — ${escapeHtml(e.school)} <div class='muted' style='font-size:12px'>${escapeHtml(e.dates||'')}</div></div>`).join('')}</div>
    <div class='section'><h3>Skills</h3><div>${skills.map(s=>`<span style="display:inline-block;margin:4px 6px;padding:4px 8px;background:#f1f5f9;border-radius:12px;font-size:13px">${escapeHtml(s)}</span>`).join('')}</div></div>
  `;
}

function collectForm(){
  return {
    name: $('name').value,
    title: $('title').value,
    email: $('email').value,
    phone: $('phone').value,
    summary: $('summary').value,
    skills: $('skills').value,
    template: templateSelect.value,
    experience: state.experience,
    education: state.education
  };
}

function saveData(){
  const data = collectForm();
  localStorage.setItem(KEY, JSON.stringify(data));
  alert('Saved locally ✅');
}
function loadData(){
  const raw = localStorage.getItem(KEY);
  if(!raw){ alert('No saved data found'); return }
  const data = JSON.parse(raw);
  $('name').value=data.name||'';
  $('title').value=data.title||'';
  $('email').value=data.email||'';
  $('phone').value=data.phone||'';
  $('summary').value=data.summary||'';
  $('skills').value=data.skills||'';
  state.experience = data.experience||[]; state.education = data.education||[];
  templateSelect.value = data.template||'minimal'; applyTemplate(); renderLists(); renderPreview();
  alert('Loaded ✅');
}

function downloadJSON(){
  const data = collectForm(); const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='resume.json'; a.click();
}

function exportPDF(){
  // Use html2pdf to convert #resume-preview
  const opt = { margin:0.6, filename:'resume.pdf', image:{type:'jpeg',quality:0.95}, html2canvas:{scale:2}, jsPDF:{unit:'in',format:'letter',orientation:'portrait'}};
  html2pdf().set(opt).from(resumePreview).save();
}

function clearData(){
  if(!confirm('Clear all fields and local data?')) return;
  localStorage.removeItem(KEY);
  state.experience = []; state.education = [];
  ['name','title','email','phone','summary','skills'].forEach(id=>$(id).value=''); renderLists(); renderPreview();
}

function applyTemplate(){
  previewRoot.className = 'resume-root template-'+templateSelect.value;
}

// helpers
function escapeHtml(str){ return String(str||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// events
document.getElementById('add-exp').addEventListener('click', ()=>{ addExperience($('exp-company').value, $('exp-role').value, $('exp-dates').value); $('exp-company').value=''; $('exp-role').value=''; $('exp-dates').value=''; });
document.getElementById('add-edu').addEventListener('click', ()=>{ addEducation($('edu-school').value, $('edu-degree').value, $('edu-dates').value); $('edu-school').value=''; $('edu-degree').value=''; $('edu-dates').value=''; });
$('save').addEventListener('click', saveData);
$('load').addEventListener('click', loadData);
$('download').addEventListener('click', downloadJSON);
$('export').addEventListener('click', exportPDF);
$('clear').addEventListener('click', clearData);

['name','title','email','phone','summary','skills'].forEach(id=>document.getElementById(id).addEventListener('input', renderPreview));
templateSelect.addEventListener('change', ()=>{ applyTemplate(); saveData(); });

// init
renderLists(); renderPreview(); applyTemplate();