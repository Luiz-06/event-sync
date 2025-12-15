import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { 
  Loader2, LogOut, Calendar, ChevronRight, Edit2,
  Sparkles, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Event } from '@/types/database';

export default function Profile() {
  const { user, profile, loading, signOut } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setMyEvents(data as Event[]);
    }
    setIsLoadingEvents(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
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

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Profile header */}
        <Card className="shadow-card mb-6 animate-slide-up overflow-hidden">
          <div className="h-20 gradient-hero" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-12">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xl gradient-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <h1 className="mt-4 text-xl font-bold text-foreground">
                {profile?.full_name || 'Usuário'}
              </h1>
              <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
              <div className="flex gap-2">
                <Badge variant={profile?.role === 'organizer' ? 'default' : 'secondary'}>
                  {profile?.role === 'organizer' ? (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Organizador
                    </>
                  ) : (
                    'Participante'
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My events section */}
        {myEvents.length > 0 && (
          <div className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Meus Eventos
            </h2>
            <div className="space-y-2">
              {myEvents.slice(0, 3).map((event) => (
                <Link key={event.id} to={`/manage/${event.id}`}>
                  <Card className="shadow-card hover:shadow-card-hover transition-all duration-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          {event.cover_image_url ? (
                            <img
                              src={event.cover_image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full gradient-hero" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {event.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.start_date), "d MMM, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                          {event.status === 'published' ? 'Publicado' : event.status === 'draft' ? 'Rascunho' : 'Encerrado'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {myEvents.length > 3 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  E mais {myEvents.length - 3} evento{myEvents.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile?.bio && (
          <Card className="shadow-card mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-2">Sobre</h3>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="shadow-card animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>

      <EditProfileModal open={showEditModal} onOpenChange={setShowEditModal} />
    </AppLayout>
  );
}
