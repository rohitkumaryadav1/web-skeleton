import {
  projects
} from './data.js';
const $ = s => document.querySelector(s);
const sceneContainer = $('#scene');
const params = new URLSearchParams(location.search);
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let manualReduced = params.get('motion') === 'reduce',
  current = 'interior',
  sceneAPI = null,
  selection = 0,
  autoplay = false,
  autoTimer = 0;
const project = key => projects.find(p => p.key === key) || projects[0];
const reduced = () => preference.matches || manualReduced;
const controls = [...document.querySelectorAll('[data-industry]')];

function notifySelection(key) {
  const p = project(key),
    index = projects.indexOf(p);
  document.querySelector('.fallback-screen img').src = `assets/images/screens/${key}-desktop.webp`;
  document.querySelector('.fallback-phone img').src = `assets/images/screens/${key}-mobile.webp`;
  $('#project-index').textContent = String(index + 1).padStart(2, '0') + ' / 05';
  document.querySelector('.scene-loading span').textContent = String(index + 1).padStart(2, '0') + ' / 05';
  $('#project-title').replaceChildren(document.createTextNode(p.name));
  const detail = document.createElement('span');
  detail.textContent = p.category + ' · Concept website';
  $('#project-title').append(detail);
  sceneContainer.setAttribute('aria-label', p.category + (sceneAPI ? ' concept shown on a desktop monitor, tablet and smartphone' : ' concept shown in the device preview'));
  sceneContainer.dataset.selected = key;
}
async function choose(key, announce = true) {
  const previous = sceneContainer.dataset.selected || 'interior';
  const token = ++selection;
  current = key;
  controls.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.industry === key)));
  sceneContainer.setAttribute('aria-busy', 'true');
  try {
    if (sceneAPI) await sceneAPI.select(key);
    if (token !== selection) return;
    notifySelection(key);
    if (announce) $('#selection-status').textContent = project(key).category + (sceneAPI ? ' concept selected. All three device layouts updated.' : ' concept selected. Static screen previews updated.');
  } catch (error) {
    if (token === selection) {
      current = previous;
      controls.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.industry === previous)));
      autoplay = false;
      schedule();
      $('#selection-status').textContent = 'This concept could not load. The previous concept is still displayed. Please try again.';
    }
  } finally {
    if (token === selection) sceneContainer.removeAttribute('aria-busy');
  }
}

function schedule() {
  clearTimeout(autoTimer);
  $('#autoplay').setAttribute('aria-pressed', String(autoplay));
  $('#autoplay').setAttribute('aria-label', autoplay ? 'Pause automatic project rotation' : 'Play automatic project rotation');
  $('#autoplay').innerHTML = autoplay ? '<span aria-hidden="true">Ⅱ</span> Pause' : '<span aria-hidden="true">▷</span> Play';
  if (autoplay && !reduced() && !document.hidden && sceneContainer.getBoundingClientRect().bottom > 0 && sceneContainer.getBoundingClientRect().top < innerHeight) autoTimer = setTimeout(() => {
    choose(projects[(projects.findIndex(p => p.key === current) + 1) % projects.length].key, false);
    schedule();
  }, 8500);
}
controls.forEach(b => b.addEventListener('click', () => {
  autoplay = false;
  schedule();
  choose(b.dataset.industry);
}));
$('#autoplay').addEventListener('click', () => {
  autoplay = !autoplay;
  schedule();
});

function motion() {
  const value = reduced();
  document.documentElement.classList.toggle('motion-reduced', value);
  document.documentElement.classList.toggle('motion-enabled', !value);
  $('#motion-toggle').setAttribute('aria-pressed', String(value));
  $('#motion-toggle').textContent = value ? 'Motion reduced' : 'Reduce motion';
  $('#motion-toggle').disabled = preference.matches;
  $('#autoplay').disabled = value;
  if (value) autoplay = false;
  sceneAPI?.setMotion(value);
  schedule();
  updateScroll();
}
$('#motion-toggle').addEventListener('click', () => {
  manualReduced = !manualReduced;
  motion();
});
preference.addEventListener('change', motion);
document.addEventListener('visibilitychange', schedule);
const nav = $('#nav'),
  menu = $('.menu-toggle');

function closeMenu() {
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
}
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
matchMedia('(min-width:801px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
$('#year').textContent = new Date().getFullYear();
const grid = $('#portfolio-grid');
projects.forEach(p => {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.category = p.key;
  card.innerHTML = `<button class="card-preview" type="button" data-open="${p.key}" aria-label="Preview ${p.name} concept" style="background:${p.color}"><img src="assets/images/screens/${p.key}-desktop.webp" width="1600" height="1000" loading="lazy" alt="${p.name} desktop website concept"><span class="preview-arrow" aria-hidden="true">↗</span></button><div class="card-category"><span>${p.category}</span><span>Concept demo</span></div><h3>${p.name}</h3><p>${p.description}</p><div class="card-actions"><button type="button" data-open="${p.key}">Explore concept ↗</button><button type="button" data-similar="${p.key}">Build something similar</button></div>`;
  grid.append(card);
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  let count = 0;
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) count++;
  });
  $('#result-count').textContent = count + ' concept website' + (count === 1 ? '' : 's') + ' · Illustrative work, not client projects';
}));
const dialog = $('#preview-dialog'),
  quoteDialog = $('#quote-dialog');
