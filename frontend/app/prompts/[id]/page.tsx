import type { Metadata } from "next";
import { PromptDetailPage } from "./PromptDetailPage";

export const metadata: Metadata = {
  title: "Prompt details | Prompt Archive",
  description: "View a saved Prompt Archive entry and its variants.",
};

// Prompt IDs are not known at build time — they are created at runtime.
// We emit one placeholder path so Next.js includes the route's JS bundle in the
// static export. The Electron app:// protocol's SPA fallback serves index.html
// for any /prompts/[real-id] path, and client-side routing renders this
// component via useParams() with the real ID.
export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function Page() {
  return <PromptDetailPage />;
}
