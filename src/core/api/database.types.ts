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

export type Database = {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
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
