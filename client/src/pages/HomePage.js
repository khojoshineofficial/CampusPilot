import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, projectsAPI, communityAPI, announcementsAPI } from '../services/api';
import EventCard from '../components/common/EventCard';
import ProjectCard from '../components/common/ProjectCard';
import PostCard from '../components/common/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const quickLinks = [
  { icon: '📅', label: 'Events',        to: '/events',                    color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { icon: '🚀', label: 'Projects',      to: '/projects',                  color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { icon: '📢', label: 'Announcements', to: '/announcements',             color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { icon: '🎓', label: 'Scholarships',  to: '/opportunities?type=scholarship', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { icon: '💼', label: 'Internships',   to: '/opportunities?type=internship',  color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
  { icon: '🏆', label: 'Competitions',  to: '/opportunities?type=competition', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
  { icon: '🔬', label: 'Research',      to: '/feed?type=research',        color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { icon: '🌍', label: 'Opportunities', to: '/opportunities',             color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
];

const PRIORITY_COLORS = {
  urgent: 'border-l-4 border-red-500 bg-red-50',
  high:   'border-l-4 border-orange-400 bg-orange-50',
  normal: 'border-l-4 border-blue-400 bg-blue-50',
  low:    'border-l-4 border-gray-300 bg-gray-50',
};

const HomePage = () => {
  const [events, setEvents]             = useState([]);
  const [projects, setProjects]         = useState([]);
  const [trending, setTrending]         = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getEvents({ limit: 3, sort: '-createdAt' }),
      projectsAPI.getProjects({ limit: 3, sort: '-likeCount' }),
      communityAPI.getTrending(),
      announcementsAPI.getAnnouncements({ limit: 4 }),
    ]).then(([evData, prData, trData, anData]) => {
      setEvents(evData.events || []);
      setProjects(prData.projects || []);
      setTrending(trData.posts || []);
      setAnnouncements(anData.announcements || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading campus feed..." />;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Campus is live — 2,400+ students online</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 leading-tight">Your Campus.<br />Your Community.</h1>
          <p className="text-blue-100 text-lg mb-6">
            Discover events, showcase projects, explore opportunities, and connect with everyone on campus — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/feed" className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
              Explore Feed
            </Link>
            <Link to="/events/create" className="bg-blue-500 bg-opacity-50 border border-blue-300 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-opacity-70 transition-colors">
              + Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to}
            className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-colors cursor-pointer ${item.color}`}>
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-semibold leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📢</span> Important Announcements
            </h2>
            <Link to="/announcements" className="text-sm text-blue-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <Link key={a._id} to={`/announcements/${a._id}`}
                className={`flex items-start justify-between p-3 rounded-xl hover:opacity-90 transition-opacity ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
                <div className="flex items-start gap-2">
                  {a.priority === 'urgent' && <span className="text-red-500 font-bold text-xs mt-0.5 shrink-0">⚠️ URGENT</span>}
                  <span className="text-sm font-medium text-gray-900">{a.title}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-4">
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Events */}
      {events.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span>📅</span> Upcoming Events</h2>
            <Link to="/events" className="text-sm text-blue-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span>🚀</span> Trending Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => <ProjectCard key={project._id} project={project} />)}
          </div>
        </section>
      )}

      {/* Trending Feed */}
      {trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span>🔥</span> Trending on Campus</h2>
            <Link to="/feed?sort=trending" className="text-sm text-blue-600 hover:underline font-medium">See more →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.slice(0, 3).map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        </section>
      )}

      {/* Empty state CTA */}
      {events.length === 0 && projects.length === 0 && trending.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <p className="text-5xl">🌱</p>
          <p className="text-xl font-semibold text-gray-700">Campus feed is just getting started!</p>
          <p className="text-gray-500">Be the first to create an event or share a project.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to="/events/create" className="btn-primary">+ Create Event</Link>
            <Link to="/projects/create" className="btn-secondary">+ Submit Project</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
