import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', tags: '', externalLink: '', deadline: '' });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (image) fd.append('image', image);
      await communityAPI.createPost(fd);
      toast.success('Post published!');
      navigate('/feed');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const POST_TYPES = ['general', 'event', 'project', 'announcement', 'scholarship', 'internship', 'competition', 'startup', 'campus_news', 'research', 'club_activity', 'student_association'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="input">
              {POST_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={6} className="input resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
            <input name="externalLink" value={form.externalLink} onChange={handleChange} className="input" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (if applicable)</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="campus, technology, opportunity" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
            <button type="button" onClick={() => navigate('/feed')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
