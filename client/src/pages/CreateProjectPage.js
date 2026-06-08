import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: '', department: '',
    projectLink: '', demoLink: '', githubRepo: '', tags: '',
    contactEmail: '', contactPhone: '',
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('contactInfo', JSON.stringify({ email: form.contactEmail, phone: form.contactPhone }));
      if (image) fd.append('coverImage', image);
      await projectsAPI.createProject(fd);
      toast.success('Project submitted for review!');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const categories = ['final_year', 'startup', 'mobile_app', 'website', 'business', 'research', 'innovation', 'community', 'other'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Project</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
            <input name="projectLink" value={form.projectLink} onChange={handleChange} className="input" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Demo Link</label>
              <input name="demoLink" value={form.demoLink} onChange={handleChange} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repo</label>
              <input name="githubRepo" value={form.githubRepo} onChange={handleChange} className="input" placeholder="https://github.com/..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="react, nodejs, ai" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
