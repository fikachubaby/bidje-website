import { AdminView } from "@/types/property";

export const VIEW_META: Record<AdminView, { title: string; subtitle: string }> = {
    dashboard: {
        title: "Dashboard",
        subtitle: "Overview of your property listings and buyer activity.",
    },
    properties: {
        title: "Property management",
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
        title: "Advertisements",
        subtitle: "Manage banner and promotional advertisements.",
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
};