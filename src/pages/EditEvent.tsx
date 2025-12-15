import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/types/database';

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  useEffect(() => {
    if (id && user) fetchEvent();
  }, [id, user]);

  const fetchEvent = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/');
      return;
    }

    const eventData = data as Event;
    setEvent(eventData);
    setTitle(eventData.title);
    setDescription(eventData.description || '');
    setLocationName(eventData.location_name || '');
    setLocationUrl(eventData.location_url || '');
    setStartDate(eventData.start_date.slice(0, 16));
    setEndDate(eventData.end_date.slice(0, 16));
    setPrice(eventData.price?.toString() || '0');
    setIsFree(eventData.is_free);
    setRequiresApproval(eventData.requires_approval);
    setMaxCapacity(eventData.max_capacity?.toString() || '');
    setCoverImageUrl(eventData.cover_image_url || '');
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('events')
      .update({
        title,
        description: description || null,
        location_name: locationName || null,
        location_url: locationUrl || null,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        price: isFree ? 0 : parseFloat(price) || 0,
        is_free: isFree,
        requires_approval: requiresApproval,
        max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
        cover_image_url: coverImageUrl || null,
      })
      .eq('id', event.id);

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Evento atualizado!' });
      navigate(`/event/${event.id}`);
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!event || event.organizer_id !== user?.id) {
    return <Navigate to="/" />;
  }

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Editar Evento</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">URL da Capa</Label>
                <Input
                  id="cover"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data e Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Início *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Término *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Nome do Local</Label>
                <Input
                  id="location"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ex: Centro de Convenções"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationUrl">Link do Local</Label>
                <Input
                  id="locationUrl"
                  type="url"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="free">Evento Gratuito</Label>
                <Switch
                  id="free"
                  checked={isFree}
                  onCheckedChange={setIsFree}
                />
              </div>

              {!isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="approval">Requer Aprovação</Label>
                <Switch
                  id="approval"
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade Máxima</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  placeholder="Deixe em branco para ilimitado"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
