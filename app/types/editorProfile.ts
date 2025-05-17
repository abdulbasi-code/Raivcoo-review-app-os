// types/editorProfile.ts

export interface EditorProfile {
  password_data: any;
  is_verified: boolean;
  id: string;
  email: any;
  user_id: string;
  title?: string;
  full_name: string;
  display_name: string;
  country: string;
  avatar_url: string;
  account_status: string;
}

export interface EditorPortfolioProps {
  portfolio: EditorProfile;
  email: string | undefined;
  updatePortfolio: (formData: FormData) => Promise<{
    message: string;
    updatedPortfolio: EditorProfile | null;
  }>;
}
