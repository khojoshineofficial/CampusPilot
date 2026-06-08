let currentUser = null;
let notifData = [];
let currentOppTab = 'approved';

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  currentUser = await requireAuth(['admin']);
  if (!currentUser) return;

  document.getElementById('sidebarName').textContent = currentUser.fullname;
  document.getElementById('sidebarAvatar').outerHTML = avatarHtml(currentUser, 38);
  document.getElementById('welcomeMsg').textContent = `Welcome, ${currentUser.fullname.split(' ')[0]}! 🛡️`;

  initSidebar();
  initNav();
  loadOverview();
  loadNotifications();

  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const v = item.dataset.view;
      if (v === 'users') loadUsers();
      if (v === 'students') loadUsersByRole('student');
      if (v === 'lecturers') loadUsersByRole('lecturer');
      if (v === 'announcements') loadAnnouncements();
      if (v === 'events') loadEvents();
      if (v === 'opportunities') loadOpportunities('approved');
      if (v === 'library') loadLibrary();
      if (v === 'posts') loadPosts();
    });
  });

  // Search users
  document.getElementById('globalSearch').addEventListener('input', function() {
    document.getElementById('userSearch').value = this.value;
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
      fd.append('isPinned', document.getElementById('annPin').value);
      const expiry = document.getElementById('annExpiry').value;
      if (expiry) fd.append('expiresAt', expiry);
      await api.createAnnouncement(fd);
      showToast('Announcement posted!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Event form
  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('evSubmitBtn');
    btn.disabled = true; btn.textContent = 'Creating...';
    try {
      const fd = new FormData();
      fd.append('title', document.getElementById('evTitle').value);
      fd.append('description', document.getElementById('evDesc').value);
      fd.append('category', document.getElementById('evCat').value);
      fd.append('organizer', document.getElementById('evOrg').value);
      fd.append('date', document.getElementById('evDate').value);
      fd.append('time', document.getElementById('evTime').value);
      fd.append('venue', document.getElementById('evVenue').value);
      fd.append('targetDepartment', document.getElementById('evDept').value);
      const regLink = document.getElementById('evRegLink').value;
      if (regLink) fd.append('registrationLink', regLink);
      const banner = document.getElementById('evBanner').files[0];
      if (banner) fd.append('bannerImage', banner);
      await api.createEvent(fd);
      showToast('Event created!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Create Event';
  });

  // Opportunity form
  document.getElementById('oppForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', document.getElementById('opTitle').value);
      fd.append('description', document.getElementById('opDesc').value);
      fd.append('type', document.getElementById('opType').value);
      fd.append('organization', document.getElementById('opOrg').value);
      fd.append('location', document.getElementById('opLoc').value);
      fd.append('link', document.getElementById('opLink').value);
      fd.append('eligibility', document.getElementById('opElig').value);
      fd.append('benefits', document.getElementById('opBenefits').value);
      fd.append('isRemote', document.getElementById('opRemote').checked);
      const deadline = document.getElementById('opDeadline').value;
      if (deadline) fd.append('deadline', deadline);
      await api.createOpportunity(fd);
      showToast('Opportunity added!', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Notification form
  document.getElementById('notifForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.createNotification({
        title: document.getElementById('ntTitle').value,
        content: document.getElementById('ntContent').value,
        recipientRole: document.getElementById('ntRole').value,
        type: document.getElementById('ntType').value,
        icon: document.getElementById('ntIcon').value,
        link: document.getElementById('ntLink').value,
      });
      showToast('Notification sent!', 'success');
      e.target.reset();
      document.getElementById('ntIcon').value = '🔔';
    } catch (err) { showToast(err.message, 'error'); }
  });
});

