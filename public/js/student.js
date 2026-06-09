let currentUser = null;
let feedPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  currentUser = await requireAuth(['student']);
  if (!currentUser) return;

  // Populate sidebar
  document.getElementById('sidebarName').textContent = currentUser.fullname;
  document.getElementById('sidebarDept').textContent = `${currentUser.department || ''} · Level ${currentUser.level || ''}`;
  document.getElementById('sidebarAvatar').outerHTML = avatarHtml(currentUser, 38);
  document.getElementById('composerAvatar').outerHTML = avatarHtml(currentUser, 44);

  document.getElementById('welcomeMsg').textContent = `Welcome, ${currentUser.fullname.split(' ')[0]}! 👋`;
  document.getElementById('welcomeSub').textContent = `${currentUser.department || 'Campus'} · Level ${currentUser.level || ''}`;

  // Profile form prefill
  document.getElementById('pfFullname').value = currentUser.fullname;
  document.getElementById('pfPhone').value = currentUser.phone || '';
  document.getElementById('pfDept').value = currentUser.department || '';
  document.getElementById('pfLevel').value = currentUser.level || '';
  document.getElementById('profileName').textContent = currentUser.fullname;
  document.getElementById('profileRole').innerHTML = roleBadge(currentUser.role);
  document.getElementById('profileAvatarLarge').outerHTML = `<div id="profileAvatarLarge" style="width:80px;height:80px;margin:0 auto 12px;">${avatarHtml(currentUser, 80)}</div>`;

  initSidebar();
  initNav();
  loadFeed();
  loadNotifications();
  loadAnnouncements();

  // View-specific loaders
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const v = item.dataset.view;
      if (v === 'books') loadBooks();
      if (v === 'pastquestions') loadPastQuestions();
      if (v === 'materials') loadMaterials();
      if (v === 'events') loadEvents();
      if (v === 'opportunities') loadOpportunities();
      if (v === 'quiz') loadQuizzes();
    });
  });

  // Profile form
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('fullname', document.getElementById('pfFullname').value);
      fd.append('phone', document.getElementById('pfPhone').value.trim());
      fd.append('department', document.getElementById('pfDept').value);
      fd.append('level', document.getElementById('pfLevel').value);
      await api.request('PUT', '/auth/profile', fd, true);
      showToast('Profile updated!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  document.getElementById('pwdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.changePassword({
        currentPassword: document.getElementById('currentPwd').value,
        newPassword: document.getElementById('newPwd').value,
      });
      showToast('Password updated!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
  });
});

