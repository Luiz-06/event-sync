import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, MapPin, Users, Clock, ArrowLeft, Settings, 
  Loader2, ExternalLink, CheckCircle2, AlertCircle, UserPlus, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Event, Registration, Profile } from '@/types/database';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id, user]);

  const fetchEventDetails = async () => {
    if (!id) return;

    const { data: eventData, error } = await supabase
      .from('events')
      .select('*, organizer:profiles!events_organizer_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !eventData) {
      navigate('/');
      return;
    }
    setEvent(eventData as Event);

    if (user) {
      const { data: regData } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setRegistration(regData as Registration | null);

      if (regData && (regData.status === 'approved' || regData.status === 'checked_in')) {
        const { data: parts } = await supabase
          .from('registrations')
          .select('user:profiles(*)')
          .eq('event_id', id)
          .in('status', ['approved', 'checked_in']);
        
        if (parts) {
          const profiles = parts.map((p: any) => p.user).filter((p: any) => p.id !== user.id);
          setParticipants(profiles);
        }
      }
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!event || !user) return;

    if (!event.is_free && event.price && event.price > 0) {
      setShowPixModal(true);
      return;
    }

    await submitRegistration();
  };

  const submitRegistration = async () => {
    if (!event || !user) return;
    setIsRegistering(true);
    
    const finalStatus: 'pending' | 'approved' = event.requires_approval ? 'pending' : 'approved';

    const { error } = await supabase.from('registrations').insert([{
      event_id: event.id,
      user_id: user.id,
      status: finalStatus,
    }]);

    if (!error) {
      toast({ title: 'Inscrição realizada!' });
      setShowPixModal(false);
      fetchEventDetails();
    } else {
      toast({ title: 'Erro ao se inscrever', description: error.message, variant: 'destructive' });
    }
    setIsRegistering(false);
  };

  const handleFriendRequest = async (targetId: string) => {
    if(!event || !user) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      receiver_id: targetId,
      event_context_id: event.id,
      status: 'pending'
    });
    
    if(!error) toast({ title: 'Solicitação de amizade enviada!' });
    else toast({ title: 'Erro ou solicitação já existe', variant: 'destructive' });
  };

  const submitReview = async () => {
    // TODO: Implement when reviews table is created
    toast({ title: 'Avaliação será implementada em breve!' });
    setShowReviewModal(false);
  };

  if (authLoading || isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!event) return <Navigate to="/" replace />;

  const isOwner = event.organizer_id === user.id;

  return (
    <AppLayout>
      <div className="min-h-screen pb-32">
        <div className="relative h-56 md:h-72 bg-muted">
          {event.cover_image_url ? (
            <img src={event.cover_image_url} className="w-full h-full object-cover" alt={event.title} />
          ) : <div className="w-full h-full gradient-hero" />}
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 bg-background/80" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {isOwner && (
            <Button variant="secondary" size="sm" className="absolute top-4 right-4 gap-2" onClick={() => navigate(`/manage/${event.id}`)}>
              <Settings className="h-4 w-4" /> Gerenciar
            </Button>
          )}
        </div>

        <div className="container px-4 -mt-16 relative z-10 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex gap-2 mb-3">
                <Badge variant={event.is_free ? "default" : "secondary"}>
                  {event.is_free ? 'Gratuito' : `R$ ${event.price?.toFixed(2)}`}
                </Badge>
                {event.status === 'finished' && <Badge variant="outline">Finalizado</Badge>}
              </div>
              <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{format(new Date(event.start_date), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                </div>
                {event.location_name && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{event.location_name}</span>
                  </div>
                )}
              </div>

              {!isOwner && !registration && event.status === 'published' && (
                <Button className="w-full mt-6" size="lg" onClick={handleRegister} disabled={isRegistering}>
                  {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Inscrever-se
                </Button>
              )}

              {registration && (
                <div className="mt-6 p-4 bg-muted rounded-lg flex items-center gap-3">
                  {registration.status === 'approved' || registration.status === 'checked_in' ? 
                    <CheckCircle2 className="text-success h-6 w-6" /> : 
                    <Clock className="text-warning h-6 w-6" />
                  }
                  <div>
                    <p className="font-medium">
                      {registration.status === 'pending' ? 'Aguardando Aprovação' : 
                       'Inscrição Confirmada'}
                    </p>
                  </div>
                </div>
              )}

              {event.status === 'finished' && registration?.status === 'checked_in' && (
                <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => setShowReviewModal(true)}>
                  <Star className="h-4 w-4" /> Avaliar Evento
                </Button>
              )}
            </CardContent>
          </Card>

          {participants.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Quem vai</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {participants.map(part => (
                  <div key={part.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{part.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{part.full_name}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleFriendRequest(part.id)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>Valor: R$ {event.price?.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded text-center break-all font-mono text-sm">
            00020126580014br.gov.bcb.pix0136{event.organizer_id.slice(0, 8)}...
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Faça o PIX e clique abaixo para confirmar.
          </p>
          <DialogFooter>
            <Button onClick={() => submitRegistration()} disabled={isRegistering}>
              {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Já fiz o pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Avaliar Evento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nota</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n} Estrelas</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comentário</Label>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="O que achou do evento?" />
            </div>
            <Button onClick={submitReview} className="w-full">Enviar Avaliação</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}