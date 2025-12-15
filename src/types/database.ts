export type AppRole = 'user' | 'organizer';
export type EventStatus = 'draft' | 'published' | 'finished';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'checked_in';
export type FriendshipStatus = 'pending' | 'accepted';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: AppRole;
  bio: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  location_name: string | null;
  location_url: string | null;
  start_date: string;
  end_date: string;
  price: number;
  is_free: boolean;
  requires_approval: boolean;
  max_capacity: number | null;
  status: EventStatus;
  cover_image_url: string | null;
  created_at: string;
  organizer?: Profile;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  qr_code_hash: string;
  checkin_count: number;
  created_at: string;
  event?: Event;
  user?: Profile;
}

export interface Friendship {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  event_context_id: string;
  created_at: string;
  requester?: Profile;
  receiver?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Review {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: Profile;
}