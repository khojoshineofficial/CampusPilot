import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, eventsAPI, projectsAPI, adsAPI, reportsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Stat = ({ icon, label, value, color, to }) => (
  <Link to={to || '#'} className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${color}`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </Link>
);

const AdminDashboardWidget = ({ user }) => {
  const [stats, setStats]               = useState(null);
  const [pendingEvents, setPendingEvents]   = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [pendingAds, setPendingAds]     = useState([]);
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);

  const load = () => Promise.all([
    analyticsAPI.getDashboard(),
    eventsAPI.getPending(),
    projectsAPI.getPending(),
    adsAPI.getPending(),
    reportsAPI.getReports({ status: 'pending', limit: 5 }),
  ]).then(([st, ev, pr, ad, rep]) => {
    setStats(st.stats);
    setPendingEvents(ev.events?.slice(0, 6) || []);
    setPendingProjects(pr.projects?.slice(0, 6) || []);
    setPendingAds(ad.advertisements?.slice(0, 6) || []);
    setReports(rep.reports?.slice(0, 5) || []);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const approveEvent   = async (id) => { try { await eventsAPI.approveEvent(id);   setPendingEvents(p => p.filter(e => e._id !== id)); toast.success('Event approved ✓'); } catch { toast.error('Failed'); } };
  const rejectEvent    = async (id) => { const r = prompt('Rejection reason:'); if (!r) return; try { await eventsAPI.rejectEvent(id, { reason: r }); setPendingEvents(p => p.filter(e => e._id !== id)); toast.success('Event rejected'); } catch { toast.error('Failed'); } };
  const approveProject = async (id) => { try { await projectsAPI.approveProject(id); setPendingProjects(p => p.filter(e => e._id !== id)); toast.success('Project approved ✓'); } catch { toast.error('Failed'); } };
  const rejectProject  = async (id) => { try { await projectsAPI.rejectProject(id);  setPendingProjects(p => p.filter(e => e._id !== id)); toast.success('Project rejected'); } catch { toast.error('Failed'); } };
  const approveAd      = async (id) => { try { await adsAPI.approveAd(id);           setPendingAds(p => p.filter(e => e._id !== id));      toast.success('Ad approved ✓');    } catch { toast.error('Failed'); } };
  const rejectAd       = async (id) => { try { await adsAPI.rejectAd(id, { reason: 'Does not meet guidelines' }); setPendingAds(p => p.filter(e => e._id !== id)); toast.success('Ad rejected'); } catch { toast.error('Failed'); } };

  if (loading) return <LoadingSpinner />;

  const PendingRow = ({ item, onApprove, onReject }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title || item.name}</p>
        <p className="text-xs text-gray-400">{item.createdBy?.name} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
      </div>
      <div className="flex gap-1.5 ml-3 shrink-0">
        <button onClick={() => onApprove(item._id)} className="text-xs bg-green-500 text-white px-2.5 py-1 rounded-lg hover:bg-green-600 transition-colors font-medium">✓ Approve</button>
        <button onClick={() => onReject(item._id)}  className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-200 transition-colors font-medium">✕ Reject</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Control Panel ⚙️</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user.name} — here's what needs your attention.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/announcements/create" className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">+ Announcement</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon="👥" label="Total Users"       value={stats?.totalUsers}          color="bg-blue-50"   />
        <Stat icon="📅" label="Live Events"        value={stats?.totalEvents}         color="bg-purple-50" />
        <Stat icon="🚀" label="Projects"           value={stats?.totalProjects}       color="bg-green-50"  />
        <Stat icon="📰" label="Community Posts"    value={stats?.totalPosts}          color="bg-yellow-50" />
        <Stat icon="⏳" label="Pending Events"     value={stats?.pendingEvents}       color={stats?.pendingEvents > 0 ? 'bg-orange-50 ring-2 ring-orange-200' : 'bg-gray-50'} />
        <Stat icon="🔍" label="Pending Projects"   value={stats?.pendingProjects}     color={stats?.pendingProjects > 0 ? 'bg-orange-50 ring-2 ring-orange-200' : 'bg-gray-50'} />
        <Stat icon="📢" label="Pending Ads"        value={stats?.pendingAds}          color={stats?.pendingAds > 0 ? 'bg-orange-50 ring-2 ring-orange-200' : 'bg-gray-50'} />
        <Stat icon="✅" label="Registrations"      value={stats?.totalRegistrations}  color="bg-teal-50"   />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Events */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">⏳ Pending Events
              {pendingEvents.length > 0 && <span className="ml-2 badge bg-orange-100 text-orange-700">{pendingEvents.length}</span>}
            </h2>
          </div>
          {pendingEvents.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">✅ All clear — no pending events</p>
            : pendingEvents.map(e => <PendingRow key={e._id} item={e} onApprove={approveEvent} onReject={rejectEvent} />)
          }
        </section>

        {/* Pending Projects */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">⏳ Pending Projects
              {pendingProjects.length > 0 && <span className="ml-2 badge bg-orange-100 text-orange-700">{pendingProjects.length}</span>}
            </h2>
          </div>
          {pendingProjects.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">✅ All clear — no pending projects</p>
            : pendingProjects.map(p => <PendingRow key={p._id} item={p} onApprove={approveProject} onReject={rejectProject} />)
          }
        </section>

        {/* Pending Ads */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">⏳ Pending Advertisements
              {pendingAds.length > 0 && <span className="ml-2 badge bg-orange-100 text-orange-700">{pendingAds.length}</span>}
            </h2>
          </div>
          {pendingAds.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">✅ No pending advertisements</p>
            : pendingAds.map(a => <PendingRow key={a._id} item={a} onApprove={approveAd} onReject={rejectAd} />)
          }
        </section>

        {/* Reports */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">🚨 Content Reports
              {reports.length > 0 && <span className="ml-2 badge bg-red-100 text-red-700">{reports.length}</span>}
            </h2>
          </div>
          {reports.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">✅ No pending reports</p>
            : reports.map(r => (
                <div key={r._id} className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{r.reason?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-400">{r.onModel} · by {r.reporter?.name} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                    {r.details && <p className="text-xs text-gray-500 mt-0.5 italic">"{r.details}"</p>}
                  </div>
                  <span className="badge bg-yellow-100 text-yellow-700 ml-2 shrink-0">{r.status}</span>
                </div>
              ))
          }
        </section>
      </div>

      {/* Analytics shortcut */}
      <div className="card p-5 bg-gray-50">
        <h2 className="font-bold text-gray-900 mb-3">📊 Platform Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Event Analytics',   to: '/admin/analytics/events',   icon: '📅' },
            { label: 'Project Analytics', to: '/admin/analytics/projects',  icon: '🚀' },
            { label: 'Ad Analytics',      to: '/admin/analytics/ads',       icon: '📢' },
            { label: 'Trending Topics',   to: '/feed?sort=trending',        icon: '🔥' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="card p-3 text-center hover:shadow-md transition-shadow bg-white">
              <span className="text-2xl">{a.icon}</span>
              <p className="text-xs font-medium text-gray-700 mt-1">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardWidget;
