import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, projectsAPI, opportunitiesAPI, communityAPI } from '../../services/api';
import EventCard from '../common/EventCard';
import ProjectCard from '../common/ProjectCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to || '#'} className={`card p-4 flex items-center gap-3 hover:shadow-md transition-shadow ${color}`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </Link>
);

const StudentDashboard = ({ user }) => {
  const [myEvents, setMyEvents]         = useState([]);
  const [myProjects, setMyProjects]     = useState([]);
  const [bookmarks, setBookmarks]       = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getMyEvents(),
      projectsAPI.getProjects({ limit: 3 }),
      communityAPI.getBookmarks(),
      opportunitiesAPI.getOpportunities({ limit: 4 }),
    ]).then(([ev, pr, bm, op]) => {
      setMyEvents(ev.events || []);
      setMyProjects(pr.projects || []);
      setBookmarks(bm.bookmarks || []);
      setOpportunities(op.opportunities || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-blue-200 mt-1">{user.department} · Student</p>
        </div>
        <div className="flex gap-2">
          <Link to="/events/create"   className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">+ Event</Link>
          <Link to="/projects/create" className="bg-blue-500 bg-opacity-50 border border-blue-300 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-opacity-70 transition-colors">+ Project</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📅" label="My Events"    value={myEvents.length}    color="bg-purple-50" to="/events/my" />
        <StatCard icon="🚀" label="My Projects"  value={myProjects.length}  color="bg-green-50"  to="/projects" />
        <StatCard icon="🔖" label="Bookmarks"    value={bookmarks.length}   color="bg-yellow-50" to="#bookmarks" />
        <StatCard icon="🎓" label="Opportunities" value={opportunities.length} color="bg-blue-50" to="/opportunities" />
      </div>

      {/* My Events */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900 text-lg">📅 My Events</h2>
          <Link to="/events/create" className="text-sm text-blue-600 hover:underline">+ Create Event</Link>
        </div>
        {myEvents.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">📅</p>
            <p className="font-medium">No events yet</p>
            <Link to="/events/create" className="mt-3 inline-block btn-primary text-sm">Create your first event</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEvents.slice(0, 3).map((e) => (
              <div key={e._id} className="relative">
                <EventCard event={e} />
                <span className={`absolute top-2 right-2 badge text-xs ${
                  e.status === 'approved' ? 'bg-green-500 text-white' :
                  e.status === 'pending'  ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>{e.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Opportunities */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900 text-lg">🎓 Opportunities For You</h2>
          <Link to="/opportunities" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {opportunities.map((opp) => (
            <Link key={opp._id} to={`/opportunities/${opp._id}`}
              className="card p-4 hover:shadow-md transition-shadow flex items-start gap-3">
              <span className="text-2xl">
                {opp.type === 'scholarship' ? '🎓' : opp.type === 'internship' ? '💼' : opp.type === 'competition' ? '🏆' : '🌍'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{opp.title}</p>
                <p className="text-xs text-gray-500">{opp.organization}</p>
                {opp.deadline && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    Closes {formatDistanceToNow(new Date(opp.deadline), { addSuffix: true })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <section id="bookmarks">
          <h2 className="font-bold text-gray-900 text-lg mb-3">🔖 Saved Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarks.slice(0, 6).map((b) => (
              <div key={b._id} className="card p-3 flex items-center gap-3">
                <span className="text-xl">🔖</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {b.onDocument?.title || b.onDocument?.name || 'Saved item'}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{b.onModel}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="font-bold text-gray-900 text-lg mb-3">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/feed/create',         icon: '📝', label: 'Create Post',      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { to: '/events/create',       icon: '📅', label: 'Create Event',     color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { to: '/projects/create',     icon: '🚀', label: 'Submit Project',   color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { to: '/opportunities/create',icon: '🎯', label: 'Share Opportunity',color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
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

export default StudentDashboard;
