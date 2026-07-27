import { curriculum } from './data/curriculum.js';

const STORAGE_KEY = 'playwright-daily:completed';

const nav = document.getElementById('day-nav');
const lessonEl = document.getElementById('lesson');
const progressFill = document.getElementById('progress-fill');
const progressCount = document.getElementById('progress-count');
const mobileProgress = document.getElementById('mobile-progress');
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('sidebar-scrim');
const navToggle = document.getElementById('nav-toggle');

const loadCompleted = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
};

let completed = loadCompleted();
const saveCompleted = () => localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));

const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
};

/* ─────────────────────────── sidebar ─────────────────────────── */

function renderNav(activeDay) {
  nav.replaceChildren();
  let currentWeek = null;

  for (const lesson of curriculum) {
    if (lesson.week !== currentWeek) {
      currentWeek = lesson.week;
      nav.append(el('div', { className: 'week-title', textContent: lesson.weekTitle }));
    }

    const classes = ['day-link'];
    if (lesson.day === activeDay) classes.push('active');
    if (completed.has(lesson.day)) classes.push('done');
    if (lesson.status === 'planned') classes.push('planned');

    const btn = el(
      'button',
      { className: classes.join(' '), type: 'button' },
      el('span', { className: 'day-num', textContent: completed.has(lesson.day) ? '\u2713' : String(lesson.day) }),
      el('span', { className: 'day-name', textContent: lesson.title })
    );
    btn.addEventListener('click', () => {
      location.hash = `#day-${lesson.day}`;
      closeDrawer();
    });
    nav.append(btn);
  }

  const total = curriculum.length;
  const done = [...completed].filter((d) => curriculum.some((l) => l.day === d)).length;
  progressCount.textContent = `${done} / ${total}`;
  progressFill.style.width = `${(done / total) * 100}%`;
  mobileProgress.textContent = `${done}/${total}`;
}

/* ─────────────────────────── mobile drawer ─────────────────────────── */

function setDrawer(open) {
  sidebar.classList.toggle('open', open);
  scrim.hidden = !open;
  navToggle.setAttribute('aria-expanded', String(open));
}

const closeDrawer = () => setDrawer(false);

navToggle.addEventListener('click', () => setDrawer(!sidebar.classList.contains('open')));
scrim.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDrawer();
});

/* ─────────────────────────── lesson body ─────────────────────────── */

function codeBlock(code, title) {
  const pre = el('pre', {}, el('code', { textContent: code }));
  const copy = el('button', { className: 'copy-btn', type: 'button', textContent: 'Copy' });
  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code);
    copy.textContent = 'Copied';
    setTimeout(() => (copy.textContent = 'Copy'), 1200);
  });
  const head = el('div', { className: 'code-head' }, el('span', { textContent: title ?? '' }), copy);
  return el('div', {}, head, pre);
}

function renderSection(section) {
  if (section.type === 'code') {
    return el('div', { className: 'card' }, codeBlock(section.code, section.title));
  }
  if (section.type === 'callout') {
    return el(
      'div',
      { className: `callout ${section.variant === 'ts' ? 'ts' : ''}`, innerHTML: `<strong>${section.title}</strong>${section.body}` }
    );
  }
  const card = el('div', { className: 'card' });
  if (section.title) card.append(el('h3', { textContent: section.title }));
  card.append(el('div', { innerHTML: section.body }));
  return card;
}

