import type { Metadata } from "next";
import { DEMO_CATEGORIES } from "@/lib/demo-data";
import { CategoryFeedClient } from "./CategoryFeedClient";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = DEMO_CATEGORIES.find((c) => c.slug === slug);
  const name = cat?.name ?? "Category";
  const desc = cat?.description ?? `Browse posts in ${name}`;
  return {
    title: name,
    description: desc,
    openGraph: {
      title: `${name} | Forums | GetWired.dev`,
      description: desc,
    },
    twitter: {
      card: "summary",
      title: `${name} | Forums | GetWired.dev`,
      description: desc,
    },
  };
}

export function generateStaticParams() {
  return DEMO_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  return <CategoryFeedClient slug={category} />;
}

