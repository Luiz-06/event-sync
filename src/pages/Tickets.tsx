import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { TicketCard } from '@/components/tickets/TicketCard';
import { QRCodeModal } from '@/components/tickets/QRCodeModal';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket } from 'lucide-react';
import type { Registration } from '@/types/database';

export default function Tickets() {
  const { user, loading } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('registrations')
      .select('*, event:events(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRegistrations(data as Registration[]);
    }
    setIsLoading(false);
  };

  const handleTicketClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowQRModal(true);
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
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-1">Meus Ingressos</h1>
          <p className="text-muted-foreground">Suas inscrições em eventos</p>
        </div>

        {/* Tickets list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrations.length > 0 ? (
          <div className="space-y-4">
            {registrations.map((registration, index) => (
              <div 
                key={registration.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-slide-up"
              >
                <TicketCard
                  registration={registration}
                  onClick={() => handleTicketClick(registration)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Nenhum ingresso</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suas inscrições em eventos aparecerão aqui
            </p>
            <Link to="/">
              <Button variant="outline">Explorar Eventos</Button>
            </Link>
          </div>
        )}
      </div>

      <QRCodeModal
        registration={selectedRegistration}
        open={showQRModal}
        onOpenChange={setShowQRModal}
      />
    </AppLayout>
  );
}
