export type PolicySlug = "privacy-policy" | "terms-of-service" | "cookie-policy";

export interface PolicyDocument {
    id: string;
    slug: PolicySlug;
    title: string;
    content: string; // Plain text, HTML, or Markdown
    is_published: boolean;
    updated_at: string;
    created_at?: string;
}