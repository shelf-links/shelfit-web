export interface LinkRow {
  id: string;
  url: string;
  title: string | null;
  ai_summary: string | null;
  ai_category: string | null;
  platform?: string | null;
}

export interface SaveRow {
  id: string;
  saved_at: string;
  links: LinkRow | null;
}
