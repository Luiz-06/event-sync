import { Calendar, MapPin, CheckCircle2, Clock, XCircle, Download } from 'lucide-react'; //
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Registration, RegistrationStatus } from '@/types/database';
import jsPDF from "jspdf";

interface TicketCardProps {
  registration: Registration;
}

const statusConfig: Record<RegistrationStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', className: 'bg-warning text-warning-foreground', icon: Clock },
  approved: { label: 'Aprovado', className: 'bg-success text-success-foreground', icon: CheckCircle2 },
  rejected: { label: 'Recusado', className: 'bg-destructive text-destructive-foreground', icon: XCircle },
  checked_in: { label: 'Check-in', className: 'bg-primary text-primary-foreground', icon: CheckCircle2 },
};

export function TicketCard({ registration }: TicketCardProps) {
  const { event } = registration;
  const status = statusConfig[registration.status] || statusConfig.pending; 
  const StatusIcon = status.icon;
  
  if (!event) return null;

  const startDate = new Date(event.start_date);
  const showCertificate = registration.status === 'checked_in' && event.status === 'finished';

  const downloadCertificate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = new jsPDF({ orientation: 'landscape' });
    // Lógica do PDF mantida
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(40);
    doc.text("Certificado de Participação", 148, 60, { align: "center" });
    doc.setFontSize(20);
    doc.text("Certificamos que", 148, 90, { align: "center" });
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text(registration.user?.full_name || "Participante", 148, 110, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.text(`Participou com êxito do evento: ${event.title}`, 148, 135, { align: "center" });
    doc.text(`Realizado em: ${format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 148, 145, { align: "center" });
    doc.setDrawColor(200, 200, 200);
    doc.line(70, 170, 227, 170);
    doc.setFontSize(12);
    doc.text("Assinatura do Organizador", 148, 180, { align: "center" });
    doc.save(`certificado_${event.id}.pdf`);
  };

  return (
    <Card className="overflow-hidden shadow-card animate-slide-up">
      <div className="flex">
        <div className="relative w-28 md:w-36 shrink-0 bg-muted">
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

        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground line-clamp-2 text-sm md:text-base">
                {event.title}
              </h3>
              <Badge className={cn("shrink-0 gap-1", status.className)}>
                <StatusIcon className="h-3 w-3" />
                <span className="hidden sm:inline">{status.label}</span>
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>
                  {format(startDate, "d MMM, HH:mm", { locale: ptBR })}
                </span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{event.location_name}</span>
                </div>
              )}
            </div>
          </div>

          {showCertificate && (
            <Button size="sm" variant="outline" className="w-full mt-2 gap-2 text-xs h-8" onClick={downloadCertificate}>
              <Download className="h-3 w-3" /> Certificado
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
}