export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  referral_code: string;
  email_verified: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  total_videos: number;
  is_active: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  course_id: string;
  slot_number: number;
  title: string;
  description: string;
  video_url: string | null;
  duration: string | null;
  is_published: boolean;
  is_intro: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  status: string;
  reward_amount: number;
  created_at: string;
}
