import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Sparkles, CalendarDays } from 'lucide-react';
import { startOfDay, endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import type { Event } from '@/types/database';

export default function Home() {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, organizer:profiles!events_organizer_id_fkey(*)')
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (!error && data) {
      setEvents(data as Event[]);
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Apply filters
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !event.title.toLowerCase().includes(query) &&
        !event.description?.toLowerCase().includes(query) &&
        !event.location_name?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Price filter
    if (showFreeOnly && !event.is_free) return false;
    if (showPaidOnly && event.is_free) return false;

    // Date filter
    const eventDate = new Date(event.start_date);
    const now = new Date();
    
    if (dateFilter === 'today') {
      if (eventDate < startOfDay(now) || eventDate > endOfDay(now)) return false;
    } else if (dateFilter === 'week') {
      if (eventDate < now || eventDate > endOfWeek(now, { weekStartsOn: 0 })) return false;
    } else if (dateFilter === 'month') {
      if (eventDate < now || eventDate > endOfMonth(now)) return false;
    }

    return true;
  });

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">EventSync</h1>
          </div>
          <p className="text-muted-foreground">Descubra eventos incríveis</p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <EventFilters
            showFreeOnly={showFreeOnly}
            setShowFreeOnly={setShowFreeOnly}
            showPaidOnly={showPaidOnly}
            setShowPaidOnly={setShowPaidOnly}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        </div>

        {/* Events list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div 
                key={event.id} 
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-slide-up"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery || showFreeOnly || showPaidOnly || dateFilter !== 'all'
                ? 'Nenhum evento encontrado'
                : 'Nenhum evento disponível'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || showFreeOnly || showPaidOnly || dateFilter !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Que tal criar o primeiro?'}
            </p>
            {!searchQuery && !showFreeOnly && !showPaidOnly && dateFilter === 'all' && (
              <Link to="/create-event">
                <Button>Criar evento</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
