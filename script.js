const form = document.getElementById('splitForm');
const input = document.getElementById('momentInput');
const splitBtn = document.getElementById('splitBtn');
const resultsSection = document.getElementById('results');
const resultsLabel = document.getElementById('resultsLabel');
const grid = document.getElementById('realityGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorText = document.getElementById('errorText');
const errorRetry = document.getElementById('errorRetry');
const cardTemplate = document.getElementById('realityCardTemplate');
const glitchTitle = document.getElementById('glitchTitle');

let currentMessage = '';

// small glitch flicker on the hero title, on load only
glitchTitle.dataset.text = glitchTitle.textContent;
glitchTitle.classList.add('glitching');
setTimeout(() => glitchTitle.classList.remove('glitching'), 400);

document.querySelectorAll('.chip[data-example]').forEach((chip) => {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.example;
    input.focus();
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  currentMessage = message;
  splitMoment(message);
});

errorRetry.addEventListener('click', () => {
  if (currentMessage) splitMoment(currentMessage);
});

function setLoading(isLoading) {
  loadingState.hidden = !isLoading;
  splitBtn.disabled = isLoading;
  splitBtn.querySelector('.btn-label').textContent = isLoading ? 'Splitting…' : 'Split it';
}

async function splitMoment(message) {
  setLoading(true);
  errorState.hidden = true;
  resultsSection.hidden = true;

  try {
    const res = await fetch('/api/split', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to split timeline.');

    renderRealities(data.realities, message);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function renderRealities(realities, message) {
  grid.innerHTML = '';
  realities.forEach((reality) => {
    grid.appendChild(buildCard(reality));
  });
  resultsLabel.textContent = `${realities.length} timelines branching from: "${message}"`;
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildCard(reality) {
  const node = cardTemplate.content.cloneNode(true);
  const card = node.querySelector('.reality-card');
  const universeTag = node.querySelector('.universe-tag');
  const title = node.querySelector('.reality-title');
  const story = node.querySelector('.reality-story');
  const rerollBtn = node.querySelector('.reroll-btn');

  universeTag.textContent = reality.universe;
  title.textContent = reality.title;
  story.textContent = reality.story;
  card.dataset.universe = reality.universe;

  rerollBtn.addEventListener('click', () => reroll(rerollBtn, card, universeTag, title, story));

  return node;
}

async function reroll(btn, card, universeTag, title, story) {
  btn.disabled = true;
  btn.classList.add('spinning');

  const otherUniverses = Array.from(grid.querySelectorAll('.reality-card'))
    .map((c) => c.dataset.universe)
    .filter(Boolean);

  try {
    const res = await fetch('/api/reroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: currentMessage, exclude: otherUniverses }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reroll.');

    card.style.opacity = '0';
    setTimeout(() => {
      universeTag.textContent = data.reality.universe;
      title.textContent = data.reality.title;
      story.textContent = data.reality.story;
      card.dataset.universe = data.reality.universe;
      card.style.opacity = '1';
    }, 150);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.classList.remove('spinning');
  }
}

function showError(message) {
  errorText.textContent = `⚠ ${message}`;
  errorState.hidden = false;
}
