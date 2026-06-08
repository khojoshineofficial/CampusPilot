import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS = { scholarship: '🎓', internship: '💼', competition: '🏆', grant: '💰', fellowship: '🔬', exchange_program: '🌍', job: '📋', other: '📌' };
const TYPE_COLORS = { scholarship: 'bg-blue-100 text-blue-700', internship: 'bg-green-100 text-green-700', competition: 'bg-red-100 text-red-700', grant: 'bg-purple-100 text-purple-700', fellowship: 'bg-indigo-100 text-indigo-700', exchange_program: 'bg-cyan-100 text-cyan-700' };

const OpportunitiesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(searchParams.get('type') || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    opportunitiesAPI.getOpportunities({ type, search, limit: 50 })
      .then((data) => setOpportunities(data.opportunities))
      .finally(() => setLoading(false));
  }, [type, search]);

  const TYPES = ['scholarship', 'internship', 'competition', 'grant', 'fellowship', 'exchange_program', 'job'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        {user && <Link to="/opportunities/create" className="btn-primary text-sm">+ Share Opportunity</Link>}
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search opportunities..." />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setType('')} className={`badge cursor-pointer ${!type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)} className={`badge cursor-pointer ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {TYPE_ICONS[t]} {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        opportunities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🎯</p>
            <p>No opportunities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <Link key={opp._id} to={`/opportunities/${opp._id}`} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{TYPE_ICONS[opp.type] || '📌'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs ${TYPE_COLORS[opp.type] || 'bg-gray-100 text-gray-600'}`}>{opp.type?.replace(/_/g, ' ')}</span>
                      {opp.isRemote && <span className="badge bg-green-100 text-green-700 text-xs">Remote</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{opp.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{opp.organization}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{opp.description}</p>
                    {opp.deadline && (
                      <p className="text-xs text-red-500 mt-2 font-medium">
                        Deadline: {format(new Date(opp.deadline), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default OpportunitiesPage;
