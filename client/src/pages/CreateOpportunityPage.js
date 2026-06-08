import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: '', organization: '', location: '',
    isRemote: false, deadline: '', link: '', eligibility: '', benefits: '', tags: '',
  });

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await opportunitiesAPI.createOpportunity(fd);
      toast.success('Opportunity submitted for review!');
      navigate('/opportunities');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const types = ['scholarship', 'internship', 'competition', 'grant', 'fellowship', 'exchange_program', 'job', 'other'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Share Opportunity</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="input" required>
                <option value="">Select type</option>
                {types.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
              <input name="organization" value={form.organization} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isRemote" checked={form.isRemote} onChange={handleChange} className="w-4 h-4 text-blue-600" id="remote" />
            <label htmlFor="remote" className="text-sm text-gray-700">Remote / Online</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Link</label>
            <input name="link" value={form.link} onChange={handleChange} className="input" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
            <textarea name="eligibility" value={form.eligibility} onChange={handleChange} rows={2} className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
            <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={2} className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="stem, international, funded" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button type="button" onClick={() => navigate('/opportunities')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOpportunityPage;
