import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, projectsAPI, communityAPI, announcementsAPI } from '../services/api';
import EventCard from '../components/common/EventCard';
import ProjectCard from '../components/common/ProjectCard';
import PostCard from '../components/common/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StatCard = ({ label, value, icon, color }) => (
  <div className={`card p-6 flex items-center space-x-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [trending, setTrending] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getEvents({ limit: 3, featured: true }),
      projectsAPI.getProjects({ limit: 3, featured: 'true' }),
      communityAPI.getTrending(),
      announcementsAPI.getAnnouncements({ limit: 3, priority: 'high' }),
    ]).then(([evData, prData, trData, anData]) => {
      setEvents(evData.events || []);
      setProjects(prData.projects || []);
      setTrending(trData.posts || []);
      setAnnouncements(anData.announcements || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading campus feed..." />;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-3">Welcome to CampusPilot</h1>
          <p className="text-blue-100 text-lg mb-6">
            Your digital campus ecosystem — discover events, showcase projects, explore opportunities, and connect with your campus community.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/feed" className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
              Explore Feed
            </Link>
            <Link to="/events" className="bg-blue-500 bg-opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-opacity-70 transition-colors border border-blue-400">
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: '📅', label: 'Events', to: '/events' },
          { icon: '🚀', label: 'Projects', to: '/projects' },
          { icon: '📢', label: 'Announcements', to: '/announcements' },
          { icon: '🎓', label: 'Scholarships', to: '/opportunities?type=scholarship' },
          { icon: '💼', label: 'Internships', to: '/opportunities?type=internship' },
          { icon: '🏆', label: 'Competitions', to: '/opportunities?type=competition' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="card p-4 text-center hover:shadow-md transition-shadow group">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Announcements banner */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">📢 Important Announcements</h2>
            <Link to="/announcements" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <Link key={a._id} to={`/announcements/${a._id}`} className="block card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`badge mr-2 ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {a.priority}
                    </span>
                    <span className="font-medium text-gray-900">{a.title}</span>
                  </div>
                  <span className="text-xs text-gray-400 ml-4 shrink-0">{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Events */}
      {events.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">⭐ Featured Events</h2>
            <Link to="/events" className="text-sm text-blue-600 hover:underline">View all events →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        </div>
      )}

      {/* Featured Projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">🚀 Student Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:underline">View all projects →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => <ProjectCard key={project._id} project={project} />)}
          </div>
        </div>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">🔥 Trending on Campus</h2>
            <Link to="/feed?sort=trending" className="text-sm text-blue-600 hover:underline">See more →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.slice(0, 3).map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
