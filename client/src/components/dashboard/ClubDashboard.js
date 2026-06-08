import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, communityAPI, announcementsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';

const ClubDashboard = ({ user }) => {
  const [myEvents, setMyEvents]           = useState([]);
  const [myPosts, setMyPosts]             = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getMyEvents(),
      communityAPI.getFeed({ limit: 5 }),
      announcementsAPI.getAnnouncements({ limit: 4 }),
    ]).then(([ev, ps, an]) => {
      setMyEvents(ev.events || []);
      setMyPosts(ps.posts || []);
      setAnnouncements(an.announcements || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const roleLabel = user.role === 'club' ? 'Club' : user.role === 'organization' ? 'Organization' : 'Department';
  const roleColor = user.role === 'club' ? 'from-pink-600 to-rose-700' : user.role === 'organization' ? 'from-teal-600 to-emerald-700' : 'from-cyan-600 to-blue-700';

  const STATUS_COLOR = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className={`bg-gradient-to-r ${roleColor} rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}! 🏛️</h1>
          <p className="text-white text-opacity-80 mt-1">{roleLabel} Account · {user.department || 'Campus'}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/events/create"        className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">+ Event</Link>
          <Link to="/announcements/create" className="bg-white bg-opacity-20 border border-white border-opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-opacity-30 transition-colors">+ Announcement</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '📅', label: 'Total Events',    value: myEvents.length,                                    color: 'bg-purple-50' },
          { icon: '✅', label: 'Live Events',      value: myEvents.filter(e => e.status === 'approved').length, color: 'bg-green-50' },
          { icon: '⏳', label: 'Pending Approval', value: myEvents.filter(e => e.status === 'pending').length,  color: 'bg-yellow-50' },
          { icon: '👁️', label: 'Total Views',      value: myEvents.reduce((s, e) => s + (e.views || 0), 0),     color: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className={`card p-4 flex items-center gap-3 ${s.color}`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Events */}
        <section className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">📅 My Events</h2>
            <Link to="/events/create" className="text-xs text-blue-600 hover:underline">+ New Event</Link>
          </div>
          {myEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm mb-2">No events yet</p>
              <Link to="/events/create" className="btn-primary text-xs py-1.5 px-3">Create First Event</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myEvents.map((e) => (
                <Link key={e._id} to={`/events/${e._id}`}
                  className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(e.date), 'MMM dd')} · {e.registrationCount || 0} registrations · {e.views || 0} views
                    </p>
                  </div>
                  <span className={`badge ml-2 shrink-0 ${STATUS_COLOR[e.status] || 'bg-gray-100 text-gray-600'}`}>{e.status}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Announcements */}
        <section className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">📢 Announcements</h2>
            <Link to="/announcements/create" className="text-xs text-blue-600 hover:underline">+ New</Link>
          </div>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📢</p>
              <p className="text-sm">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map((a) => (
                <Link key={a._id} to={`/announcements/${a._id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                  <p className="text-sm font-medium text-gray-900 truncate flex-1">{a.title}</p>
                  <span className="text-xs text-gray-400 ml-3 shrink-0">{formatDistanceToNow(new Date(a.publishedAt || a.createdAt), { addSuffix: true })}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Community Feed Posts */}
      <section className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">📰 Recent Campus Posts</h2>
          <Link to="/feed/create" className="text-xs text-blue-600 hover:underline">+ Create Post</Link>
        </div>
        <div className="space-y-2">
          {myPosts.slice(0, 4).map((p) => (
            <Link key={p._id} to={`/feed/${p._id}`}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400">❤️ {p.likeCount} · 💬 {p.commentCount} · 👁️ {p.views}</p>
              </div>
              <span className="badge bg-blue-50 text-blue-600 ml-2 shrink-0">{p.type?.replace(/_/g, ' ')}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-bold text-gray-900 text-lg mb-3">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/events/create',        icon: '📅', label: 'Create Event',       color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { to: '/announcements/create', icon: '📢', label: 'Post Announcement',  color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            { to: '/feed/create',          icon: '📝', label: 'Share Post',          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { to: '/projects/create',      icon: '🚀', label: 'Submit Project',      color: 'bg-green-50 text-green-700 hover:bg-green-100' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className={`card p-4 flex flex-col items-center text-center transition-colors ${a.color}`}>
              <span className="text-2xl mb-1">{a.icon}</span>
              <span className="text-xs font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClubDashboard;