function renderLesson(lesson) {
  lessonEl.replaceChildren();
  window.scrollTo(0, 0);

  lessonEl.append(
    el('div', { className: 'eyebrow', textContent: `Day ${lesson.day} \u00b7 ${lesson.weekTitle}` }),
    el('h2', { textContent: lesson.title })
  );

  const meta = el('div', { className: 'meta-row' }, el('span', { className: 'pill', textContent: `${lesson.minutes} min` }));
  if (lesson.status === 'planned') meta.append(el('span', { className: 'pill', textContent: 'Roadmap' }));
  if (completed.has(lesson.day)) meta.append(el('span', { className: 'pill accent', textContent: 'Completed' }));
  lessonEl.append(meta);

  if (lesson.objectives?.length) {
    lessonEl.append(
      el(
        'div',
        { className: 'card' },
        el('h3', { textContent: "What you'll be able to do" }),
        el('ul', {}, lesson.objectives.map((o) => el('li', { textContent: o })))
      )
    );
  }

  if (lesson.status === 'planned') {
    lessonEl.append(
      el(
        'div',
        { className: 'card' },
        el('h3', { textContent: 'Not written yet' }),
        el('p', {
          className: 'planned-note',
          textContent:
            'This day is on the roadmap. Ask me to write it when you get here \u2014 lessons are authored a batch at a time so they can build on what you actually struggled with.',
        })
      )
    );
  }

  for (const section of lesson.sections ?? []) lessonEl.append(renderSection(section));

  if (lesson.exercise) {
    const card = el(
      'div',
      { className: 'card' },
      el('h3', { textContent: "Today's exercise" }),
      el('p', {}, el('code', { textContent: lesson.exercise.file })),
      el('p', { textContent: lesson.exercise.brief }),
      el(
        'ul',
        { className: 'task-list' },
        lesson.exercise.tasks.map((t, i) =>
          el('li', {}, el('span', { className: 'task-num', textContent: String(i + 1) }), el('span', { textContent: t }))
        )
      )
    );
    lessonEl.append(card);
    lessonEl.append(
      codeBlockCard(`npm test -- day${String(lesson.day).padStart(2, '0')}`, 'Run just today\u2019s exercise')
    );
  }

  if (lesson.docs?.length) {
    lessonEl.append(
      el(
        'div',
        { className: 'card' },
        el('h3', { textContent: 'Official docs for today' }),
        el(
          'div',
          { className: 'link-row' },
          lesson.docs.map((d) => el('a', { href: d.url, target: '_blank', rel: 'noreferrer', textContent: d.label }))
        )
      )
    );
  }

  const isDone = completed.has(lesson.day);
  const doneBtn = el('button', {
    className: `btn primary ${isDone ? 'is-done' : ''}`,
    type: 'button',
    textContent: isDone ? '\u2713 Marked complete' : 'Mark day complete',
  });
  doneBtn.addEventListener('click', () => {
    if (completed.has(lesson.day)) completed.delete(lesson.day);
    else completed.add(lesson.day);
    saveCompleted();
    route();
  });

  const actions = el('div', { className: 'footer-actions' }, doneBtn);
  const prev = curriculum.find((l) => l.day === lesson.day - 1);
  const next = curriculum.find((l) => l.day === lesson.day + 1);
  if (prev) actions.append(el('a', { className: 'btn', href: `#day-${prev.day}`, textContent: `\u2190 Day ${prev.day}` }));
  if (next) actions.append(el('a', { className: 'btn', href: `#day-${next.day}`, textContent: `Day ${next.day} \u2192` }));
  lessonEl.append(actions);
}

function codeBlockCard(code, title) {
  return el('div', { className: 'card' }, codeBlock(code, title));
}

/* ─────────────────────────── routing ─────────────────────────── */

function route() {
  const match = /^#day-(\d+)$/.exec(location.hash);
  const day = match ? Number(match[1]) : firstUnfinishedDay();
  const lesson = curriculum.find((l) => l.day === day) ?? curriculum[0];
  renderNav(lesson.day);
  renderLesson(lesson);
}

function firstUnfinishedDay() {
  return (curriculum.find((l) => !completed.has(l.day)) ?? curriculum[0]).day;
}

window.addEventListener('hashchange', route);
route();

/* ─────────────────────────── PWA ─────────────────────────── */

// Service workers need a secure context: https, or localhost during development.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
