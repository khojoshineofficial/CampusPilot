import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { announcementsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-100',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
};

const AnnouncementsPage = () => {
  const { canPublish } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    announcementsAPI.getAnnouncements({ category, search, limit: 50 })
      .then((data) => setAnnouncements(data.announcements))
      .finally(() => setLoading(false));
  }, [category, search]);

  const CATS = ['academic', 'registration', 'timetable', 'examination', 'emergency', 'faculty', 'department', 'student_association', 'general'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        {canPublish && <Link to="/announcements/create" className="btn-primary text-sm">+ Post Announcement</Link>}
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search announcements..." />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory('')} className={`badge cursor-pointer ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {CATS.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`badge cursor-pointer capitalize ${category === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        announcements.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📢</p>
            <p>No announcements found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <Link key={a._id} to={`/announcements/${a._id}`} className={`block card p-4 border hover:shadow-md transition-shadow ${PRIORITY_COLORS[a.priority]}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs ${a.priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-white bg-opacity-70'}`}>
                        {a.priority?.toUpperCase()}
                      </span>
                      <span className="badge bg-white bg-opacity-70 text-xs capitalize">{a.category?.replace(/_/g, ' ')}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm mt-1 line-clamp-2 text-gray-600">{a.content?.replace(/<[^>]*>/g, '')}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>By {a.createdBy?.name}</span>
                      <span>•</span>
                      <span>{a.publishedAt ? format(new Date(a.publishedAt), 'MMM dd, yyyy') : 'Draft'}</span>
                    </div>
                  </div>
                  {a.attachments?.length > 0 && (
                    <span className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded">📎 {a.attachments.length}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AnnouncementsPage;