async function loadOverview() {
  try {
    const { stats, recentUsers, deptStats } = await api.getStats();
    document.getElementById('statUsers').textContent = stats.users;
    document.getElementById('statStudents').textContent = stats.students;
    document.getElementById('statLecturers').textContent = stats.lecturers;
    document.getElementById('statBooks').textContent = stats.books;
    document.getElementById('statEvents').textContent = stats.events;
    document.getElementById('statOpps').textContent = stats.opportunities;
    document.getElementById('statPosts').textContent = stats.posts;
    document.getElementById('statQuizzes').textContent = stats.quizzes;

    document.getElementById('recentUsers').innerHTML = (recentUsers || []).map(u => `
      <div class="list-item">
        ${avatarHtml(u, 36)}
        <div style="flex:1">
          <div style="font-weight:600;font-size:0.88rem">${escHtml(u.fullname)}</div>
          <div style="font-size:0.75rem;color:#64748b">${escHtml(u.email)}</div>
        </div>
        ${roleBadge(u.role)}
      </div>`).join('') || '<div class="empty-state"><p>No users</p></div>';

    document.getElementById('deptStats').innerHTML = (deptStats || []).map(d => `
      <div class="list-item">
        <div style="flex:1;font-weight:600;font-size:0.88rem">${escHtml(d._id || 'No Department')}</div>
        <span class="badge badge-blue">${d.count}</span>
      </div>`).join('') || '<div class="empty-state"><p>No data</p></div>';
  } catch (err) { showToast('Failed to load stats: ' + err.message, 'error'); }
}

function userTableHtml(users) {
  if (!users.length) return '<div class="empty-state" style="padding:40px"><div class="empty-icon">👥</div><h3>No users found</h3></div>';
  return `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
  <tbody>${users.map(u => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px">${avatarHtml(u,32)}<span style="font-weight:600">${escHtml(u.fullname)}</span></div></td>
      <td>${escHtml(u.email)}</td>
      <td>${roleBadge(u.role)}</td>
      <td>${escHtml(u.department||'-')}</td>
      <td>${u.isSuspended ? '<span class="badge badge-red">Suspended</span>' : u.isApproved ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-orange">Pending</span>'}</td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <div style="display:flex;gap:4px">
          ${!u.isApproved ? `<button class="btn btn-sm" style="background:#dcfce7;color:#16a34a" onclick="approveUser('${u._id}',this)">✓ Approve</button>` : ''}
          ${u.isSuspended
            ? `<button class="btn btn-sm btn-outline" onclick="unsuspendUser('${u._id}',this)">Unsuspend</button>`
            : `<button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" onclick="suspendUser('${u._id}',this)">Suspend</button>`}
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}',this)">🗑️</button>
        </div>
      </td>
    </tr>`).join('')}
  </tbody></table>`;
}