// ─── FEED ───
async function loadFeed(page = 1) {
  feedPage = page;
  const container = document.getElementById('feedList');
  showLoading(container);
  try {
    const { posts, total, pages } = await api.getPosts(`?page=${page}&limit=10`);
    if (!posts.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>No posts yet</h3><p>Be the first to share something!</p></div>`;
      return;
    }
    container.innerHTML = posts.map(postCardHtml).join('');
    renderPagination(document.getElementById('feedPagination'), page, pages, loadFeed);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p style="color:red">${err.message}</p></div>`;
  }
}

function postCardHtml(post) {
  const liked = post.likes?.includes(currentUser?.id);
  const saved = post.saved?.includes(currentUser?.id);
  return `
  <div class="post-card" id="post-${post._id}">
    <div class="post-header">
      ${avatarHtml(post.user, 44)}
      <div class="post-author">
        <strong>${post.user?.fullname || 'Unknown'}</strong>
        <span>${post.user?.role || ''} · ${timeAgo(post.createdAt)}</span>
      </div>
      ${typeBadge(post.type)}
    </div>
    <div class="post-content">${escHtml(post.content)}</div>
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="post image">` : ''}
    <div class="post-actions">
      <button class="post-action-btn ${liked ? 'liked' : ''}" onclick="toggleLike('${post._id}', this)">
        ❤️ ${post.likes?.length || 0}
      </button>
      <button class="post-action-btn" onclick="toggleComments('${post._id}')">
        💬 ${post.comments?.length || 0}
      </button>
      <button class="post-action-btn ${saved ? 'saved' : ''}" onclick="toggleSave('${post._id}', this)">
        🔖 ${saved ? 'Saved' : 'Save'}
      </button>
    </div>
    <div class="comment-section" id="comments-${post._id}" style="display:none">
      <div class="comment-input-row">
        <textarea class="comment-input" id="ci-${post._id}" placeholder="Write a comment..."></textarea>
        <button class="btn btn-primary btn-sm" onclick="sendComment('${post._id}')">Send</button>
      </div>
      <div id="clist-${post._id}">
        ${(post.comments || []).map(commentHtml).join('')}
      </div>
    </div>
  </div>`;
}

function commentHtml(c) {
  return `<div class="comment-item">
    ${avatarHtml(c.user, 32)}
    <div class="comment-bubble">
      <strong>${c.user?.fullname || 'User'}</strong>
      <p>${escHtml(c.content)}</p>
    </div>
  </div>`;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleComments(postId) {
  const el = document.getElementById(`comments-${postId}`);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

async function toggleLike(postId, btn) {
  try {
    const { liked, count } = await api.likePost(postId);
    btn.className = `post-action-btn ${liked ? 'liked' : ''}`;
    btn.innerHTML = `❤️ ${count}`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function toggleSave(postId, btn) {
  try {
    const { saved } = await api.savePost(postId);
    btn.className = `post-action-btn ${saved ? 'saved' : ''}`;
    btn.innerHTML = `🔖 ${saved ? 'Saved' : 'Save'}`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function sendComment(postId) {
  const input = document.getElementById(`ci-${postId}`);
  const content = input.value.trim();
  if (!content) return;
  try {
    const { comments } = await api.addComment(postId, content);
    document.getElementById(`clist-${postId}`).innerHTML = comments.map(commentHtml).join('');
    input.value = '';
  } catch (err) { showToast(err.message, 'error'); }
}

async function submitPost() {
  const content = document.getElementById('postContent').value.trim();
  if (!content) return showToast('Write something first!', 'info');
  const fd = new FormData();
  fd.append('content', content);
  fd.append('type', document.getElementById('postType').value);
  const imgFile = document.getElementById('postImage').files[0];
  if (imgFile) fd.append('image', imgFile);
  try {
    await api.createPost(fd);
    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
    showToast('Post shared!', 'success');
    loadFeed();
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── ANNOUNCEMENTS ───
async function loadAnnouncements() {
  const container = document.getElementById('annList');
  showLoading(container);
  try {
    const { announcements } = await api.getAnnouncements(`?role=student`);
    if (!announcements.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📢</div><h3>No announcements</h3></div>`;
      return;
    }
    container.innerHTML = announcements.map(ann => `
      <div class="ann-card ${ann.isPinned ? 'pinned' : ''} ${ann.priority === 'urgent' ? 'urgent' : ''}">
        <div style="font-size:1.8rem">${ann.priority === 'urgent' ? '🚨' : ann.isPinned ? '📌' : '📢'}</div>
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:4px">${escHtml(ann.title)}</div>
          <div style="font-size:0.85rem;color:#64748b;margin-bottom:8px">${escHtml(ann.content)}</div>
          <div style="font-size:0.75rem;color:#94a3b8">${formatDate(ann.createdAt)} · ${ann.createdBy?.fullname || ''}</div>
        </div>
        <span class="ann-priority badge ${ann.priority === 'urgent' ? 'badge-red' : ann.priority === 'high' ? 'badge-orange' : 'badge-gray'}">${ann.priority}</span>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

// ─── NOTIFICATIONS ───
let notifData = [];

async function loadNotifications() {
  try {
    const { notifications } = await api.getNotifications();
    notifData = notifications;
    const unread = notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notifBadge');
    const headerBadge = document.getElementById('notifHeaderBadge');
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-flex';
      headerBadge.textContent = unread;
      headerBadge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
      headerBadge.style.display = 'none';
    }
    renderNotifList(document.getElementById('notifList'));
    renderNotifList(document.getElementById('notifPanelList'));
  } catch {}
}

function renderNotifList(container) {
  if (!container) return;
  if (!notifData.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><h3>No notifications</h3></div>`;
    return;
  }
  container.innerHTML = notifData.map(n => `
    <div class="notif-item ${n.isRead ? '' : 'unread'}" onclick="markNotifRead('${n._id}', this)">
      <div class="notif-icon">${n.icon || '🔔'}</div>
      <div class="notif-body">
        <strong>${escHtml(n.title)}</strong>
        <p>${escHtml(n.content)}</p>
        <span class="notif-time">${timeAgo(n.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

async function markNotifRead(id, el) {
  try {
    await api.markRead(id);
    el.classList.remove('unread');
    loadNotifications();
  } catch {}
}

async function markAllNotifRead() {
  try {
    await api.markAllRead();
    loadNotifications();
    showToast('All notifications marked as read', 'success');
  } catch {}
}

function toggleNotifPanel() {
  document.getElementById('notifPanel').classList.toggle('open');
}

// ─── BOOKS ───
async function loadBooks(page = 1) {
  const container = document.getElementById('bookList');
  showLoading(container);
  const search = document.getElementById('bookSearch').value;
  const dept = document.getElementById('bookDept').value;
  const level = document.getElementById('bookLevel').value;
  let q = `?page=${page}&limit=12`;
  if (search) q += `&search=${encodeURIComponent(search)}`;
  if (dept) q += `&department=${encodeURIComponent(dept)}`;
  if (level) q += `&level=${level}`;
  try {
    const { books, pages } = await api.getBooks(q);
    if (!books.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📚</div><h3>No books found</h3></div>`;
      return;
    }
    container.innerHTML = books.map(bookCardHtml).join('');
    renderPagination(document.getElementById('bookPagination'), page, pages, loadBooks);
  } catch (err) { showToast(err.message, 'error'); }
}

