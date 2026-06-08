import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/common/ProjectCard';
import SearchBar from '../components/common/SearchBar';
import CategoryFilter from '../components/common/CategoryFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PROJECT_CATEGORIES = [
  { value: 'final_year', label: 'Final Year' },
  { value: 'startup', label: 'Startup' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'website', label: 'Website' },
  { value: 'business', label: 'Business' },
  { value: 'research', label: 'Research' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'community', label: 'Community' },
];

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const fetch = async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const data = await projectsAPI.getProjects({ page: p, limit: 9, category, search, sort });
      reset ? setProjects(data.projects) : setProjects((prev) => [...prev, ...data.projects]);
      setHasMore(p < data.pages);
      setPage(p + 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { setLoading(true); setPage(1); fetch(true); }, [category, search, sort]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Showcase</h1>
        {user && <Link to="/projects/create" className="btn-primary text-sm">+ Submit Project</Link>}
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search projects..." />
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <CategoryFilter categories={PROJECT_CATEGORIES} selected={category} onChange={setCategory} />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto text-sm">
          <option value="-createdAt">Latest</option>
          <option value="-likeCount">Most Liked</option>
          <option value="-views">Most Viewed</option>
        </select>
      </div>

      {loading ? <LoadingSpinner text="Loading projects..." /> : (
        projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🚀</p>
            <p className="text-lg font-medium">No projects found</p>
          </div>
        ) : (
          <InfiniteScroll dataLength={projects.length} next={() => fetch(false)} hasMore={hasMore} loader={<LoadingSpinner size="sm" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </InfiniteScroll>
        )
      )}
    </div>
  );
};

export default ProjectsPage;
