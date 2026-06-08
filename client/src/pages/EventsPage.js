import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { eventsAPI } from '../services/api';
import EventCard from '../components/common/EventCard';
import SearchBar from '../components/common/SearchBar';
import CategoryFilter from '../components/common/CategoryFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EVENT_CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Conference' },
  { value: 'religious', label: 'Religious' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'club', label: 'Club' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
];

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetch = async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const data = await eventsAPI.getEvents({ page: p, limit: 9, category, search });
      reset ? setEvents(data.events) : setEvents((prev) => [...prev, ...data.events]);
      setHasMore(p < data.pages);
      setPage(p + 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetch(true);
  }, [category, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
        {user && <Link to="/events/create" className="btn-primary text-sm">+ Create Event</Link>}
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search events..." />
      <CategoryFilter categories={EVENT_CATEGORIES} selected={category} onChange={setCategory} />

      {loading ? <LoadingSpinner text="Loading events..." /> : (
        events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-lg font-medium">No events found</p>
          </div>
        ) : (
          <InfiniteScroll dataLength={events.length} next={() => fetch(false)} hasMore={hasMore} loader={<LoadingSpinner size="sm" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => <EventCard key={event._id} event={event} />)}
            </div>
          </InfiniteScroll>
        )
      )}
    </div>
  );
};

export default EventsPage;
