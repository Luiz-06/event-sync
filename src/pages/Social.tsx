import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Profile } from '@/types/database';

export default function Social() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<(Profile & { friendship_id: string })[]>([]);
  const [requests, setRequests] = useState<(Profile & { friendship_id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSocialData();
  }, [user]);

  const fetchSocialData = async () => {
    if (!user) return;
    
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*, requester:profiles!friendships_requester_id_fkey(*), receiver:profiles!friendships_receiver_id_fkey(*)')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (friendships) {
      const activeFriends: (Profile & { friendship_id: string })[] = [];
      const pendingRequests: (Profile & { friendship_id: string })[] = [];

      friendships.forEach((f: any) => {
        const isRequester = f.requester_id === user.id;
        const otherUser = isRequester ? f.receiver : f.requester;
        
        if (f.status === 'accepted') {
          activeFriends.push({ ...otherUser, friendship_id: f.id });
        } else if (!isRequester && f.status === 'pending') {
          pendingRequests.push({ ...otherUser, friendship_id: f.id });
        }
      });

      setFriends(activeFriends);
      setRequests(pendingRequests);
    }
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
    toast({ title: 'Amizade aceita!' });
    fetchSocialData();
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <AppLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Social</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Em Desenvolvimento</AlertTitle>
          <AlertDescription>
            Esta área está sendo aprimorada. Novas funcionalidades de interação chegarão em breve!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="friends">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="friends">Amigos ({friends.length})</TabsTrigger>
            <TabsTrigger value="requests">Solicitações ({requests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-3">
            {friends.map(friend => (
              <Card key={friend.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{friend.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{friend.full_name}</span>
                </CardContent>
              </Card>
            ))}
            {friends.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum amigo ainda.</p>}
          </TabsContent>

          <TabsContent value="requests">
            {requests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{req.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{req.full_name}</span>
                  </div>
                  <Button size="sm" onClick={() => handleAccept(req.friendship_id)}>Aceitar</Button>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma solicitação pendente.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}