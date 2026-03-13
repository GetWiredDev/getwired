import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — GetWired.dev",
  description: "Learn about GetWired.dev, the all-in-one tech community platform.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-foreground">About GetWired.dev</h1>

      <div className="space-y-6 text-foreground/80 leading-relaxed">
        <p>
          <strong className="text-foreground">GetWired.dev</strong> is the all-in-one tech community
          platform built for developers, engineers, and tech enthusiasts who want to connect, learn,
          and grow together.
        </p>

        <h2 className="text-xl font-semibold text-foreground pt-2">What we offer</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Forums</strong> — Discuss topics across categories like AI/ML, Web Dev, Mobile, Hardware, Cybersecurity, Startups, and more.</li>
          <li><strong>Real-time Chat</strong> — Public rooms, private groups, and direct messages with thread support and reactions.</li>
          <li><strong>Tech News</strong> — Curated RSS feeds from top tech publications, aggregated in one place.</li>
          <li><strong>Profiles</strong> — Showcase your tech stack, build your Tech CV, and track your community karma.</li>
          <li><strong>Marketplace</strong> — Boost your content with promoted posts and sponsored placements.</li>
          <li><strong>Events</strong> — Discover hackathons, meetups, and conferences in the tech community.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground pt-2">Built with</h2>
        <p>
          GetWired.dev is built with Next.js, Convex, Clerk, and Tailwind CSS. The platform is
          open-source and community-driven.
        </p>

        <h2 className="text-xl font-semibold text-foreground pt-2">Get in touch</h2>
        <p>
          Have feedback, questions, or want to contribute? Reach out via the community chat or
          email us at <a href="mailto:hello@getwired.dev" className="text-[#3B82F6] hover:underline">hello@getwired.dev</a>.
        </p>
      </div>
    </main>
  );
}

