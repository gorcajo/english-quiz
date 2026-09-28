const JSON_FILES = ['resources/conditionals.json', 'resources/modals.json', 'resources/there-to-be.json'];

let allSections = []; // { file, title, id, name, cards: [{es, en}] }
let bank = [];
let currentCard = null;
let revealed = false;

const errorBox = document.getElementById('error');
const setupView = document.getElementById('setup-view');
const quizView = document.getElementById('quiz-view');
const topicsFieldset = document.getElementById('topics-fieldset');
const sectionsFieldset = document.getElementById('sections-fieldset');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const actionBtn = document.getElementById('actionBtn');
const cardMeta = document.getElementById('cardMeta');
const cardEs = document.getElementById('cardEs');
const cardEn = document.getElementById('cardEn');

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

async function loadFile(name) {
  const response = await fetch(name);
  if (!response.ok) {
    throw new Error(`${name}: HTTP ${response.status}`);
  }
  return response.json();
}

function buildSections(file, data) {
  const title = data.title || '(no title)';
  const sections = [];
  for (const section of data.sections || []) {
    const cards = [];
    for (const item of section.items || []) {
      const es = (item.es || '').trim();
      const en = (item.en || '').trim();
      if (es && en) cards.push({ es, en });
    }
    if (cards.length) {
      sections.push({
        file,
        title,
        id: section.id,
        name: section.name || '(no section)',
        cards,
      });
    }
  }
  return sections;
}

function renderTopicCheckboxes() {
  const titlesByTopic = {};
  for (const s of allSections) titlesByTopic[s.file] = s.title;

  topicsFieldset.innerHTML = '<legend>Topics</legend>';
  for (const file of JSON_FILES) {
    if (!(file in titlesByTopic)) continue;
    const label = document.createElement('label');
    label.className = 'checkbox-row';
    label.innerHTML = `<input type="checkbox" data-topic="${file}" checked> ${titlesByTopic[file]}`;
    label.querySelector('input').addEventListener('change', renderSectionCheckboxes);
    topicsFieldset.appendChild(label);
  }
}

function checkedTopics() {
  return [...topicsFieldset.querySelectorAll('input[type=checkbox]:checked')].map(cb => cb.dataset.topic);
}

function renderSectionCheckboxes() {
  const topics = new Set(checkedTopics());
  sectionsFieldset.innerHTML = '<legend>Sections</legend>';
  for (const section of allSections) {
    if (!topics.has(section.file)) continue;
    const label = document.createElement('label');
    label.className = 'checkbox-row';
    label.innerHTML = `<input type="checkbox" data-topic="${section.file}" data-id="${section.id}" checked> ${section.title} — ${section.name}`;
    sectionsFieldset.appendChild(label);
  }
}

function selectedSections() {
  const boxes = [...sectionsFieldset.querySelectorAll('input[type=checkbox]:checked')];
  const keys = new Set(boxes.map(cb => `${cb.dataset.topic}::${cb.dataset.id}`));
  return allSections.filter(s => keys.has(`${s.file}::${s.id}`));
}

function pickCard() {
  currentCard = bank[Math.floor(Math.random() * bank.length)];
  revealed = false;
  cardMeta.textContent = `${currentCard.title} — ${currentCard.name}`;
  cardEs.textContent = currentCard.es;
  cardEn.textContent = currentCard.en;
  cardEn.classList.remove('visible');
  actionBtn.textContent = 'Show answer';
}

function reveal() {
  revealed = true;
  cardEn.classList.add('visible');
  actionBtn.textContent = 'Next card';
}

function advance() {
  if (!revealed) reveal();
  else pickCard();
}

startBtn.addEventListener('click', () => {
  bank = selectedSections().flatMap(s => s.cards.map(c => ({ ...c, title: s.title, name: s.name })));
  if (bank.length === 0) {
    showError('No exercises match the selected filters.');
    return;
  }
  errorBox.style.display = 'none';
  setupView.classList.remove('active');
  quizView.classList.add('active');
  pickCard();
});

backBtn.addEventListener('click', () => {
  quizView.classList.remove('active');
  setupView.classList.add('active');
});

actionBtn.addEventListener('click', advance);

document.addEventListener('keydown', (e) => {
  if (!quizView.classList.contains('active')) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    advance();
  }
});

async function init() {
  try {
    const loaded = await Promise.all(JSON_FILES.map(f => loadFile(f).then(data => ({ file: f, data }))));
    for (const { file, data } of loaded) {
      allSections.push(...buildSections(file, data));
    }
    if (!allSections.length) {
      showError('No exercises were found in the selected topics.');
      return;
    }
    renderTopicCheckboxes();
    renderSectionCheckboxes();
    setupView.classList.add('active');
  } catch (err) {
    showError(
      `Could not load exercise topics (${err.message}). ` +
      `If you opened this file directly (file://), browsers block local JSON requests. ` +
      `Serve this folder instead, e.g. run "python3 -m http.server" inside exercises/ and open http://localhost:8000/speak_translation_quiz.html`
    );
  }
}

init();
