import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, announcementsAPI, opportunitiesAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';

const LecturerDashboard = ({ user }) => {
  const [myEvents, setMyEvents]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getMyEvents(),
      announcementsAPI.getAnnouncements({ limit: 5 }),
      opportunitiesAPI.getOpportunities({ limit: 4, type: 'research' }),
    ]).then(([ev, an, op]) => {
      setMyEvents(ev.events || []);
      setAnnouncements(an.announcements || []);
      setOpportunities(op.opportunities || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const STATUS_COLOR = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700', draft: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good day, {user.name.split(' ')[0]}! 🎓</h1>
          <p className="text-indigo-200 mt-1">{user.department} · Lecturer</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/announcements/create" className="bg-white text-indigo-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">+ Announcement</Link>
          <Link to="/events/create"        className="bg-indigo-500 bg-opacity-50 border border-indigo-300 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-opacity-70 transition-colors">+ Event</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '📅', label: 'My Events',         value: myEvents.length,                              color: 'bg-purple-50' },
          { icon: '✅', label: 'Approved Events',    value: myEvents.filter(e => e.status==='approved').length, color: 'bg-green-50' },
          { icon: '⏳', label: 'Pending Review',     value: myEvents.filter(e => e.status==='pending').length,  color: 'bg-yellow-50' },
          { icon: '📢', label: 'Announcements',      value: announcements.length,                         color: 'bg-blue-50' },
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
            <Link to="/events/create" className="text-xs text-blue-600 hover:underline">+ New</Link>
          </div>
          {myEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm">No events created yet</p>
              <Link to="/events/create" className="mt-2 inline-block text-sm text-blue-600 hover:underline">Create one →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myEvents.map((e) => (
                <Link key={e._id} to={`/events/${e._id}`}
                  className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{format(new Date(e.date), 'MMM dd, yyyy')} · {e.venue}</p>
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
            <h2 className="font-bold text-gray-900">📢 Latest Announcements</h2>
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
                  className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.publishedAt ? formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true }) : 'Draft'}</p>
                  </div>
                  <span className={`badge ml-2 shrink-0 text-xs ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' : a.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {a.priority}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Research Opportunities */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900 text-lg">🔬 Research Opportunities</h2>
          <Link to="/opportunities?type=research" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        {opportunities.length === 0 ? (
          <div className="card p-6 text-center text-gray-400">
            <p className="text-sm">No research opportunities found. <Link to="/opportunities/create" className="text-blue-600 hover:underline">Share one →</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opportunities.map((opp) => (
              <Link key={opp._id} to={`/opportunities/${opp._id}`}
                className="card p-4 hover:shadow-md transition-shadow">
                <p className="font-semibold text-sm text-gray-900">{opp.title}</p>
                <p className="text-xs text-gray-500 mt-1">{opp.organization}</p>
                {opp.deadline && <p className="text-xs text-red-500 mt-2 font-medium">Deadline: {format(new Date(opp.deadline), 'MMM dd, yyyy')}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-bold text-gray-900 text-lg mb-3">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/announcements/create', icon: '📢', label: 'Post Announcement', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            { to: '/events/create',        icon: '📅', label: 'Create Event',       color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { to: '/feed/create',          icon: '📝', label: 'Share Post',          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { to: '/opportunities/create', icon: '🔬', label: 'Post Opportunity',    color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
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

export default LecturerDashboard;
