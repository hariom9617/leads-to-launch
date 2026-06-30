/** Raw row shapes returned from Supabase — snake_case mirrors the DB columns. */

export type DbLead = {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  reviews_count: number | null;
  lat: number;
  lng: number;
  photos_count: number | null;
  years_in_business: number | null;
  created_at: string;
};

export type DbAudit = {
  id: number;
  lead_id: string;
  pagespeed_score: number;
  has_website: boolean;
  mobile_friendly: boolean;
  https: boolean;
  has_schema: boolean;
  load_time_ms: number;
  gaps: string[];
  biggest_gap: string;
  est_lost_revenue_per_month: number;
  created_at: string;
};

export type DbPrompt = {
  id: number;
  lead_id: string;
  platform: string;
  prompt: string;
  created_at: string;
};

export type DbOutreachDraft = {
  id: number;
  lead_id: string;
  channel: string;
  language: string;
  first_message: string;
  follow_up: string;
  created_at: string;
};
