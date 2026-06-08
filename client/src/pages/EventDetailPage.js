import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { eventsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    eventsAPI.getEvent(id).then((data) => { setEvent(data.event); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) { toast.error('Please login to register'); return; }
    setRegistering(true);
    try {
      await eventsAPI.registerForEvent(id, { name: user.name, email: user.email });
      setRegistered(true);
      setEvent((e) => ({ ...e, registrationCount: e.registrationCount + 1 }));
      toast.success('Successfully registered for event!');
    } catch (err) {
      toast.error(err.message);
    }
    setRegistering(false);
  };

  const handleApprove = async () => {
    try {
      await eventsAPI.approveEvent(id);
      setEvent((e) => ({ ...e, status: 'approved' }));
      toast.success('Event approved');
    } catch { toast.error('Failed to approve'); }
  };

  if (loading) return <LoadingSpinner text="Loading event..." />;
  if (!event) return <div className="text-center py-16 text-gray-500">Event not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {event.bannerImage && (
        <img src={event.bannerImage} alt={event.title} className="w-full h-64 object-cover rounded-2xl" />
      )}

      <div className="card p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge bg-purple-100 text-purple-700">{event.category?.replace(/_/g, ' ')}</span>
          <span className={`badge ${
            event.status === 'approved' ? 'bg-green-100 text-green-700' :
            event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>{event.status}</span>
          {event.isFeatured && <span className="badge bg-yellow-100 text-yellow-700">⭐ Featured</span>}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 bg-gray-50 rounded-xl">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <span className="text-xl mr-2">📅</span>
              <div>
                <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</p>
                <p className="text-gray-500">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="text-xl mr-2">📍</span>
              <p>{event.venue}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <span className="text-xl mr-2">👤</span>
              <p>Organized by <strong>{event.organizer?.name}</strong></p>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="text-xl mr-2">👥</span>
              <p>{event.registrationCount} registered • {event.attendanceCount} attended</p>
            </div>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <h3 className="text-lg font-semibold mb-2">About this Event</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </div>

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.map((tag) => <span key={tag} className="badge bg-blue-50 text-blue-600">#{tag}</span>)}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {event.status === 'approved' && (
            <button
              onClick={handleRegister}
              disabled={registering || registered}
              className="btn-primary"
            >
              {registered ? '✓ Registered' : registering ? 'Registering...' : 'Register for Event'}
            </button>
          )}
          {event.registrationLink && (
            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              External Registration →
            </a>
          )}
          {isAdmin && event.status === 'pending' && (
            <button onClick={handleApprove} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              ✓ Approve Event
            </button>
          )}
        </div>
      </div>

      {/* Contact */}
      {(event.contactInfo?.email || event.contactInfo?.phone) && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
          {event.contactInfo.email && <p className="text-sm text-gray-600">✉️ {event.contactInfo.email}</p>}
          {event.contactInfo.phone && <p className="text-sm text-gray-600">📞 {event.contactInfo.phone}</p>}
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