async function loadUsers(page = 1) {
  const container = document.getElementById('usersTable');
  showLoading(container);
  const search = document.getElementById('userSearch').value;
  const role = document.getElementById('userRoleFilter').value;
  let q = `?page=${page}&limit=20`;
  if (search) q += `&search=${encodeURIComponent(search)}`;
  if (role) q += `&role=${role}`;
  try {
    const { users, total, pages } = await api.getUsers(q);
    container.innerHTML = userTableHtml(users);
    renderPagination(document.getElementById('usersPagination'), page, pages, loadUsers);
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadUsersByRole(role) {
  const tableId = role === 'student' ? 'studentsTable' : 'lecturersTable';
  const container = document.getElementById(tableId);
  showLoading(container);
  try {
    const { users } = await api.getUsers(`?role=${role}&limit=50`);
    container.innerHTML = userTableHtml(users);
  } catch (err) { showToast(err.message, 'error'); }
}

async function approveUser(id, btn) {
  try {
    await api.approveUser(id);
    btn.closest('tr').querySelector('td:nth-child(5)').innerHTML = '<span class="badge badge-green">Active</span>';
    btn.remove();
    showToast('User approved', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function suspendUser(id, btn) {
  if (!confirm('Suspend this user?')) return;
  try {
    await api.suspendUser(id);
    btn.closest('tr').querySelector('td:nth-child(5)').innerHTML = '<span class="badge badge-red">Suspended</span>';
    btn.outerHTML = `<button class="btn btn-sm btn-outline" onclick="unsuspendUser('${id}',this)">Unsuspend</button>`;
    showToast('User suspended', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function unsuspendUser(id, btn) {
  try {
    await api.unsuspendUser(id);
    btn.closest('tr').querySelector('td:nth-child(5)').innerHTML = '<span class="badge badge-green">Active</span>';
    btn.outerHTML = `<button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" onclick="suspendUser('${id}',this)">Suspend</button>`;
    showToast('User unsuspended', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteUser(id, btn) {
  if (!confirm('Permanently delete this user? This cannot be undone.')) return;
  try {
    await api.deleteUser(id);
    btn.closest('tr').remove();
    showToast('User deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadAnnouncements() {
  const container = document.getElementById('annList');
  showLoading(container);
  try {
    const { announcements } = await api.getAnnouncements();
    if (!announcements.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📢</div><h3>No announcements</h3></div>`;
      return;
    }
    container.innerHTML = announcements.map(ann => `
      <div class="ann-card ${ann.isPinned?'pinned':''} ${ann.priority==='urgent'?'urgent':''}">
        <div style="font-size:1.8rem">${ann.priority==='urgent'?'🚨':ann.isPinned?'📌':'📢'}</div>
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:4px">${escHtml(ann.title)}</div>
          <div style="font-size:0.85rem;color:#64748b;margin-bottom:6px">${escHtml(ann.content)}</div>
          <div style="font-size:0.75rem;color:#94a3b8">${formatDate(ann.createdAt)} · ${ann.createdBy?.fullname||''} · ${ann.views||0} views</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <span class="ann-priority badge ${ann.priority==='urgent'?'badge-red':ann.priority==='high'?'badge-orange':'badge-gray'}">${ann.priority}</span>
          <button class="btn btn-sm btn-danger" onclick="deleteAnn('${ann._id}',this)">🗑️</button>
        </div>
      </div>`).join('');
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}

async function deleteAnn(id, btn) {
  if (!confirm('Delete announcement?')) return;
  try {
    await api.deleteAnnouncement(id);
    btn.closest('.ann-card').remove();
    showToast('Deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadEvents() {
  const container = document.getElementById('eventList');
  showLoading(container);
  try {
    const { events } = await api.getEvents('?limit=20');
    if (!events.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🗓️</div><h3>No events yet</h3></div>`;
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
          <div style="font-size:0.82rem;color:#64748b;margin-bottom:8px">${escHtml(ev.description).slice(0,80)}...</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.78rem;color:#64748b">👥 ${ev.registrations?.length||0} registered</span>
            <button class="btn btn-sm btn-danger" onclick="deleteEvent('${ev._id}',this)">🗑️</button>
          </div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteEvent(id, btn) {
  if (!confirm('Delete event?')) return;
  try {
    await api.deleteEvent(id);
    btn.closest('.event-card').remove();
    showToast('Event deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

function switchOppTab(tab, btn) {
  currentOppTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadOpportunities(tab);
}

async function loadOpportunities(tab = 'approved') {
  const container = document.getElementById('oppList');
  showLoading(container);
  try {
    let opps;
    if (tab === 'pending') {
      const r = await api.getPendingOpps();
      opps = r.opportunities;
    } else {
      const r = await api.getOpportunities('?limit=20');
      opps = r.opportunities;
    }
    if (!opps.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🌟</div><h3>No opportunities found</h3></div>`;
      return;
    }
    container.innerHTML = opps.map(opp => `
      <div class="opp-card">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">${typeBadge(opp.type)}</div>
        <div class="opp-org">${escHtml(opp.organization)}</div>
        <div class="opp-title">${escHtml(opp.title)}</div>
        <div class="opp-desc">${escHtml(opp.description)}</div>
        <div class="opp-footer">
          ${opp.deadline ? `<span class="opp-deadline">⏰ ${formatDate(opp.deadline)}</span>` : '<span></span>'}
          <div style="display:flex;gap:6px">
            ${!opp.isApproved ? `<button class="btn btn-sm" style="background:#dcfce7;color:#16a34a" onclick="approveOpp('${opp._id}',this)">✓ Approve</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="deleteOpp('${opp._id}',this)">🗑️</button>
          </div>
        </div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function approveOpp(id, btn) {
  try {
    await api.approveOpportunity(id);
    btn.closest('.opp-card').remove();
    showToast('Opportunity approved', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteOpp(id, btn) {
  if (!confirm('Delete opportunity?')) return;
  try {
    await api.deleteOpportunity(id);
    btn.closest('.opp-card').remove();
    showToast('Deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadLibrary() {
  const container = document.getElementById('libraryTable');
  showLoading(container);
  try {
    const { books } = await api.getBooks('?limit=30');
    container.innerHTML = `<table>
      <thead><tr><th>Title</th><th>Author</th><th>Department</th><th>Level</th><th>Downloads</th><th>Uploaded By</th><th>Action</th></tr></thead>
      <tbody>${(books||[]).map(b => `
        <tr>
          <td><strong>${escHtml(b.title)}</strong></td>
          <td>${escHtml(b.author||'-')}</td>
          <td>${escHtml(b.department||'-')}</td>
          <td>${b.level||'All'}</td>
          <td>${b.downloads||0}</td>
          <td>${b.uploadedBy?.fullname||'-'}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteBook('${b._id}',this)">🗑️</button></td>
        </tr>`).join('')}
      </tbody></table>`;
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteBook(id, btn) {
  if (!confirm('Delete book?')) return;
  try {
    await api.deleteBook(id);
    btn.closest('tr').remove();
    showToast('Deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function loadPosts() {
  const container = document.getElementById('postsList');
  showLoading(container);
  try {
    const { posts } = await api.getPosts('?limit=20');
    if (!posts.length) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">📰</div><h3>No posts</h3></div>`; return; }
    container.innerHTML = posts.map(post => `
      <div class="post-card">
        <div class="post-header">
          ${avatarHtml(post.user, 40)}
          <div class="post-author"><strong>${post.user?.fullname||'User'}</strong><span>${post.user?.role||''} · ${timeAgo(post.createdAt)}</span></div>
          ${typeBadge(post.type)}
          <button class="btn btn-sm btn-danger" style="margin-left:auto" onclick="deletePost('${post._id}',this)">🗑️</button>
        </div>
        <div class="post-content">${escHtml(post.content)}</div>
        <div style="font-size:0.78rem;color:#64748b">❤️ ${post.likes?.length||0} · 💬 ${post.comments?.length||0} · 👁️ ${post.views||0}</div>
      </div>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deletePost(id, btn) {
  if (!confirm('Delete post?')) return;
  try {
    await api.deletePost(id);
    btn.closest('.post-card').remove();
    showToast('Post deleted', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// Notifications
async function loadNotifications() {
  try {
    const { notifications } = await api.getNotifications();
    notifData = notifications;
    const unread = notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notifBadge');
    const hBadge = document.getElementById('notifHeaderBadge');
    if (unread > 0) { badge.textContent = unread; badge.style.display='inline-flex'; hBadge.textContent=unread; hBadge.style.display='flex'; }
    else { badge.style.display='none'; hBadge.style.display='none'; }
    const html = notifications.map(n => `
      <div class="notif-item ${n.isRead?'':'unread'}" onclick="markRead('${n._id}',this)">
        <div class="notif-icon">${n.icon||'🔔'}</div>
        <div class="notif-body"><strong>${escHtml(n.title)}</strong><p>${escHtml(n.content)}</p><span class="notif-time">${timeAgo(n.createdAt)}</span></div>
      </div>`).join('') || '<div class="empty-state"><p>No notifications</p></div>';
    const list = document.getElementById('notifList');
    const panelList = document.getElementById('notifPanelList');
    if (list) list.innerHTML = html;
    if (panelList) panelList.innerHTML = html;
  } catch {}
}

async function markRead(id, el) {
  try { await api.markRead(id); el.classList.remove('unread'); loadNotifications(); } catch {}
}

async function markAllNotifRead() {
  try { await api.markAllRead(); loadNotifications(); showToast('All marked as read','success'); } catch {}
}
