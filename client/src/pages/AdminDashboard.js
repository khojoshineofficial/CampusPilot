import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, eventsAPI, projectsAPI, adsAPI, reportsAPI, opportunitiesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const StatWidget = ({ label, value, icon, color, to }) => (
  <Link to={to || '#'} className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

const PendingItem = ({ item, type, onApprove, onReject }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="font-medium text-sm text-gray-900">{item.title || item.name}</p>
      <p className="text-xs text-gray-500">{item.createdBy?.name} • {type}</p>
    </div>
    <div className="flex gap-2">
      <button onClick={() => onApprove(item._id)} className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700">Approve</button>
      <button onClick={() => onReject(item._id)} className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600">Reject</button>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      eventsAPI.getPending(),
      projectsAPI.getPending(),
      adsAPI.getPending(),
      reportsAPI.getReports({ status: 'pending', limit: 5 }),
    ]).then(([statsData, evData, prData, adData, repData]) => {
      setStats(statsData.stats);
      setPendingEvents(evData.events?.slice(0, 5));
      setPendingProjects(prData.projects?.slice(0, 5));
      setPendingAds(adData.advertisements?.slice(0, 5));
      setReports(repData.reports?.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const approveEvent = async (id) => {
    try { await eventsAPI.approveEvent(id); setPendingEvents((p) => p.filter((e) => e._id !== id)); toast.success('Event approved'); } catch {}
  };
  const rejectEvent = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await eventsAPI.rejectEvent(id, { reason }); setPendingEvents((p) => p.filter((e) => e._id !== id)); toast.success('Event rejected'); } catch {}
  };
  const approveProject = async (id) => {
    try { await projectsAPI.approveProject(id); setPendingProjects((p) => p.filter((e) => e._id !== id)); toast.success('Project approved'); } catch {}
  };
  const rejectProject = async (id) => {
    try { await projectsAPI.rejectProject(id); setPendingProjects((p) => p.filter((e) => e._id !== id)); toast.success('Project rejected'); } catch {}
  };
  const approveAd = async (id) => {
    try { await adsAPI.approveAd(id); setPendingAds((p) => p.filter((e) => e._id !== id)); toast.success('Ad approved'); } catch {}
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget label="Total Users" value={stats?.totalUsers} icon="👥" color="bg-blue-100" />
        <StatWidget label="Live Events" value={stats?.totalEvents} icon="📅" color="bg-purple-100" />
        <StatWidget label="Projects" value={stats?.totalProjects} icon="🚀" color="bg-green-100" />
        <StatWidget label="Posts" value={stats?.totalPosts} icon="📝" color="bg-yellow-100" />
        <StatWidget label="Pending Events" value={stats?.pendingEvents} icon="⏳" color="bg-orange-100" />
        <StatWidget label="Pending Projects" value={stats?.pendingProjects} icon="🔍" color="bg-red-100" />
        <StatWidget label="Pending Ads" value={stats?.pendingAds} icon="📢" color="bg-indigo-100" />
        <StatWidget label="Registrations" value={stats?.totalRegistrations} icon="✅" color="bg-teal-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Events */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pending Events ({pendingEvents.length})</h2>
          {pendingEvents.length === 0 ? <p className="text-sm text-gray-400">No pending events</p> : (
            pendingEvents.map((e) => <PendingItem key={e._id} item={e} type="Event" onApprove={approveEvent} onReject={rejectEvent} />)
          )}
        </div>

        {/* Pending Projects */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pending Projects ({pendingProjects.length})</h2>
          {pendingProjects.length === 0 ? <p className="text-sm text-gray-400">No pending projects</p> : (
            pendingProjects.map((p) => <PendingItem key={p._id} item={p} type="Project" onApprove={approveProject} onReject={rejectProject} />)
          )}
        </div>

        {/* Pending Ads */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pending Advertisements ({pendingAds.length})</h2>
          {pendingAds.length === 0 ? <p className="text-sm text-gray-400">No pending ads</p> : (
            pendingAds.map((a) => <PendingItem key={a._id} item={a} type="Advertisement" onApprove={approveAd} onReject={() => {}} />)
          )}
        </div>

        {/* Reports */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Reports ({reports.length})</h2>
          {reports.length === 0 ? <p className="text-sm text-gray-400">No pending reports</p> : (
            reports.map((r) => (
              <div key={r._id} className="py-3 border-b border-gray-100 last:border-0">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.reason?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">By {r.reporter?.name} • {r.onModel}</p>
                    {r.details && <p className="text-xs text-gray-400 mt-0.5">{r.details}</p>}
                  </div>
                  <span className="badge bg-yellow-100 text-yellow-700 text-xs">{r.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
