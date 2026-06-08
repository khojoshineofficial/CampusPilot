let currentUser = null;
let quizQuestions = [];

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  currentUser = await requireAuth(['lecturer']);
  if (!currentUser) return;

  document.getElementById('sidebarName').textContent = currentUser.fullname;
  document.getElementById('sidebarDept').textContent = currentUser.department || 'Lecturer';
  document.getElementById('sidebarAvatar').outerHTML = avatarHtml(currentUser, 38);
  document.getElementById('composerAvatar').outerHTML = avatarHtml(currentUser, 44);
  document.getElementById('welcomeMsg').textContent = `Hello, Dr. ${currentUser.fullname.split(' ').pop()}! 👋`;
  document.getElementById('pfFullname').value = currentUser.fullname;
  document.getElementById('pfDept').value = currentUser.department || '';

  initSidebar();
  initNav();
  loadOverview();
  loadNotifications();

  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const v = item.dataset.view;
      if (v === 'materials') loadMyMaterials();
      if (v === 'quizzes') loadMyQuizzes();
      if (v === 'announcements') loadAnnouncements();
      if (v === 'events') loadEvents();
      if (v === 'feed') loadFeed();
    });
  });

  // File name display
  document.getElementById('matFile').addEventListener('change', function() {
    document.getElementById('matFileName').textContent = this.files[0]?.name || '';
  });

  // Material form
  document.getElementById('materialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('matSubmitBtn');
    btn.disabled = true; btn.textContent = 'Uploading...';
    try {
      const fd = new FormData();
      fd.append('title', document.getElementById('matTitle').value);
      fd.append('type', document.getElementById('matType').value);
      fd.append('course', document.getElementById('matCourse').value);
      fd.append('department', document.getElementById('matDept').value);
      fd.append('level', document.getElementById('matLevel').value);
      fd.append('isPublished', 'true');
      const dueDate = document.getElementById('matDue').value;
      if (dueDate) fd.append('dueDate', dueDate);
      const link = document.getElementById('matLink').value;
      if (link) fd.append('externalLink', link);
      const file = document.getElementById('matFile').files[0];
      if (file) fd.append('file', file);
      await api.createMaterial(fd);
      showToast('Material uploaded successfully!', 'success');
      e.target.reset();
      document.getElementById('matFileName').textContent = '';
    } catch (err) { showToast(err.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Upload Material';
  });

  // Quiz form
  document.getElementById('quizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!quizQuestions.length) return showToast('Add at least one question', 'error');
    try {
      const body = {
        title: document.getElementById('qzTitle').value,
        course: document.getElementById('qzCourse').value,
        department: document.getElementById('qzDept').value,
        duration: +document.getElementById('qzDuration').value,
        description: document.getElementById('qzDesc').value,
        isPublished: document.getElementById('qzPublish').checked,
        questions: quizQuestions,
      };
      await api.createQuiz(body);
      showToast('Quiz created!', 'success');
      e.target.reset();
      quizQuestions = [];
      document.getElementById('questionsContainer').innerHTML = '';
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Announcement form
  document.getElementById('annForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', document.getElementById('annTitle').value);
      fd.append('content', document.getElementById('annContent').value);
      fd.append('targetRole', document.getElementById('annRole').value);
      fd.append('priority', document.getElementById('annPriority').value);
      await api.createAnnouncement(fd);
      showToast('Announcement posted!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Book form
  document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('bkSubmitBtn');
    btn.disabled = true; btn.textContent = 'Uploading...';
    try {
      const fd = new FormData();
      fd.append('title', document.getElementById('bkTitle').value);
      fd.append('author', document.getElementById('bkAuthor').value);
      fd.append('department', document.getElementById('bkDept').value);
      fd.append('course', document.getElementById('bkCourse').value);
      fd.append('level', document.getElementById('bkLevel').value);
      fd.append('description', document.getElementById('bkDesc').value);
      const file = document.getElementById('bkFile').files[0];
      const cover = document.getElementById('bkCover').files[0];
      if (file) fd.append('file', file);
      if (cover) fd.append('cover', cover);
      await api.createBook(fd);
      showToast('Book uploaded!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Upload Book';
  });

  // PQ form
  document.getElementById('pqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pqSubmitBtn');
    btn.disabled = true; btn.textContent = 'Uploading...';
    try {
      const fd = new FormData();
      fd.append('courseCode', document.getElementById('pqCode').value);
      fd.append('courseName', document.getElementById('pqName').value);
      fd.append('department', document.getElementById('pqDept').value);
      fd.append('level', document.getElementById('pqLevel').value);
      fd.append('year', document.getElementById('pqYear').value);
      fd.append('semester', document.getElementById('pqSem').value);
      const file = document.getElementById('pqFile').files[0];
      if (file) fd.append('file', file);
      await api.createPastQuestion(fd);
      showToast('Past question uploaded!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Upload Past Question';
  });

  // Profile forms
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('fullname', document.getElementById('pfFullname').value);
      fd.append('department', document.getElementById('pfDept').value);
      await api.request('PUT', '/auth/profile', fd, true);
      showToast('Profile updated!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  document.getElementById('pwdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.changePassword({ currentPassword: document.getElementById('currentPwd').value, newPassword: document.getElementById('newPwd').value });
      showToast('Password updated!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
  });
});

async function loadOverview() {
  try {
    const [matsData, quizzesData, annsData] = await Promise.all([
      api.getMyMaterials(),
      api.getMyQuizzes(),
      api.getAnnouncements(),
    ]);
    document.getElementById('statMats').textContent = matsData.materials?.length || 0;
    document.getElementById('statQuizzes').textContent = quizzesData.quizzes?.length || 0;
    document.getElementById('statAnns').textContent = annsData.announcements?.length || 0;

    const recentMats = (matsData.materials || []).slice(0, 5);
    document.getElementById('recentMats').innerHTML = recentMats.length
      ? recentMats.map(m => `<div class="list-item"><span style="font-size:1.3rem">${{slide:'📊',note:'📓',assignment:'📝',video:'🎬',audio:'🎵'}[m.type]||'📁'}</span><div><div style="font-weight:600;font-size:0.88rem">${escHtml(m.title)}</div><div style="font-size:0.75rem;color:#64748b">${escHtml(m.course)}</div></div></div>`).join('')
      : '<div class="empty-state"><p>No materials yet</p></div>';

    const recentQuizzes = (quizzesData.quizzes || []).slice(0, 5);
    document.getElementById('recentQuizzes').innerHTML = recentQuizzes.length
      ? recentQuizzes.map(q => `<div class="list-item"><span style="font-size:1.3rem">🧠</span><div><div style="font-weight:600;font-size:0.88rem">${escHtml(q.title)}</div><div style="font-size:0.75rem;color:#64748b">${q.questions?.length||0} questions · ${q.isPublished?'Published':'Draft'}</div></div></div>`).join('')
      : '<div class="empty-state"><p>No quizzes yet</p></div>';
  } catch {}
}

async function loadMyMaterials() {
  const container = document.getElementById('myMaterialsList');
  showLoading(container);
  try {
    const { materials } = await api.getMyMaterials();
    if (!materials.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🗂️</div><h3>No materials uploaded yet</h3></div>`;
      return;
    }
    const icons = { slide:'📊', note:'📓', assignment:'📝', video:'🎬', audio:'🎵', link:'🔗' };
    container.innerHTML = materials.map(m => `
      <div class="resource-card">
        <div class="resource-card-cover" style="background:linear-gradient(135deg,#7c3aed,#2563EB)">${icons[m.type]||'📁'}</div>
        <div class="resource-card-body">
          <div class="resource-card-title">${escHtml(m.title)}</div>
          <div class="resource-card-meta">${escHtml(m.course)} · ${typeBadge(m.type)}</div>
          <div class="resource-card-meta">⬇️ ${m.downloads||0} · 👁️ ${m.views||0}</div>
          <div class="resource-card-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${m._id}', this)">🗑️ Delete</button>
          </div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteMaterial(id, btn) {
  if (!confirm('Delete this material?')) return;
  try {
    await api.deleteMaterial(id);
    btn.closest('.resource-card').remove();
    showToast('Deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadMyQuizzes() {
  const container = document.getElementById('myQuizzesList');
  showLoading(container);
  try {
    const { quizzes } = await api.getMyQuizzes();
    if (!quizzes.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🧠</div><h3>No quizzes yet</h3></div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Title</th><th>Course</th><th>Questions</th><th>Duration</th><th>Status</th><th>Attempts</th><th>Action</th></tr></thead>
      <tbody>${quizzes.map(q => `
        <tr>
          <td><strong>${escHtml(q.title)}</strong></td>
          <td>${escHtml(q.course)}</td>
          <td>${q.questions?.length||0}</td>
          <td>${q.duration} mins</td>
          <td>${q.isPublished ? '<span class="badge badge-green">Published</span>' : '<span class="badge badge-gray">Draft</span>'}</td>
          <td>${q.attempts?.length||0}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteQuiz('${q._id}',this)">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table></div>`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteQuiz(id, btn) {
  if (!confirm('Delete this quiz?')) return;
  try {
    await api.deleteQuiz(id);
    btn.closest('tr').remove();
    showToast('Quiz deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// Quiz question builder
let questionCount = 0;

function addQuestion() {
  questionCount++;
  const idx = quizQuestions.length;
  quizQuestions.push({ question: '', options: ['', '', '', ''], answer: 0, points: 1 });
  const div = document.createElement('div');
  div.id = `question-${idx}`;
  div.style.cssText = 'background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px';
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <strong>Question ${idx + 1}</strong>
      <button type="button" class="btn btn-ghost btn-sm" onclick="removeQuestion(${idx})">✕</button>
    </div>
    <div class="form-group">
      <label>Question Text *</label>
      <input type="text" class="form-control" placeholder="Enter question..." oninput="updateQuestion(${idx},'question',this.value)" required>
    </div>
    <div style="margin-bottom:8px;font-size:0.82rem;font-weight:600;color:#64748b">Options (mark correct answer)</div>
    ${[0,1,2,3].map(i => `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <input type="radio" name="answer-${idx}" value="${i}" onchange="updateQuestion(${idx},'answer',${i})" ${i===0?'checked':''}>
        <input type="text" class="form-control" placeholder="Option ${String.fromCharCode(65+i)}" oninput="updateQuestionOption(${idx},${i},this.value)">
      </div>`).join('')}
    <div class="form-group" style="margin-top:8px">
      <label>Points</label>
      <input type="number" class="form-control" value="1" min="1" style="max-width:80px" oninput="updateQuestion(${idx},'points',+this.value)">
    </div>`;
  document.getElementById('questionsContainer').appendChild(div);
}

function removeQuestion(idx) {
  quizQuestions.splice(idx, 1);
  document.getElementById(`question-${idx}`)?.remove();
}

function updateQuestion(idx, field, val) { if (quizQuestions[idx]) quizQuestions[idx][field] = val; }
function updateQuestionOption(idx, optIdx, val) { if (quizQuestions[idx]) quizQuestions[idx].options[optIdx] = val; }

function switchLibTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('lib-tab-book').style.display = tab === 'book' ? '' : 'none';
  document.getElementById('lib-tab-pq').style.display = tab === 'pq' ? '' : 'none';
}

async function loadAnnouncements() {
  const container = document.getElementById('annList');
  showLoading(container);
  try {
    const { announcements } = await api.getAnnouncements();
    if (!announcements.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📢</div><h3>No announcements yet</h3></div>`;
      return;
    }
    container.innerHTML = announcements.map(ann => `
      <div class="ann-card ${ann.isPinned ? 'pinned' : ''} ${ann.priority === 'urgent' ? 'urgent' : ''}">
        <div style="font-size:1.8rem">${ann.priority === 'urgent' ? '🚨' : ann.isPinned ? '📌' : '📢'}</div>
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:4px">${escHtml(ann.title)}</div>
          <div style="font-size:0.85rem;color:#64748b;margin-bottom:8px">${escHtml(ann.content)}</div>
          <div style="font-size:0.75rem;color:#94a3b8">${formatDate(ann.createdAt)} · ${ann.createdBy?.fullname||''}</div>
        </div>
        <span class="ann-priority badge ${ann.priority==='urgent'?'badge-red':ann.priority==='high'?'badge-orange':'badge-gray'}">${ann.priority}</span>
      </div>`).join('');
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}

async function loadEvents() {
  const container = document.getElementById('eventList');
  showLoading(container);
  try {
    const { events } = await api.getEvents('?limit=12');
    if (!events.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🗓️</div><h3>No events</h3></div>`;
      return;
    }
    container.innerHTML = events.map(ev => `
      <div class="event-card">
        <div class="event-banner">
          ${ev.bannerImage ? `<img src="${ev.bannerImage}" alt="">` : '🎉'}
          <div class="event-date-chip">${formatDate(ev.date)}</div>
        </div>
        <div class="event-body">
          <div class="event-title">${escHtml(ev.title)}</div>
          <div class="event-meta"><span>🕐 ${ev.time}</span><span>📍 ${escHtml(ev.venue)}</span></div>
          <div style="font-size:0.82rem;color:#64748b;margin-bottom:10px">${escHtml(ev.description).slice(0,100)}...</div>
          <div style="font-size:0.78rem;color:#64748b">👥 ${ev.registrations?.length||0} registered</div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadFeed() {
  const container = document.getElementById('feedList');
  showLoading(container);
  try {
    const { posts } = await api.getPosts('?limit=15');
    if (!posts.length) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>No posts yet</h3></div>`; return; }
    container.innerHTML = posts.map(post => `
      <div class="post-card">
        <div class="post-header">
          ${avatarHtml(post.user, 44)}
          <div class="post-author"><strong>${post.user?.fullname||'User'}</strong><span>${post.user?.role||''} · ${timeAgo(post.createdAt)}</span></div>
          ${typeBadge(post.type)}
        </div>
        <div class="post-content">${escHtml(post.content)}</div>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image">` : ''}
        <div class="post-actions">
          <button class="post-action-btn">❤️ ${post.likes?.length||0}</button>
          <button class="post-action-btn">💬 ${post.comments?.length||0}</button>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function submitPost() {
  const content = document.getElementById('postContent').value.trim();
  if (!content) return showToast('Write something first!', 'info');
  const fd = new FormData();
  fd.append('content', content);
  fd.append('type', 'announcement');
  try {
    await api.createPost(fd);
    document.getElementById('postContent').value = '';
    showToast('Post shared!', 'success');
    loadFeed();
  } catch (err) { showToast(err.message, 'error'); }
}

// Notifications
let notifData = [];
async function loadNotifications() {
  try {
    const { notifications } = await api.getNotifications();
    notifData = notifications;
    const unread = notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notifBadge');
    const hBadge = document.getElementById('notifHeaderBadge');
    if (unread > 0) { badge.textContent = unread; badge.style.display='inline-flex'; hBadge.textContent=unread; hBadge.style.display='flex'; }
    else { badge.style.display='none'; hBadge.style.display='none'; }
    const list = document.getElementById('notifList');
    const panelList = document.getElementById('notifPanelList');
    const html = notifications.map(n => `
      <div class="notif-item ${n.isRead?'':'unread'}" onclick="markRead('${n._id}',this)">
        <div class="notif-icon">${n.icon||'🔔'}</div>
        <div class="notif-body"><strong>${escHtml(n.title)}</strong><p>${escHtml(n.content)}</p><span class="notif-time">${timeAgo(n.createdAt)}</span></div>
      </div>`).join('') || '<div class="empty-state"><p>No notifications</p></div>';
    if (list) list.innerHTML = html;
    if (panelList) panelList.innerHTML = html;
  } catch {}
}

async function markRead(id, el) {
  try { await api.markRead(id); el.classList.remove('unread'); loadNotifications(); } catch {}
}

async function markAllNotifRead() {
  try { await api.markAllRead(); loadNotifications(); showToast('All marked as read', 'success'); } catch {}
}
