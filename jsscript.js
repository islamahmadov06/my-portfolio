// js/script.js

// ========== Config ==========
const GITHUB_USERNAME = 'islamahmadov06'; // REPLACE if needed
const GITHUB_REPO_COUNT = 6; // number of repos to show

// ========= Utilities ==========
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

// Smooth scroll for internal links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({behavior:'smooth', block:'start'});
});

// Fade-in on scroll (IntersectionObserver)
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});

qsa('.fade-up').forEach(el => io.observe(el));
qsa('.section').forEach(el => el.classList.add('fade-up') || io.observe(el));

// Theme toggle (persist)
const themeToggle = qs('#theme-toggle');
const root = document.documentElement;
function setTheme(name) {
  if (name === 'dark') {
    root.setAttribute('data-theme','dark');
    themeToggle.textContent = '☀️'; themeToggle.setAttribute('aria-pressed','true');
  } else {
    root.removeAttribute('data-theme');
    themeToggle.textContent = '🌙'; themeToggle.setAttribute('aria-pressed','false');
  }
  localStorage.setItem('theme', name);
}
themeToggle.addEventListener('click', () => {
  const current = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
  setTheme(current);
});
if (localStorage.getItem('theme') === 'dark') setTheme('dark');

// ========== GitHub Repos Fetch ==========
// This fetches public repositories and displays the top ones by stargazers
async function fetchRepos(username, limit=6){
  try {
    const resp = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if(!resp.ok) throw new Error('GitHub API error');
    const data = await resp.json();
    // filter forks out and sort by stargazers + updated
    const repos = data.filter(r => !r.fork).sort((a,b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)));
    return repos.slice(0,limit);
  } catch (err) {
    console.warn('Could not fetch GitHub repos:', err);
    return [];
  }
}

function renderRepos(repos){
  const container = qs('#repos');
  if(!container) return;
  if(!repos.length){
    container.innerHTML = `<p class="muted">No public repos found or GitHub API blocked. Add some repos or check the username in script.js.</p>`;
    return;
  }
  container.innerHTML = repos.map(r => `
    <article class="project-card" aria-labelledby="repo-${r.id}">
      <h4 id="repo-${r.id}">${r.name}</h4>
      <p>${r.description ? (r.description.length>140? r.description.slice(0,137)+'...': r.description) : 'No description.'}</p>
      <div class="card-actions">
        <a class="btn" href="${r.html_url}" target="_blank" rel="noopener">View</a>
        ${r.homepage ? `<a class="btn" href="${r.homepage}" target="_blank" rel="noopener">Live</a>` : ''}
        <span class="muted">${r.stargazers_count} ★</span>
      </div>
    </article>
  `).join('');
}

// immediately fetch and render
fetchRepos(GITHUB_USERNAME, GITHUB_REPO_COUNT).then(renderRepos);
