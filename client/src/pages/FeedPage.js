import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { communityAPI } from '../services/api';
import PostCard from '../components/common/PostCard';
import SearchBar from '../components/common/SearchBar';
import CategoryFilter from '../components/common/CategoryFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const POST_TYPES = [
  { value: 'event', label: 'Events' },
  { value: 'project', label: 'Projects' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'scholarship', label: 'Scholarships' },
  { value: 'internship', label: 'Internships' },
  { value: 'competition', label: 'Competitions' },
  { value: 'startup', label: 'Startups' },
  { value: 'campus_news', label: 'Campus News' },
  { value: 'research', label: 'Research' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: '🕐 Recent' },
  { value: 'trending', label: '🔥 Trending' },
  { value: 'popular', label: '❤️ Popular' },
];

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');

  const fetchPosts = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    try {
      const data = await communityAPI.getFeed({ page: currentPage, limit: 9, type, sort, search });
      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(currentPage < data.pages);
      setPage(currentPage + 1);
    } catch {}
    setLoading(false);
  }, [page, type, sort, search]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchPosts(true);
  }, [type, sort, search]);

  const loadMore = () => fetchPosts(false);

  const handleLike = (postId, data) => {
    setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likeCount: data.likeCount } : p));
  };

  return (
    <div className="flex gap-6">
      {/* Main feed */}
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Campus Feed</h1>
          {user && (
            <Link to="/feed/create" className="btn-primary text-sm">+ Create Post</Link>
          )}
        </div>

        <SearchBar onSearch={setSearch} placeholder="Search campus feed..." />

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <CategoryFilter categories={POST_TYPES} selected={type} onChange={(v) => { setType(v); }} />
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sort === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading feed..." />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<LoadingSpinner size="sm" />}
            endMessage={<p className="text-center text-sm text-gray-400 py-4">You've seen everything! 🎉</p>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onLike={handleLike} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">🔥 Quick Actions</h3>
          <div className="space-y-2">
            {[
              { to: '/events/create', label: '+ Create Event', color: 'text-purple-600' },
              { to: '/projects/create', label: '+ Submit Project', color: 'text-green-600' },
              { to: '/opportunities/create', label: '+ Share Opportunity', color: 'text-blue-600' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className={`block text-sm font-medium ${item.color} hover:underline`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">📑 Browse by Type</h3>
          <div className="space-y-1">
            {POST_TYPES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setType(cat.value === type ? '' : cat.value)}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  type === cat.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
