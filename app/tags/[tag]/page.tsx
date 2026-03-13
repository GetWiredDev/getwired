import { redirect } from "next/navigation";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  redirect(`/search?q=${encodeURIComponent(tag)}`);
}

