import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const communityAPI = {
  getFeed: (params) => API.get('/community/feed', { params }),
  getPost: (id) => API.get(`/community/${id}`),
  createPost: (data) => API.post('/community', data),
  updatePost: (id, data) => API.put(`/community/${id}`, data),
  deletePost: (id) => API.delete(`/community/${id}`),
  toggleLike: (id, data) => API.post(`/community/${id}/like`, data),
  toggleBookmark: (id, data) => API.post(`/community/${id}/bookmark`, data),
  getBookmarks: () => API.get('/community/bookmarks'),
  getTrending: () => API.get('/community/trending'),
};

export const eventsAPI = {
  getEvents: (params) => API.get('/events', { params }),
  getEvent: (id) => API.get(`/events/${id}`),
  createEvent: (data) => API.post('/events', data),
  updateEvent: (id, data) => API.put(`/events/${id}`, data),
  deleteEvent: (id) => API.delete(`/events/${id}`),
  approveEvent: (id) => API.put(`/events/${id}/approve`),
  rejectEvent: (id, data) => API.put(`/events/${id}/reject`, data),
  featureEvent: (id, data) => API.put(`/events/${id}/feature`, data),
  registerForEvent: (id, data) => API.post(`/events/${id}/register`, data),
  getMyEvents: () => API.get('/events/my'),
  getPending: () => API.get('/events/pending'),
};

export const projectsAPI = {
  getProjects: (params) => API.get('/projects', { params }),
  getProject: (id) => API.get(`/projects/${id}`),
  createProject: (data) => API.post('/projects', data),
  updateProject: (id, data) => API.put(`/projects/${id}`, data),
  deleteProject: (id) => API.delete(`/projects/${id}`),
  approveProject: (id) => API.put(`/projects/${id}/approve`),
  rejectProject: (id) => API.put(`/projects/${id}/reject`),
  getPending: () => API.get('/projects/pending'),
};

export const announcementsAPI = {
  getAnnouncements: (params) => API.get('/announcements', { params }),
  getAnnouncement: (id) => API.get(`/announcements/${id}`),
  createAnnouncement: (data) => API.post('/announcements', data),
  updateAnnouncement: (id, data) => API.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => API.delete(`/announcements/${id}`),
};

export const opportunitiesAPI = {
  getOpportunities: (params) => API.get('/opportunities', { params }),
  getOpportunity: (id) => API.get(`/opportunities/${id}`),
  createOpportunity: (data) => API.post('/opportunities', data),
  approveOpportunity: (id) => API.put(`/opportunities/${id}/approve`),
  rejectOpportunity: (id) => API.put(`/opportunities/${id}/reject`),
  getPending: () => API.get('/opportunities/pending'),
};

export const adsAPI = {
  getAds: (params) => API.get('/advertisements', { params }),
  createAd: (data) => API.post('/advertisements', data),
  approveAd: (id) => API.put(`/advertisements/${id}/approve`),
  rejectAd: (id, data) => API.put(`/advertisements/${id}/reject`, data),
  getPending: () => API.get('/advertisements/pending'),
  trackImpression: (id) => API.post(`/advertisements/${id}/impression`),
  trackClick: (id) => API.post(`/advertisements/${id}/click`),
};

export const commentsAPI = {
  getComments: (params) => API.get('/comments', { params }),
  addComment: (data) => API.post('/comments', data),
  deleteComment: (id) => API.delete(`/comments/${id}`),
};

export const reportsAPI = {
  createReport: (data) => API.post('/reports', data),
  getReports: (params) => API.get('/reports', { params }),
  resolveReport: (id, data) => API.put(`/reports/${id}/resolve`, data),
  suspendUser: (userId, data) => API.put(`/reports/users/${userId}/suspend`, data),
};

export const notificationsAPI = {
  getNotifications: (params) => API.get('/notifications', { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getEventAnalytics: () => API.get('/analytics/events'),
  getProjectAnalytics: () => API.get('/analytics/projects'),
  getAdAnalytics: () => API.get('/analytics/advertisements'),
  getTrendingTopics: () => API.get('/analytics/trending-topics'),
};

export default API;
