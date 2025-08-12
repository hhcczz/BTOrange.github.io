const nav = document.getElementById('nav');
const buttons = Array.from(document.querySelectorAll('.nav-btn'));
const panels = Array.from(document.querySelectorAll('.panel'));

function setActive(targetId){
  // 도킹
  document.body.classList.add('docked');

  // 버튼 상태
  buttons.forEach(btn=>{
    const active = btn.dataset.target === targetId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  // 패널 전환
  panels.forEach(p=>{
    p.classList.toggle('visible', p.id === targetId);
  });

  // 스크롤 상단으로 (모바일 대비)
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 초기(중앙) 상태에서도 클릭 시 도킹 + 전환
buttons.forEach(btn=>{
  btn.addEventListener('click', ()=> setActive(btn.dataset.target));
});

// 해시 라우팅 지원(#projects 등으로 진입 시)
function fromHash(){
  const id = (location.hash || '#profile').replace('#','');
  const exists = panels.some(p=>p.id === id);
  setActive(exists ? id : 'profile');
}
window.addEventListener('hashchange', fromHash);

// 최초 로드
fromHash();
