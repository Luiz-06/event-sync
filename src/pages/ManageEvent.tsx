import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Loader2, Download, Trash2, Edit2, UserCheck } from 'lucide-react'; //
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Event, Registration } from '@/types/database';

export default function ManageEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (id && user) fetchData();
  }, [id, user]);

  const fetchData = async () => {
    if(!id) return;
    const { data } = await supabase.from('events').select('*').eq('id', id).single();
    setEvent(data as Event);
    const { data: regs } = await supabase.from('registrations').select('*, user:profiles(*)').eq('event_id', id);
    setRegistrations(regs as Registration[] || []);
  };

  const updateStatus = async (regId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'checked_in') => {
    const { error } = await supabase.from('registrations').update({ status: newStatus }).eq('id', regId);
    
    if (!error) {
      toast({ title: newStatus === 'checked_in' ? 'Check-in realizado!' : 'Status atualizado!' });
      fetchData();
    } else {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const finishEvent = async () => {
    await supabase.from('events').update({ status: 'finished' }).eq('id', id);
    toast({ title: 'Evento finalizado! Certificados liberados.' });
    fetchData();
  };

  const deleteEvent = async () => {
    await supabase.from('registrations').delete().eq('event_id', id);
    await supabase.from('events').delete().eq('id', id);
    toast({ title: 'Evento excluído!' });
    navigate('/');
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Status', 'Email'];
    const rows = registrations.map(reg => [
      reg.user?.full_name || '',
      reg.status,
      // @ts-ignore - email pode não estar tipado no join mas vem do banco se as policies permitirem
      reg.user?.email || '' 
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event?.title || 'participantes'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Lista exportada!' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-success-foreground">Aprovado</Badge>;
      case 'checked_in': return <Badge className="bg-primary text-primary-foreground">Presente</Badge>;
      case 'pending': return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      case 'rejected': return <Badge variant="destructive">Recusado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!event) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (event.organizer_id !== user?.id) return <Navigate to="/" />;

  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-24">
        {/* Cabeçalho igual ao anterior */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold truncate max-w-[200px]">{event.title}</h1>
          </div>
          <div className="flex gap-2">
            <Link to={`/edit-event/${event.id}`}>
              <Button variant="outline" size="icon"><Edit2 className="h-4 w-4" /></Button>
            </Link>
            <Button variant="outline" size="icon" onClick={exportCSV}>
              <Download className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteEvent} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {event.status !== 'finished' && (
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={finishEvent}>Finalizar Evento</Button>
          </div>
        )}

        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list">Participantes</TabsTrigger>
            <TabsTrigger value="pending">Solicitações Pendentes</TabsTrigger>
          </TabsList>

          {/* ABA 1: LISTA GERAL E CHECK-IN MANUAL */}
          <TabsContent value="list" className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Gerenciar Presença</h3>
              {registrations.filter(r => ['approved', 'checked_in'].includes(r.status)).length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhum participante aprovado ainda.</p>
              )}
              
              {registrations.filter(r => ['approved', 'checked_in'].includes(r.status)).map(reg => (
                <Card key={reg.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{reg.user?.full_name}</p>
                      {getStatusBadge(reg.status)}
                    </div>
                    {reg.status !== 'checked_in' && (
                      <Button size="sm" onClick={() => updateStatus(reg.id, 'checked_in')}>
                        <UserCheck className="mr-2 h-4 w-4" /> Check-in
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ABA 2: PENDENTES (Aprovação) */}
          <TabsContent value="pending" className="space-y-3">
            {registrations.filter(r => r.status === 'pending').map(reg => (
              <Card key={reg.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{reg.user?.full_name}</p>
                    <Badge variant="outline" className="text-warning border-warning">Pendente</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => updateStatus(reg.id, 'approved')}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => updateStatus(reg.id, 'rejected')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {registrations.filter(r => r.status === 'pending').length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma solicitação pendente.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}