function bookCardHtml(book) {
  return `
  <div class="resource-card">
    <div class="resource-card-cover">
      ${book.coverImage ? `<img src="${book.coverImage}" alt="${book.title}">` : '📖'}
    </div>
    <div class="resource-card-body">
      <div class="resource-card-title">${escHtml(book.title)}</div>
      <div class="resource-card-meta">${escHtml(book.author || '')} · ${escHtml(book.department || '')}</div>
      <div class="resource-card-actions">
        <button class="btn btn-primary btn-sm" onclick="downloadBook('${book._id}', '${escHtml(book.fileUrl || '')}')">⬇️ Download</button>
        <button class="btn btn-outline btn-sm" onclick="api.bookmarkBook('${book._id}').then(()=>showToast('Bookmarked!','success')).catch(e=>showToast(e.message,'error'))">🔖</button>
      </div>
    </div>
  </div>`;
}

async function downloadBook(id, fileUrl) {
  try {
    const { fileUrl: url } = await api.downloadBook(id);
    window.open(url || fileUrl, '_blank');
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── PAST QUESTIONS ───
async function loadPastQuestions(page = 1) {
  const container = document.getElementById('pqList');
  showLoading(container);
  const search = document.getElementById('pqSearch').value;
  const dept = document.getElementById('pqDept').value;
  const level = document.getElementById('pqLevel').value;
  const year = document.getElementById('pqYear').value;
  let q = `?page=${page}&limit=15`;
  if (search) q += `&search=${encodeURIComponent(search)}`;
  if (dept) q += `&department=${encodeURIComponent(dept)}`;
  if (level) q += `&level=${level}`;
  if (year) q += `&year=${year}`;
  try {
    const { pastQuestions, pages } = await api.getPastQuestions(q);
    if (!pastQuestions.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📄</div><h3>No past questions found</h3></div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Course</th><th>Code</th><th>Year</th><th>Level</th><th>Semester</th><th>Action</th></tr></thead>
      <tbody>${pastQuestions.map(pq => `
        <tr>
          <td><strong>${escHtml(pq.courseName)}</strong></td>
          <td>${escHtml(pq.courseCode)}</td>
          <td>${pq.year}</td>
          <td>Level ${pq.level}</td>
          <td>${pq.semester}</td>
          <td><button class="btn btn-primary btn-sm" onclick="downloadPQ('${pq._id}','${pq.fileUrl}')">⬇️ Download</button></td>
        </tr>`).join('')}
      </tbody></table></div>`;
    renderPagination(document.getElementById('pqPagination'), page, pages, loadPastQuestions);
  } catch (err) { showToast(err.message, 'error'); }
}

async function downloadPQ(id, fileUrl) {
  try {
    const { fileUrl: url } = await api.downloadPQ(id);
    window.open(url || fileUrl, '_blank');
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── MATERIALS ───
async function loadMaterials() {
  const container = document.getElementById('matList');
  showLoading(container);
  const search = document.getElementById('matSearch').value;
  const type = document.getElementById('matType').value;
  let q = '?limit=20';
  if (search) q += `&search=${encodeURIComponent(search)}`;
  if (type) q += `&type=${type}`;
  try {
    const { materials } = await api.getMaterials(q);
    if (!materials.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🗂️</div><h3>No materials found</h3></div>`;
      return;
    }
    const typeIcon = { slide: '📊', note: '📓', assignment: '📝', video: '🎬', audio: '🎵', link: '🔗', quiz_resource: '🧠' };
    container.innerHTML = materials.map(m => `
      <div class="resource-card">
        <div class="resource-card-cover" style="background:linear-gradient(135deg,#2563EB,#0891b2)">
          ${typeIcon[m.type] || '📁'}
        </div>
        <div class="resource-card-body">
          <div class="resource-card-title">${escHtml(m.title)}</div>
          <div class="resource-card-meta">${escHtml(m.course || '')} · ${typeBadge(m.type)}</div>
          <div class="resource-card-meta" style="margin-top:4px">${m.uploadedBy?.fullname || ''}</div>
          <div class="resource-card-actions">
            ${m.externalLink ? `<a href="${m.externalLink}" target="_blank" class="btn btn-outline btn-sm">🔗 View</a>` :
              m.fileUrl ? `<button class="btn btn-primary btn-sm" onclick="api.downloadMaterial('${m._id}').then(r=>window.open(r.fileUrl||'${m.fileUrl}','_blank')).catch(e=>showToast(e.message,'error'))">⬇️ Download</button>` : ''}
          </div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── EVENTS ───
async function loadEvents() {
  const container = document.getElementById('eventList');
  showLoading(container);
  const cat = document.getElementById('eventCat').value;
  let q = '?limit=12';
  if (cat) q += `&category=${cat}`;
  try {
    const { events } = await api.getEvents(q);
    if (!events.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🗓️</div><h3>No events found</h3></div>`;
      return;
    }
    container.innerHTML = events.map(ev => `
      <div class="event-card">
        <div class="event-banner">
          ${ev.bannerImage ? `<img src="${ev.bannerImage}" alt="${ev.title}">` : '🎉'}
          <div class="event-date-chip">${formatDate(ev.date)}</div>
        </div>
        <div class="event-body">
          <div class="event-title">${escHtml(ev.title)}</div>
          <div class="event-meta">
            <span>🕐 ${ev.time}</span>
            <span>📍 ${escHtml(ev.venue)}</span>
            <span>${typeBadge(ev.category)}</span>
          </div>
          <div style="font-size:0.82rem;color:#64748b;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escHtml(ev.description)}</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="registerEvent('${ev._id}', this)">✅ Register</button>
            ${ev.registrationLink ? `<a href="${ev.registrationLink}" target="_blank" class="btn btn-outline btn-sm">🔗 Details</a>` : ''}
          </div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function registerEvent(id, btn) {
  try {
    const { registered } = await api.registerEvent(id);
    btn.textContent = registered ? '✅ Registered' : '✅ Register';
    showToast(registered ? 'Registered for event!' : 'Registration removed', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── OPPORTUNITIES ───
async function loadOpportunities() {
  const container = document.getElementById('oppList');
  showLoading(container);
  const type = document.getElementById('oppType').value;
  let q = '?limit=12';
  if (type) q += `&type=${type}`;
  try {
    const { opportunities } = await api.getOpportunities(q);
    if (!opportunities.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🌟</div><h3>No opportunities found</h3></div>`;
      return;
    }
    container.innerHTML = opportunities.map(opp => `
      <div class="opp-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
          ${typeBadge(opp.type)}
          ${opp.isRemote ? `<span class="badge badge-green">🌐 Remote</span>` : ''}
        </div>
        <div class="opp-org">${escHtml(opp.organization)}</div>
        <div class="opp-title">${escHtml(opp.title)}</div>
        <div class="opp-desc">${escHtml(opp.description)}</div>
        <div class="opp-footer">
          ${opp.deadline ? `<span class="opp-deadline">⏰ ${formatDate(opp.deadline)}</span>` : '<span></span>'}
          <div style="display:flex;gap:6px">
            ${opp.link ? `<a href="${opp.link}" target="_blank" class="btn btn-primary btn-sm">Apply</a>` : ''}
            <button class="btn btn-outline btn-sm" onclick="api.saveOpportunity('${opp._id}').then(()=>showToast('Saved!','success')).catch(e=>showToast(e.message,'error'))">🔖</button>
          </div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── QUIZ ───
async function loadQuizzes() {
  const container = document.getElementById('quizList');
  showLoading(container);
  try {
    const { quizzes } = await api.getQuizzes();
    document.getElementById('quizListView').style.display = '';
    document.getElementById('quizTakeView').style.display = 'none';
    if (!quizzes.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🧠</div><h3>No quizzes available</h3></div>`;
      return;
    }
    container.innerHTML = quizzes.map(q => `
      <div class="card">
        <div class="card-body">
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:6px">${escHtml(q.title)}</div>
          <div style="font-size:0.82rem;color:#64748b;margin-bottom:4px">${escHtml(q.course)} · ${q.department}</div>
          <div style="font-size:0.82rem;color:#64748b;margin-bottom:12px">⏱️ ${q.duration} mins · ${q.questions?.length || 0} questions</div>
          <button class="btn btn-primary btn-sm btn-block" onclick="startQuiz('${q._id}')">Start Quiz</button>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

let quizState = { id: null, questions: [], current: 0, answers: [], startTime: null };

async function startQuiz(id) {
  try {
    const { quiz } = await api.getQuiz(id);
    quizState = { id: quiz._id, questions: quiz.questions, current: 0, answers: new Array(quiz.questions.length).fill(null), startTime: Date.now() };
    document.getElementById('quizListView').style.display = 'none';
    document.getElementById('quizTakeView').style.display = '';
    renderQuizQuestion();
  } catch (err) { showToast(err.message, 'error'); }
}

function renderQuizQuestion() {
  const { questions, current, answers } = quizState;
  const total = questions.length;
  const q = questions[current];
  const progress = ((current) / total) * 100;
  document.getElementById('quizTakeContent').innerHTML = `
    <div style="max-width:640px;margin:0 auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <h3>Question ${current + 1} / ${total}</h3>
        <button class="btn btn-ghost btn-sm" onclick="loadQuizzes()">✕ Exit</button>
      </div>
      <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${progress}%"></div></div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-body">
          <p style="font-size:1rem;font-weight:600;margin-bottom:16px">${escHtml(q.question)}</p>
          ${(q.options || []).map((opt, i) => `
            <div class="quiz-option ${answers[current] === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
              <span style="width:26px;height:26px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0">${String.fromCharCode(65+i)}</span>
              ${escHtml(opt)}
            </div>`).join('')}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between">
        <button class="btn btn-outline btn-sm" onclick="prevQuestion()" ${current === 0 ? 'disabled' : ''}>‹ Previous</button>
        ${current < total - 1
          ? `<button class="btn btn-primary btn-sm" onclick="nextQuestion()">Next ›</button>`
          : `<button class="btn btn-accent btn-sm" onclick="submitQuiz()">Submit Quiz ✓</button>`}
      </div>
    </div>`;
}

function selectAnswer(i) {
  quizState.answers[quizState.current] = i;
  renderQuizQuestion();
}

function nextQuestion() { if (quizState.current < quizState.questions.length - 1) { quizState.current++; renderQuizQuestion(); } }
function prevQuestion() { if (quizState.current > 0) { quizState.current--; renderQuizQuestion(); } }

async function submitQuiz() {
  const unanswered = quizState.answers.filter(a => a === null).length;
  if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
  try {
    const { score, total, percentage } = await api.submitQuiz(quizState.id, quizState.answers);
    document.getElementById('quizTakeContent').innerHTML = `
      <div style="max-width:480px;margin:0 auto;text-align:center;padding:40px 20px">
        <div style="font-size:4rem;margin-bottom:16px">${percentage >= 50 ? '🎉' : '😔'}</div>
        <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:8px">Quiz Complete!</h2>
        <div style="font-size:3rem;font-weight:900;color:var(--primary);margin-bottom:8px">${percentage}%</div>
        <p style="color:#64748b;margin-bottom:24px">You scored ${score} out of ${total} points</p>
        <button class="btn btn-primary" onclick="loadQuizzes()">Back to Quizzes</button>
      </div>`;
  } catch (err) { showToast(err.message, 'error'); }
}
