import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ProjectCard = ({ project }) => (
  <div className="card hover:shadow-md transition-shadow">
    {project.coverImage && (
      <Link to={`/projects/${project._id}`}>
        <img src={project.coverImage} alt={project.name} className="w-full h-44 object-cover" />
      </Link>
    )}
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="badge bg-green-100 text-green-700">{project.category?.replace(/_/g, ' ')}</span>
        {project.isFeatured && <span className="badge bg-yellow-100 text-yellow-700">⭐ Featured</span>}
      </div>

      <Link to={`/projects/${project._id}`}>
        <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 line-clamp-1">{project.name}</h3>
      </Link>

      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{project.description}</p>

      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {project.createdBy?.avatar ? (
              <img src={project.createdBy.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-green-600 text-xs font-semibold">{project.createdBy?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <span className="text-xs text-gray-600">{project.createdBy?.name}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>❤️ {project.likeCount || 0}</span>
          <span>👁 {project.views || 0}</span>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectCard;
