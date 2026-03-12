"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { LogIn, PenLine, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/Avatar";
import { useAppAuth } from "@/lib/auth";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

export function PostComposer() {
  const { user, isSignedIn, signIn } = useAppAuth();
  const createPost = useMutation(api.posts.create);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  if (!isSignedIn || !user) {
    return (
      <div className="glass flex items-center gap-3 rounded-xl px-4 py-4">
        <LogIn className="size-4 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-muted-foreground">
          <button onClick={signIn} className="font-medium text-[#3B82F6] hover:underline cursor-pointer">
            Sign in
          </button>{" "}
          to create a post.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Write something before posting");
      return;
    }

    // Flush any remaining text in the input as a final tag
    const finalTags = [...tags];
    const leftover = tagInput.trim().toLowerCase();
    if (leftover && !finalTags.includes(leftover)) {
      finalTags.push(leftover);
    }

    // Auto-generate a title from the first line / first ~60 chars of content
    const firstLine = content.trim().split("\n")[0] ?? "";
    const autoTitle = firstLine.slice(0, 60) || "Untitled";

    setSubmitting(true);
    try {
      await createPost({
        title: autoTitle,
        content: content.trim(),
        tags: finalTags,
      });

      toast.success("Post created successfully");
      setContent("");
      setTags([]);
      setTagInput("");
      setExpanded(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="glass w-full cursor-pointer rounded-xl p-4 text-left transition-all hover:border-[#3B82F6]/20"
        data-testid="post-composer-trigger"
        aria-label="Create a new post"
      >
        <div className="flex items-center gap-3">
          <UserAvatar src={user.avatarUrl} name={user.displayName} size="md" />
          <span className="flex-1 text-sm text-muted-foreground">
            What&apos;s on your mind, {user.displayName.split(" ")[0]}?
          </span>
          <PenLine className="size-4 text-muted-foreground" />
        </div>
      </button>
    );
  }

  return (
    <div className="glass space-y-3 rounded-xl p-4" data-testid="post-composer-form" role="form" aria-label="Create post form">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar src={user.avatarUrl} name={user.displayName} size="md" />
          <span className="text-sm font-medium">{user.displayName}</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={() => setExpanded(false)}>
          <X className="size-4" />
        </Button>
      </div>

      <Textarea
        placeholder="What do you want to share?"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        className="resize-none border-border bg-muted/50"
        data-testid="post-composer-content"
        aria-label="Post content"
      />

      <div>
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-medium text-[#3B82F6]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="ml-0.5 rounded-sm text-[#3B82F6]/60 hover:text-[#3B82F6] transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          placeholder={tags.length > 0 ? "Add another tag…" : "Add tags (press Enter or comma)"}
          value={tagInput}
          onChange={(event) => {
            const val = event.target.value;
            // If user types a comma, commit the tag
            if (val.includes(",")) {
              const newTag = val.replace(",", "").trim().toLowerCase();
              if (newTag && !tags.includes(newTag)) {
                setTags((prev) => [...prev, newTag]);
              }
              setTagInput("");
            } else {
              setTagInput(val);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const newTag = tagInput.trim().toLowerCase();
              if (newTag && !tags.includes(newTag)) {
                setTags((prev) => [...prev, newTag]);
              }
              setTagInput("");
            }
            // Backspace on empty input removes last tag
            if (event.key === "Backspace" && tagInput === "" && tags.length > 0) {
              setTags((prev) => prev.slice(0, -1));
            }
          }}
          className="border-border bg-muted/50"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void handleSubmit()} disabled={submitting} className="gap-1.5" data-testid="post-composer-submit" aria-label="Create post">
          <Send className="size-3.5" />
          {submitting ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </div>
  );
}
