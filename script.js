const buttons = Array.from(document.querySelectorAll('.nav-btn'));
const panels  = Array.from(document.querySelectorAll('.panel'));
const order   = ['profile', 'projects', 'awards']; // 섹션 순서

let switchedByScroll = false;                // 전환 쿨다운 플래그
const SNAP_COOLDOWN   = 700;                 // 전환 후 쿨다운(ms)
const WHEEL_THRESHOLD  = 180;                // 경계에서 추가 휠 누적 임계치
const SWIPE_THRESHOLD  = 35;                 // 경계에서 터치 스와이프 픽셀
let wheelAccumDown = 0, wheelAccumUp = 0;    // 경계에서 누적치
let wheelTimer = null;
let touchStartY = 0;

function idxOf(id){ return Math.max(0, order.indexOf(id)); }
function currentId(){ return buttons.find(b=>b.classList.contains('active'))?.dataset.target || 'profile'; }
function clamp(n,min,max){ return Math.min(max, Math.max(min,n)); }

function setActive(targetId) {
  document.body.classList.add('docked');

  // 버튼 상태
  buttons.forEach(btn => {
    const active = btn.dataset.target === targetId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  // 패널 전환
  panels.forEach(p => p.classList.toggle('visible', p.id === targetId));

  // 문서 스크롤 맨 위로 (섹션 전환 후 자연스럽게)
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 해시 동기화
  if (history.replaceState) history.replaceState(null, '', `#${targetId}`);

  // 쿨다운
  switchedByScroll = true;
  setTimeout(()=> switchedByScroll = false, SNAP_COOLDOWN);

  // 휠 누적 초기화
  resetWheelAccum();
}

buttons.forEach(btn => btn.addEventListener('click', () => setActive(btn.dataset.target)));

function fromHash() {
  const id = (location.hash || '#profile').replace('#', '');
  setActive(order.includes(id) ? id : 'profile');
}
window.addEventListener('hashchange', fromHash);

// 이미지 썸네일 새 탭
function enableThumbOpen() {
  const thumbs = document.querySelectorAll('img.thumb, .gallery img');
  thumbs.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    const open = () => window.open(img.src, '_blank', 'noopener,noreferrer');
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

// ──────────────────────────────
// “경계에서 한 번 더” 스크롤해야 전환 (일반 페이지 느낌)
// ──────────────────────────────
const atTop = () => window.scrollY <= 1;
const atBottom = () => {
  const doc = document.documentElement;
  return window.innerHeight + window.scrollY >= doc.scrollHeight - 1;
};

function resetWheelAccum() {
  wheelAccumDown = 0; wheelAccumUp = 0;
  if (wheelTimer) { clearTimeout(wheelTimer); wheelTimer = null; }
}

function armWheelDecay() {
  if (wheelTimer) clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelAccumDown = 0; wheelAccumUp = 0; }, 250);
}

// 휠: 평소엔 페이지가 자연 스크롤, 경계에서만 “추가 휠 누적” 시 전환
window.addEventListener('wheel', (e) => {
  if (switchedByScroll) return;

  if (e.deltaY > 0) { // 아래로
    if (atBottom()) {
      wheelAccumDown += e.deltaY;
      armWheelDecay();
      if (wheelAccumDown >= WHEEL_THRESHOLD) {
        // 다음 섹션
        const cur = idxOf(currentId());
        const next = clamp(cur + 1, 0, order.length - 1);
        if (next !== cur) setActive(order[next]);
        resetWheelAccum();
      }
    } else {
      // 경계가 아니면 누적 초기화 (자연 스크롤 중)
      resetWheelAccum();
    }
  } else if (e.deltaY < 0) { // 위로
    if (atTop()) {
      wheelAccumUp += -e.deltaY; // 절대값 누적
      armWheelDecay();
      if (wheelAccumUp >= WHEEL_THRESHOLD) {
        // 이전 섹션
        const cur = idxOf(currentId());
        const prev = clamp(cur - 1, 0, order.length - 1);
        if (prev !== cur) setActive(order[prev]);
        resetWheelAccum();
      }
    } else {
      resetWheelAccum();
    }
  }
}, { passive: true });

// 터치: 경계에서 스와이프해야만 전환
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (switchedByScroll) return;
  const endY = e.changedTouches[0]?.clientY ?? touchStartY;
  const dy = touchStartY - endY; // 양수: 아래로 스크롤 의도

  if (dy > SWIPE_THRESHOLD && atBottom()) {
    const cur = idxOf(currentId());
    const next = clamp(cur + 1, 0, order.length - 1);
    if (next !== cur) setActive(order[next]);
  } else if (dy < -SWIPE_THRESHOLD && atTop()) {
    const cur = idxOf(currentId());
    const prev = clamp(cur - 1, 0, order.length - 1);
    if (prev !== cur) setActive(order[prev]);
  }
}, { passive: true });

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  enableThumbOpen();
  fromHash();
});
