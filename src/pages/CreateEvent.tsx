import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, ArrowLeft, ImagePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const eventSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  location_name: z.string().optional(),
  location_url: z.string().url().optional().or(z.literal('')),
  start_date: z.date({ message: 'Data de início obrigatória' }),
  start_time: z.string().min(1, 'Horário de início obrigatório'),
  end_date: z.date({ message: 'Data de término obrigatória' }),
  end_time: z.string().min(1, 'Horário de término obrigatório'),
  is_free: z.boolean(),
  price: z.number().min(0).optional(),
  max_capacity: z.number().min(1).optional(),
  requires_approval: z.boolean(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      is_free: true,
      requires_approval: false,
      start_time: '09:00',
      end_time: '18:00',
    },
  });

  const isFree = watch('is_free');
  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    // Combine date and time
    const startDateTime = new Date(data.start_date);
    const [startHour, startMinute] = data.start_time.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(data.end_date);
    const [endHour, endMinute] = data.end_time.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const { error } = await supabase.from('events').insert({
      organizer_id: user.id,
      title: data.title,
      description: data.description || null,
      location_name: data.location_name || null,
      location_url: data.location_url || null,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
      is_free: data.is_free,
      price: data.is_free ? 0 : data.price || 0,
      max_capacity: data.max_capacity || null,
      requires_approval: data.requires_approval,
      cover_image_url: data.cover_image_url || null,
      status: 'published',
    });

    if (error) {
      toast({
        title: 'Erro ao criar evento',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Evento criado!',
        description: 'Seu evento foi publicado com sucesso.',
      });

      // Update user role to organizer if not already
      if (profile?.role !== 'organizer') {
        await supabase
          .from('profiles')
          .update({ role: 'organizer' })
          .eq('id', user.id);
      }

      navigate('/');
    }

    setIsSubmitting(false);
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

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-slide-up">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Criar Evento</h1>
            <p className="text-muted-foreground text-sm">Preencha os detalhes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic info */}
          <Card className="shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">Informações básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do evento *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Workshop de React"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu evento..."
                  rows={4}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image_url">URL da imagem de capa</Label>
                <div className="relative">
                  <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cover_image_url"
                    placeholder="https://..."
                    className="pl-10"
                    {...register('cover_image_url')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and time */}
          <Card className="shadow-card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Data e horário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yy") : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setValue('start_date', date)}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Horário *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...register('start_time')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de término *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yy") : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setValue('end_date', date)}
                        disabled={(date) => date < (startDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.end_date && (
                    <p className="text-sm text-destructive">{errors.end_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Horário *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...register('end_time')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location_name">Nome do local</Label>
                <Input
                  id="location_name"
                  placeholder="Ex: Centro de Convenções"
                  {...register('location_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_url">Link do mapa (opcional)</Label>
                <Input
                  id="location_url"
                  placeholder="https://maps.google.com/..."
                  {...register('location_url')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Price and capacity */}
          <Card className="shadow-card animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Preço e vagas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_free">Evento gratuito</Label>
                  <p className="text-sm text-muted-foreground">
                    Sem cobrança de ingresso
                  </p>
                </div>
                <Switch
                  id="is_free"
                  checked={isFree}
                  onCheckedChange={(checked) => setValue('is_free', checked)}
                />
              </div>

              {!isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">Preço do ingresso (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="max_capacity">Capacidade máxima (opcional)</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  min="1"
                  placeholder="Ex: 100"
                  {...register('max_capacity', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <Label htmlFor="requires_approval">Aprovar inscrições</Label>
                  <p className="text-sm text-muted-foreground">
                    Revise cada inscrição antes de aprovar
                  </p>
                </div>
                <Switch
                  id="requires_approval"
                  checked={watch('requires_approval')}
                  onCheckedChange={(checked) => setValue('requires_approval', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar evento
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
