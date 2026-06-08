import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', venue: '', date: '', time: '',
    organizerName: '', registrationLink: '', tags: '', contactEmail: '', contactPhone: '',
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('organizer', JSON.stringify({ name: form.organizerName }));
      fd.append('tags', form.tags.split(',').map((t) => t.trim()).filter(Boolean).join(','));
      fd.append('contactInfo', JSON.stringify({ email: form.contactEmail, phone: form.contactPhone }));
      if (image) fd.append('bannerImage', image);

      await eventsAPI.createEvent(fd);
      toast.success('Event submitted for review!');
      navigate('/events');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const categories = ['academic', 'seminar', 'workshop', 'conference', 'religious', 'sports', 'entertainment', 'club', 'student_association', 'technology', 'business', 'other'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input" required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
              <input name="venue" value={form.venue} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name *</label>
            <input name="organizerName" value={form.organizerName} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
            <input name="registrationLink" value={form.registrationLink} onChange={handleChange} className="input" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange} className="input" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="tech, ai, innovation" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button type="button" onClick={() => navigate('/events')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
