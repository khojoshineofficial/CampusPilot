// Toast notifications
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

// Avatar initials
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

function avatarHtml(user, size = 44) {
  if (user?.profileImage)
    return `<img src="${user.profileImage}" alt="${user.fullname}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  const initials = getInitials(user?.fullname || '?');
  return `<div class="avatar-circle" style="width:${size}px;height:${size}px;font-size:${size * 0.35}px">${initials}</div>`;
}

// Role badge
function roleBadge(role) {
  const map = { admin: 'badge-red', lecturer: 'badge-blue', student: 'badge-green' };
  return `<span class="badge ${map[role] || 'badge-gray'}">${role}</span>`;
}

// Type badge
function typeBadge(type) {
  const colors = {
    scholarship: 'badge-green', internship: 'badge-blue', competition: 'badge-orange',
    seminar: 'badge-blue', workshop: 'badge-green', conference: 'badge-purple',
    general: 'badge-gray', announcement: 'badge-orange', urgent: 'badge-red',
  };
  return `<span class="badge ${colors[type] || 'badge-gray'}">${type}</span>`;
}

// Loading
function showLoading(el) {
  el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
}

// Modal helpers
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Theme
function initTheme() {
  const saved = localStorage.getItem('cp_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cp_theme', next);
}

// Sidebar
function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// Nav highlight
function initNav() {
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      showView(view);
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('open');
    });
  });
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(`view-${name}`);
  if (el) {
    el.classList.add('active');
    document.getElementById('headerTitle').textContent = el.dataset.title || name;
  }
}

// Logout
function logout() {
  localStorage.removeItem('cp_token');
  localStorage.removeItem('cp_user');
  window.location.href = '/';
}

// Auth guard
async function requireAuth(allowedRoles) {
  const token = localStorage.getItem('cp_token');
  if (!token) { window.location.href = '/'; return null; }
  try {
    const { user } = await api.getMe();
    localStorage.setItem('cp_user', JSON.stringify(user));
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = `/${user.role === 'admin' ? 'admin' : user.role === 'lecturer' ? 'lecturer' : 'student'}`;
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem('cp_token');
    window.location.href = '/';
    return null;
  }
}

// Paginator
function renderPagination(container, currentPage, totalPages, onPage) {
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '';
  const prev = currentPage > 1;
  const next = currentPage < totalPages;
  html += `<button class="page-btn" ${!prev ? 'disabled' : ''} onclick="(${onPage})(${currentPage - 1})">‹</button>`;
  for (let p = Math.max(1, currentPage - 2); p <= Math.min(totalPages, currentPage + 2); p++) {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="(${onPage})(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" ${!next ? 'disabled' : ''} onclick="(${onPage})(${currentPage + 1})">›</button>`;
  container.innerHTML = html;
}

window.showToast = showToast;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.timeAgo = timeAgo;
window.getInitials = getInitials;
window.avatarHtml = avatarHtml;
window.roleBadge = roleBadge;
window.typeBadge = typeBadge;
window.showLoading = showLoading;
window.openModal = openModal;
window.closeModal = closeModal;
window.initTheme = initTheme;
window.toggleTheme = toggleTheme;
window.initSidebar = initSidebar;
window.initNav = initNav;
window.showView = showView;
window.logout = logout;
window.requireAuth = requireAuth;
window.renderPagination = renderPagination;
