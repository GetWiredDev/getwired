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
  return {
    title: name,
    description: cat?.description ?? `Browse posts in ${name}`,
    openGraph: {
      title: `${name} | Forums | GetWired.dev`,
      description: cat?.description ?? `Browse posts in ${name}`,
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

