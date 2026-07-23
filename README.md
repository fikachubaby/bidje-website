# Bidje

Malaysia's modern property marketplace built with Next.js 15, React, TypeScript, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/properties/   # REST API (ready for DB integration)
│   └── properties/[id]/  # Property detail page
├── components/
│   ├── home/             # Homepage sections
│   ├── layout/           # Navbar, Footer
│   └── properties/       # PropertyCard, etc.
├── data/                 # Mock seed data (replace with DB)
├── lib/                  # Data access & utilities
└── types/                # Shared TypeScript interfaces
```

## Tech Stack

- **Next.js 15** — App Router, Server Components
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** — Icons

## Brand Colors

| Color  | Hex       |
|--------|-----------|
| White  | `#ffffff` |
| Black  | `#0a0a0a` |
| Orange | `#ff6b00` |

## Future Database Integration

Replace functions in `src/lib/properties.ts` with real database queries (Prisma, Drizzle, Supabase, etc.). The `Property` type in `src/types/property.ts` maps directly to a database schema.
