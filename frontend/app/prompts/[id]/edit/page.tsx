import type { Metadata } from "next";
import { EditPromptPage } from "./EditPromptPage";

export const metadata: Metadata = {
  title: "Edit prompt | Prompt Archive",
  description: "Edit a saved Prompt Archive entry.",
};

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function Page() {
  return <EditPromptPage />;
}
