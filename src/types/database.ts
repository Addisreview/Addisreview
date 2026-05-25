export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
  Row: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    is_business_owner: boolean;
    review_count: number;
    gender: string | null;
    phone: string | null;
    created_at: string;
  };
  Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'review_count'>;
  Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
};
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          category_id: string | null;
          category_name: string | null;
          city_id: string | null;
          city_name: string | null;
          address: string | null;
          neighborhood: string | null;
          lat: number | null;
          lng: number | null;
          phone: string | null;
          website: string | null;
          email: string | null;
          hours: Json;
          features: string[];
          price_range: number | null;
          google_place_id: string | null;
          google_rating: number | null;
          google_photo_ref: string | null;
          photos: string[];
          cover_photo_url: string | null;
          rating_avg: number;
          review_count: number;
          is_verified: boolean;
          is_featured: boolean;
          is_active: boolean;
          claimed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['businesses']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['businesses']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          author_name: string;
          rating: number;
          body: string;
          tags: string[];
          photo_urls: string[];
          helpful_count: number;
          is_flagged: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'helpful_count' | 'is_flagged' | 'is_approved' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      cities: {
        Row: {
          id: string;
          name: string;
          name_am: string | null;
          emoji: string | null;
          region: string | null;
          lat: number | null;
          lng: number | null;
          place_count: number;
          is_active: boolean;
          created_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          emoji: string | null;
          sort_order: number;
        };
      };
      saved_businesses: {
        Row: {
          user_id: string;
          business_id: string;
          created_at: string;
        };
        Insert: { user_id: string; business_id: string };
      };
    };
    Functions: {
      search_businesses: {
        Args: {
          search_query?: string;
          city_filter?: string;
          cat_filter?: string;
          min_rating?: number;
          price_filter?: number[];
          open_now?: boolean;
          sort_by?: string;
          page_num?: number;
          page_size?: number;
        };
        Returns: Array<Database['public']['Tables']['businesses']['Row'] & { total_count: number }>;
      };
    };
  };
}

// ── Convenience types ─────────────────────────────────────
export type Business = Database['public']['Tables']['businesses']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type City = Database['public']['Tables']['cities']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

export type BusinessWithCount = Business & { total_count: number };
