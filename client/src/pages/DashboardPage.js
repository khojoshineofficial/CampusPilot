import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, projectsAPI, communityAPI } from '../services/api';
import EventCard from '../components/common/EventCard';
import ProjectCard from '../components/common/ProjectCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getMyEvents(),
      communityAPI.getBookmarks(),
    ]).then(([evData, bmData]) => {
      setMyEvents(evData.events || []);
      setBookmarks(bmData.bookmarks || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-blue-600 font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-500 capitalize">{user?.role} • {user?.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/events/create', icon: '📅', label: 'Create Event', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
          { to: '/projects/create', icon: '🚀', label: 'Submit Project', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
          { to: '/feed/create', icon: '📝', label: 'Create Post', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          { to: '/opportunities/create', icon: '🎯', label: 'Share Opportunity', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className={`card p-4 text-center transition-colors ${item.color}`}>
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}
      </div>

      {myEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900">My Events</h2>
            <Link to="/events" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEvents.slice(0, 3).map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">Bookmarks ({bookmarks.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookmarks.slice(0, 4).map((b) => (
              <div key={b._id} className="card p-3 flex items-center gap-3">
                <span className="text-xl">🔖</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.onDocument?.title || b.onDocument?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{b.onModel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
