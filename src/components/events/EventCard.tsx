import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Event } from '@/types/database';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_date);
  
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group animate-slide-up">
        <div className="relative aspect-[16/9] overflow-hidden">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full gradient-hero opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            {event.is_free ? (
              <Badge className="bg-success text-success-foreground font-semibold">
                Gratuito
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-semibold">
                R$ {event.price?.toFixed(2)}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-primary-foreground line-clamp-2 drop-shadow-md">
              {event.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {format(startDate, "d 'de' MMMM, HH:mm", { locale: ptBR })}
            </span>
          </div>

          {event.location_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}

          {event.max_capacity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>{event.max_capacity} vagas</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
