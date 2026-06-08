import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { communityAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  event: 'bg-purple-100 text-purple-700',
  project: 'bg-green-100 text-green-700',
  announcement: 'bg-orange-100 text-orange-700',
  scholarship: 'bg-blue-100 text-blue-700',
  internship: 'bg-cyan-100 text-cyan-700',
  competition: 'bg-red-100 text-red-700',
  startup: 'bg-yellow-100 text-yellow-700',
  campus_news: 'bg-gray-100 text-gray-700',
  research: 'bg-indigo-100 text-indigo-700',
  general: 'bg-gray-100 text-gray-700',
};

const PostCard = ({ post, onLike, onBookmark }) => {
  const { user } = useAuth();

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to like posts'); return; }
    try {
      const data = await communityAPI.toggleLike(post._id, { onModel: 'CommunityPost', onDocument: post._id });
      onLike && onLike(post._id, data);
    } catch {}
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to bookmark'); return; }
    try {
      const data = await communityAPI.toggleBookmark(post._id, { onModel: 'CommunityPost', onDocument: post._id });
      onBookmark && onBookmark(post._id, data);
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks');
    } catch {}
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {post.image && (
        <Link to={`/feed/${post._id}`}>
          <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${TYPE_COLORS[post.type] || TYPE_COLORS.general}`}>
            {post.type?.replace(/_/g, ' ')}
          </span>
          {post.deadline && (
            <span className="text-xs text-red-500 font-medium">
              Deadline: {new Date(post.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <Link to={`/feed/${post._id}`}>
          <h3 className="font-semibold text-gray-900 text-base mb-2 hover:text-blue-600 line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.content}</p>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 text-xs font-semibold">{post.author?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">{post.author?.name}</p>
              <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={handleLike} className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs">{post.likeCount || 0}</span>
            </button>

            <Link to={`/feed/${post._id}`} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs">{post.commentCount || 0}</span>
            </Link>

            <button onClick={handleBookmark} className="text-gray-500 hover:text-yellow-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
