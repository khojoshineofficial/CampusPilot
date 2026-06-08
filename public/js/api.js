const API_BASE = '/api';

const api = {
  getToken: () => localStorage.getItem('cp_token'),

  headers(isFormData = false) {
    const h = {};
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (!isFormData) h['Content-Type'] = 'application/json';
    return h;
  },

  async request(method, path, body = null, isFormData = false) {
    const opts = { method, headers: this.headers(isFormData) };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get: (path) => api.request('GET', path),
  post: (path, body, isFormData) => api.request('POST', path, body, isFormData),
  put: (path, body) => api.request('PUT', path, body),
  delete: (path) => api.request('DELETE', path),

  // Auth
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  getMe: () => api.get('/auth/me'),
  updateProfile: (fd) => api.post('/auth/profile', fd, true),
  changePassword: (body) => api.put('/auth/password', body),

  // Users
  getUsers: (q = '') => api.get(`/users${q}`),
  approveUser: (id) => api.put(`/users/${id}/approve`),
  suspendUser: (id) => api.put(`/users/${id}/suspend`),
  unsuspendUser: (id) => api.put(`/users/${id}/unsuspend`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),

  // Books
  getBooks: (q = '') => api.get(`/books${q}`),
  createBook: (fd) => api.post('/books', fd, true),
  downloadBook: (id) => api.post(`/books/${id}/download`),
  bookmarkBook: (id) => api.post(`/books/${id}/bookmark`),
  deleteBook: (id) => api.delete(`/books/${id}`),

  // Past Questions
  getPastQuestions: (q = '') => api.get(`/past-questions${q}`),
  createPastQuestion: (fd) => api.post('/past-questions', fd, true),
  downloadPQ: (id) => api.post(`/past-questions/${id}/download`),
  favoritePQ: (id) => api.post(`/past-questions/${id}/favorite`),
  deletePQ: (id) => api.delete(`/past-questions/${id}`),

  // Materials
  getMaterials: (q = '') => api.get(`/materials${q}`),
  getMyMaterials: () => api.get('/materials/mine'),
  createMaterial: (fd) => api.post('/materials', fd, true),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
  downloadMaterial: (id) => api.post(`/materials/${id}/download`),

  // Posts
  getPosts: (q = '') => api.get(`/posts${q}`),
  createPost: (fd) => api.post('/posts', fd, true),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  savePost: (id) => api.post(`/posts/${id}/save`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),

  // Events
  getEvents: (q = '') => api.get(`/events${q}`),
  createEvent: (fd) => api.post('/events', fd, true),
  updateEvent: (id, body) => api.put(`/events/${id}`, body),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  registerEvent: (id) => api.post(`/events/${id}/register`),
  saveEvent: (id) => api.post(`/events/${id}/save`),

  // Announcements
  getAnnouncements: (q = '') => api.get(`/announcements${q}`),
  createAnnouncement: (fd) => api.post('/announcements', fd, true),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),

  // Opportunities
  getOpportunities: (q = '') => api.get(`/opportunities${q}`),
  getPendingOpps: () => api.get('/opportunities/pending'),
  createOpportunity: (fd) => api.post('/opportunities', fd, true),
  approveOpportunity: (id) => api.put(`/opportunities/${id}/approve`),
  deleteOpportunity: (id) => api.delete(`/opportunities/${id}`),
  saveOpportunity: (id) => api.post(`/opportunities/${id}/save`),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  createNotification: (body) => api.post('/notifications', body),

  // Quiz
  getQuizzes: (q = '') => api.get(`/quiz${q}`),
  getMyQuizzes: () => api.get('/quiz/mine'),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  createQuiz: (body) => api.post('/quiz', body),
  submitQuiz: (id, answers) => api.post(`/quiz/${id}/submit`, { answers }),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),

  // Analytics
  getStats: () => api.get('/analytics/stats'),
};

window.api = api;