let selectedQuote = '';

function openPreview(key) {
  const p = project(key);
  $('#dialog-title').textContent = p.name;
  $('#dialog-description').textContent = p.category + ' · ' + p.type + ' · ' + p.description;
  $('#dialog-desktop').src = `assets/images/screens/${key}-desktop.webp`;
  $('#dialog-mobile').src = `assets/images/screens/${key}-mobile.webp`;
  $('#similar').dataset.key = key;
  dialog.showModal();
}

function openQuote(key = '') {
  selectedQuote = key;
  $('#quote-selection').textContent = key ? 'Your selected direction: ' + project(key).name + ' / ' + project(key).category : '';
  quoteDialog.showModal();
}
document.addEventListener('click', event => {
  const open = event.target.closest('[data-open]');
  if (open) openPreview(open.dataset.open);
  const similar = event.target.closest('[data-similar]');
  if (similar) openQuote(similar.dataset.similar);
});
$('#similar').addEventListener('click', () => {
  selectedQuote = $('#similar').dataset.key;
  dialog.close();
  $('#quote-selection').textContent = 'Your selected direction: ' + project(selectedQuote).name;
});
$('#quote').addEventListener('click', () => openQuote(selectedQuote));
document.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
const experience = $('.experience');
let scrollPending = false;
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));

function updateScroll() {
  scrollPending = false;
  const distance = Math.max(1, experience.offsetHeight - window.innerHeight);
  const p = (reduced() || innerWidth <= 800) ? 0 : clamp(-experience.getBoundingClientRect().top / distance);
  const fade = 1 - clamp((p - .08) / .35);
  const paper = clamp((p - .25) / .65);
  const style = $('.hero-sticky').style;
  style.setProperty('--copy-opacity', fade.toFixed(3));
  style.setProperty('--copy-events', fade < .05 ? 'none' : 'auto');
  style.setProperty('--scene-scroll', p.toFixed(3));
  style.setProperty('--transition-opacity', clamp((p - .62) / .3).toFixed(3));
  for (const [name, a, b] of [
      ['r', 16, 241],
      ['g', 23, 238],
      ['b', 21, 231]
    ]) style.setProperty('--stage-' + name, Math.round(a + (b - a) * paper));
  document.querySelector('.hero-copy').inert = fade < .05;
  document.querySelector('.industry-bar').inert = fade < .05;
  sceneAPI?.setProgress(p);
  document.querySelectorAll('.featured-project').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) el.style.setProperty('--feature-drift', reduced() ? '0px' : Math.round((rect.top - innerHeight * .4) * -.035) + 'px');
  });
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateScroll);
  }
}, {
  passive: true
});
window.addEventListener('resize', updateScroll);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      observer.unobserve(e.target);
    }
  }), {
    threshold: .08
  });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  new IntersectionObserver(() => schedule(), {
    threshold: .1
  }).observe(sceneContainer);
}
notifySelection(current);
motion();
async function enhance() {
  try {
    if (params.get('scene') === 'fail') throw new Error('Intentional module-failure test');
    const {
      mountScene
    } = await import('./scene.js?v=11');
    const initialKey = current;
    sceneAPI = await mountScene(sceneContainer, initialKey, {
      motionReduced: reduced(),
      onReady() {
        document.querySelector('.live-indicator').lastChild.textContent = ' Interactive 3D';
      },
      onFailure() {
        sceneAPI = null;
        sceneContainer.classList.add('scene-failed');
        document.querySelector('.live-indicator').textContent = 'Static device preview';
        notifySelection(current);
        $('#selection-status').textContent = 'Graphics support was interrupted. Static previews are active.';
      }
    });
    sceneAPI.setMotion(reduced());
    if (params.get('scene') === 'lost') setTimeout(() => sceneAPI?.loseContext(), 800);
    if (initialKey !== current) await choose(current, false);
    updateScroll();
  } catch (error) {
    sceneContainer.classList.add('scene-failed');
    document.querySelector('.live-indicator').textContent = 'Static device preview';
    $('#selection-status').textContent = 'The static preview is active. You can still explore all concepts below.';
    console.info('3D enhancement unavailable; static preview retained.', error.message);
  }
}
if (params.get('scene') !== 'off') {
  if ('requestIdleCallback' in window) requestIdleCallback(enhance, {
    timeout: 900
  });
  else setTimeout(enhance, 100);
} else {
  sceneContainer.classList.add('scene-failed');
  document.querySelector('.live-indicator').textContent = 'Static device preview';
}
