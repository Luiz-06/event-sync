import { Calendar, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Registration } from '@/types/database';

interface QRCodeModalProps {
  registration: Registration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeModal({ registration, open, onOpenChange }: QRCodeModalProps) {
  if (!registration?.event) return null;

  const { event, qr_code_hash, checkin_count } = registration;
  const startDate = new Date(event.start_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-card rounded-xl border border-border">
            <div className="p-4 bg-background rounded-lg shadow-card">
              <QRCode
                value={qr_code_hash}
                size={180}
                level="H"
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              />
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {format(startDate, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            {event.location_name && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.location_name}</span>
              </div>
            )}

            {checkin_count > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  {checkin_count} check-in{checkin_count > 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>

          {/* QR Code Hash */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Código do ingresso</p>
            <p className="font-mono text-sm text-foreground break-all">
              {qr_code_hash.slice(0, 16)}...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
