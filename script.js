/* DO POZNANIA V2 — cinematic scroll journey
 * The video never autoplays: scrolling determines its playback position.
 * Video uses short GOP encoding for responsive frame seeking.
 */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const video = $('#roadVideo');
  const journey = $('#journey');
  const stage = $('#stageMedia');
  const railFill = $('#railFill');
  const loading = $('#loading');
  const menu = $('#menuOverlay');
  const menuBtn = $('#menuBtn');
  const panelBackdrop = $('#panelBackdrop');
  const panelContent = $('#panelContent');
  const chapters = $$('.chapter');
  const railPercent = $('#railPercent');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // The film runs continuously to keep stars, ink and particles alive. Scroll
  // controls camera travel (parallax/scale) and the narrative chapters. We do
  // NOT seek while scrolling, as seeking a compressed MP4 freezes its motion.
  let progress = 0;
  let frameRequested = false;
  let lastScrollY = window.scrollY;
  let lastMotionTime = performance.now();
  let speed = 0;
  let mediaActive = false;
  let motionIdleTimer;

  function finishLoading() { loading.classList.add('done'); }
  document.addEventListener('DOMContentLoaded', () => setTimeout(finishLoading, 500), {once:true});
  window.addEventListener('load', () => setTimeout(finishLoading, 150), {once:true});
  setTimeout(finishLoading, 2500);

  // Use reliable muted autoplay, with an additional gesture fallback for
  // browsers that defer playing media until interaction.
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  function startVideo(){
    if (reducedMotion.matches) return;
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(() => {
        mediaActive = true;
        document.documentElement.classList.add('video-playing');
      }).catch(() => {
        mediaActive = false;
        document.documentElement.classList.remove('video-playing');
      });
    }
  }
  video.addEventListener('loadeddata', startVideo);
  video.addEventListener('canplay', startVideo, {once:true});
  video.addEventListener('playing', () => {
    mediaActive = true;
    document.documentElement.classList.add('video-playing');
  });
  video.addEventListener('error', () => {
    document.documentElement.classList.add('video-fallback');
  });
  window.addEventListener('pointerdown', () => { if (!mediaActive) startVideo(); }, {passive:true});
  window.addEventListener('touchstart', () => { if (!mediaActive) startVideo(); }, {passive:true});
  window.addEventListener('keydown', () => { if (!mediaActive) startVideo(); });
  startVideo();

  function update(){
    frameRequested = false;
    const rect = journey.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const range = Math.max(1, journey.offsetHeight - window.innerHeight);
    progress = Math.max(0, Math.min(1, (window.scrollY - top) / range));
    railFill.style.height = `${progress * 100}%`;
    const chapterIndex = Math.min(chapters.length - 1, Math.max(0, Math.round(progress * (chapters.length - 1))));
    if (railPercent) railPercent.textContent = `${String(Math.round(progress * 100)).padStart(2,'0')}%`;
    if (reducedMotion.matches){
      stage.style.transform = 'scale(1.065)';
      if (!video.paused) video.pause();
    } else {
      const scale = 1.065 + progress * .22;
      const shiftX = Math.sin(progress * 8.5) * 2.1;
      const shiftY = progress * 2.2;
      stage.style.transform = `translate3d(${shiftX}%,${shiftY}%,0) scale(${scale})`;
      const now = performance.now();
      const dt = Math.max(16, now - lastMotionTime);
      const ds = Math.abs(window.scrollY - lastScrollY);
      // This affects only how fast the ambient road film moves. The video
      // continues playing when scroll stops instead of freezing on a frame.
      const instantSpeed = Math.min(1, ds / dt / 1.6);
      speed = speed * .7 + instantSpeed * .3;
      if (mediaActive && !video.paused) video.playbackRate = Math.max(.7, Math.min(1.55, .7 + speed * .85));
      clearTimeout(motionIdleTimer);
      motionIdleTimer = setTimeout(() => { if (!video.paused) video.playbackRate = .7; }, 180);
      lastScrollY = window.scrollY;
      lastMotionTime = now;
      if (!mediaActive && video.readyState >= 2) startVideo();
    }
    const washes = [.28,.28,.28,.30,.29,.27];
    journey.style.setProperty('--wash', String(washes[chapterIndex]));
  }
  function scheduleUpdate(){ if (!frameRequested) { frameRequested = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', scheduleUpdate, {passive:true});
  window.addEventListener('resize', scheduleUpdate, {passive:true});
  update();

  function closeMenu(){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');}
  function openMenu(){closePanel();menu.classList.add('open');menu.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');}
  menuBtn.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  $('#closeMenu').addEventListener('click', closeMenu);
  function scrollToChapter(id){closeMenu();closePanel();const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});}
  $$('a[href^="#"]').forEach(el=>el.addEventListener('click',(e)=>{ const hash=el.getAttribute('href');if(hash.length<2)return;const id=decodeURIComponent(hash.slice(1));if(document.getElementById(id)){e.preventDefault();history.replaceState(null,'',hash);scrollToChapter(id);} }));

  const content = {
    about:{index:'ABOUT',title:'O projekcie',lead:'Niezależny projekt kreatywny, którego punktem wyjścia są warsztaty taneczne.',body:'Projekt patrzy także na szersze i dalsze perspektywy. Historia i filozofia — treści do uzupełnienia przez organizatorów.',facts:[['SEKCJA','Historia i filozofia']],button:'Warsztaty',go:'workshops'},
    workshops:{index:'WORKSHOPS',title:'Warsztaty',lead:'Informacje o warsztatach, instruktorach i zapisach.',body:'Daty, lokalizacja, program, instruktorzy i link zapisów będą uzupełnione po otrzymaniu materiałów od organizatorów.',facts:[['STATUS','Szczegóły do uzupełnienia'],['ZAPISY','Link do uzupełnienia']],button:'Kontakt',go:'contact'},
    community:{index:'COMMUNITY',title:'Community',lead:'Zdjęcia i filmy z wydarzeń.',body:'Miejsce na prawdziwe materiały z poprzednich edycji.',facts:[['GALERIA','Materiały do uzupełnienia']],button:'Archiwum',go:'archive'},
    archive:{index:'ARCHIVE',title:'Archiwum',lead:'Zdjęcia i wspomnienia z poprzednich edycji.',body:'Galerie i filmy zostaną dodane po otrzymaniu materiałów.',facts:[['MATERIAŁY','Do uzupełnienia']],button:'Warsztaty',go:'workshops'},
    contact:{index:'CONTACT',title:'Kontakt',lead:'Kontakt, Instagram i współpraca.',body:'Dane kontaktowe i oficjalne kanały organizatorów zostaną uzupełnione.',facts:[['E-MAIL','Do uzupełnienia'],['INSTAGRAM','Do uzupełnienia']],button:'Wróć na drogę',go:'destination'}
  };
  function openPanel(key){
    const data = content[key]; if(!data)return;
    closeMenu();
    panelContent.innerHTML = `<div class="eyebrow"><span class="eyebrow__line"></span> ${data.index}</div><h2 id="panelTitle">${data.title}</h2><p>${data.lead}</p><p class="fine">${data.body}</p>${data.facts.map(([a,b])=>`<div class="panel-fact"><span>${a}</span><b>${b}</b></div>`).join('')}<button class="action action--black panel-cta" id="panelCTA">${data.button} <span><svg class="dp-arrow dp-arrow--diagonal" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 19 19 5M7 5h12v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>`;
    $('#panelCTA').addEventListener('click',()=>content[data.go]?openPanel(data.go):scrollToChapter(data.go));
    panelBackdrop.classList.add('open');panelBackdrop.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    $('#closePanel').focus();
  }
  function closePanel(){panelBackdrop.classList.remove('open');panelBackdrop.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  $$('[data-panel]').forEach(el=>el.addEventListener('click',()=>openPanel(el.dataset.panel)));
  $('#closePanel').addEventListener('click',closePanel);
  panelBackdrop.addEventListener('click',e=>{if(e.target===panelBackdrop)closePanel();});
  window.addEventListener('load',()=>{ const hash=decodeURIComponent(location.hash.slice(1));if(hash && document.getElementById(hash))setTimeout(()=>document.getElementById(hash).scrollIntoView({block:'start',behavior:'instant'}),60); });

  // Preselect an event from the event card or the shareable URL.
  const eventSelect = $('#eventSelect');
  const eventPosters = {
    'workshops-16-01': {src:'./assets/poster-warsztaty-16-01.jpg', title:'Warsztaty · 16.01'},
    'open-class-06-12': {src:'./assets/poster-open-class-06-12.jpg', title:'Open Class · 6.12'}
  };
  const updateEventPreview = () => {
    const preview = $('#registrationEventPreview');
    const poster = $('#registrationEventPoster');
    const name = $('#registrationEventName');
    if (!preview || !eventSelect || !poster || !name) return;
    const selected = eventSelect.selectedOptions[0];
    const data = selected && eventPosters[selected.dataset.event];
    if (!data) { preview.hidden = true; return; }
    poster.src = data.src;
    poster.alt = 'Plakat: ' + data.title;
    name.textContent = data.title;
    preview.hidden = false;
  };
  const applyEvent = (id) => {
    if (!eventSelect) return;
    const match = Array.from(eventSelect.options).find(option => option.dataset.event === id);
    if (match) eventSelect.value = match.value;
    updateEventPreview();
  };
  if (eventSelect) eventSelect.addEventListener('change', updateEventPreview);
  applyEvent(new URLSearchParams(location.search).get('event'));
  $$('[data-event][href]').forEach(link => link.addEventListener('click', event => {
    const id = link.dataset.event;
    if (!id || !eventSelect) return;
    event.preventDefault();
    applyEvent(id);
    const url = new URL(location.href);
    url.searchParams.set('event', id);
    url.hash = 'zapisz-sie';
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    scrollToChapter('zapisz-sie');
  }));

  // Formspree: AJAX submission keeps the guest on the journey and shows
  // a branded confirmation only after Formspree returns an actual success.
  const registrationForm = $('#registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = $('#registrationSubmit');
      const error = $('#formError');
      const success = $('#formSuccess');
      error.hidden = true;
      submit.disabled = true;
      const buttonLabel = submit.querySelector('span');
      const originalLabel = buttonLabel.textContent;
      buttonLabel.textContent = 'WYSYŁANIE…';
      try {
        const response = await fetch(registrationForm.action, {
          method: 'POST',
          body: new FormData(registrationForm),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Formspree returned ' + response.status);
        registrationForm.hidden = true;
        const formTop = document.querySelector('.form-top');
        if (formTop) formTop.hidden = true;
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
      } catch (err) {
        error.hidden = false;
        buttonLabel.textContent = originalLabel;
        submit.disabled = false;
      }
    });
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closePanel();}});
})();

/* V12: hero clip playback begins after the opening branding. */
(() => {
  const video = document.getElementById('heroDanceVideo');
  if (!video) return;
  let clipStart = 10;
  const applyStart = () => {
    if (Number.isFinite(video.duration) && video.duration > 1) {
      clipStart = Math.min(video.duration * .47, Math.max(.1, video.duration - 3));
      if (video.currentTime < clipStart - .2) video.currentTime = clipStart;
    }
  };
  video.addEventListener('loadedmetadata', applyStart);
  video.addEventListener('timeupdate', () => {
    if (video.duration && video.currentTime >= video.duration - .15) {
      video.currentTime = clipStart;
      video.play().catch(() => {});
    }
  });
  if (video.readyState >= 1) applyStart();
  video.play().catch(() => {});
})();
