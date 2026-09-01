export type ProfileRow = {
  created_at: string;
  display_name: string | null;
  id: string;
  locale: string;
  updated_at: string;
};

export type UserConsentPurpose =
  | 'account_terms'
  | 'bible_sync'
  | 'privacy_policy';

export type UserConsentRow = {
  decided_at: string;
  granted: boolean;
  policy_version: string;
  purpose: UserConsentPurpose;
  revoked_at: string | null;
  user_id: string;
};

export type BibleReadingProgressRow = {
  book_id: string;
  chapter: number;
  updated_at: string;
  user_id: string;
  verse: number | null;
  version_id: 'rvr1909' | 'webp';
};

export type BibleFavoriteRow = {
  favorited: boolean;
  updated_at: string;
  user_id: string;
  verse_key: string;
};

export type Database = {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      bible_favorites: {
        Insert: {
          favorited?: boolean;
          updated_at?: string;
          user_id: string;
          verse_key: string;
        };
        Relationships: [];
        Row: BibleFavoriteRow;
        Update: {
          favorited?: boolean;
          updated_at?: string;
        };
      };
      bible_reading_progress: {
        Insert: {
          book_id: string;
          chapter: number;
          updated_at?: string;
          user_id: string;
          verse?: number | null;
          version_id: 'rvr1909' | 'webp';
        };
        Relationships: [];
        Row: BibleReadingProgressRow;
        Update: {
          book_id?: string;
          chapter?: number;
          updated_at?: string;
          verse?: number | null;
          version_id?: 'rvr1909' | 'webp';
        };
      };
      profiles: {
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          locale?: string;
          updated_at?: string;
        };
        Relationships: [];
        Row: ProfileRow;
        Update: {
          display_name?: string | null;
          locale?: string;
          updated_at?: string;
        };
      };
      user_consents: {
        Insert: {
          decided_at?: string;
          granted: boolean;
          policy_version: string;
          purpose: UserConsentPurpose;
          revoked_at?: string | null;
          user_id: string;
        };
        Relationships: [];
        Row: UserConsentRow;
        Update: {
          decided_at?: string;
          granted?: boolean;
          policy_version?: string;
          revoked_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
  };
};
