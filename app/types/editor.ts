// editors/[name]/editor.ts

export interface EditorProfile {
  id: string;
  user_id: string;
  full_name: string;
  display_name: string;
  email: string;
  avatar_url: string;
  is_verified: boolean;
  account_status: string;
}
