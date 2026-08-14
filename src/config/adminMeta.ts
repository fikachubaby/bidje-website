import { AdminView } from "@/types/property";

export const VIEW_META: Record<AdminView, { title: string; subtitle: string }> = {
    dashboard: {
        title: "Dashboard",
        subtitle: "Overview of your property listings and buyer activity.",
    },
    properties: {
        title: "Property Manager",
        subtitle: "Add, edit, publish, duplicate, or delete listings.",
    },
    subscribers: {
        title: "Subscribers",
        subtitle: "Manage newsletter and alert subscribers.",
    },
    offers: {
        title: "Buyer Offers",
        subtitle: "Review incoming offers and update their status.",
    },
    ads: {
        title: "Advertisement Manager",
        subtitle: "Manage dynamic banners, featured boosts, and native promo slots.",
    },
    imports: {
        title: "Telegram Import",
        subtitle: "Upload a Telegram Desktop JSON export and review property listings.",
    },
    users: {
        title: "Staff & User Roles",
        subtitle: "Manage staff accounts and permissions/roles.",
    },
    "audit-logs": {
        title: "Audit Logs",
        subtitle: "Track administrator activities and modifications across the portal.",
    },
    profile: {
        title: "My Profile",
        subtitle: "Update your account profile details, name, or change password.",
    },
    legals: {
        title: "Legal Consultants",
        subtitle: "Manage legal consultants and update their status",
    },
    financials: {
        title: "Financial Consultants",
        subtitle: "Manage financial consultants and update their status",
    },
};