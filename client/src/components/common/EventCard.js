import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  academic: 'bg-blue-100 text-blue-700',
  seminar: 'bg-purple-100 text-purple-700',
  workshop: 'bg-green-100 text-green-700',
  conference: 'bg-indigo-100 text-indigo-700',
  sports: 'bg-orange-100 text-orange-700',
  entertainment: 'bg-pink-100 text-pink-700',
  technology: 'bg-cyan-100 text-cyan-700',
  business: 'bg-yellow-100 text-yellow-700',
};

const EventCard = ({ event }) => {
  const isPast = new Date(event.date) < new Date();

  return (
    <div className={`card hover:shadow-md transition-shadow ${isPast ? 'opacity-70' : ''}`}>
      {event.bannerImage && (
        <Link to={`/events/${event._id}`}>
          <img src={event.bannerImage} alt={event.title} className="w-full h-44 object-cover" />
        </Link>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`badge ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-700'}`}>
            {event.category?.replace(/_/g, ' ')}
          </span>
          {event.isFeatured && (
            <span className="badge bg-yellow-100 text-yellow-700">⭐ Featured</span>
          )}
        </div>

        <Link to={`/events/${event._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">{event.title}</h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {format(new Date(event.date), 'MMM dd, yyyy')} • {event.time}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 mr-1.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {event.venue}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">By {event.organizer?.name}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{event.views} views</span>
            <Link
              to={`/events/${event._id}`}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
