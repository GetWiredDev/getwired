"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { LogIn, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/Avatar";
import { useAppAuth } from "@/lib/auth";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

interface ForumPostComposerProps {
  categoryName: string;
  categorySlug: string;
  onCancel: () => void;
  onCreated: (postId: string) => void;
}

export function ForumPostComposer({
  categoryName,
  categorySlug,
  onCancel,
  onCreated,
}: ForumPostComposerProps) {
  const { user, isSignedIn, signIn } = useAppAuth();
  const createPost = useMutation(api.posts.create);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function commitTag(rawTag: string) {
    const nextTag = rawTag.trim().toLowerCase();
    if (!nextTag || tags.includes(nextTag)) {
      return;
    }

    setTags((prev) => [...prev, nextTag]);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Add a title before posting");
      return;
    }

    if (!content.trim()) {
      toast.error("Write something before posting");
      return;
    }

    const finalTags = [...tags];
    const leftover = tagInput.trim().toLowerCase();
    if (leftover && !finalTags.includes(leftover)) {
      finalTags.push(leftover);
    }

    setSubmitting(true);
    try {
      const postId = await createPost({
        title: title.trim(),
        content: content.trim(),
        category: categorySlug,
        tags: finalTags,
      });

      toast.success("Post created successfully");
      onCreated(postId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isSignedIn || !user) {
    return (
      <div className="glass mb-4 flex items-center gap-3 rounded-xl px-4 py-4">
        <LogIn className="size-4 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-muted-foreground">
          <button onClick={signIn} className="cursor-pointer font-medium text-[#3B82F6] hover:underline">
            Sign in
          </button>{" "}
          to start a new thread in {categoryName}.
        </p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="glass mb-4 space-y-4 rounded-xl p-5" data-testid="forum-post-composer">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar src={user.avatarUrl} name={user.displayName} size="md" />
          <div>
            <p className="text-sm font-medium text-foreground">{user.displayName}</p>
            <p className="text-xs text-muted-foreground">Posting in {categoryName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Close new post composer">
          <X className="size-4" />
        </Button>
      </div>

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Thread title"
        className="bg-muted/50"
        data-testid="forum-post-title"
        aria-label="Post title"
      />

      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={`What do you want to ask or share with ${categoryName}?`}
        rows={6}
        className="resize-none bg-muted/50"
        data-testid="forum-post-content"
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
                  onClick={() => setTags((prev) => prev.filter((entry) => entry !== tag))}
                  className="ml-0.5 rounded-sm text-[#3B82F6]/60 transition-colors hover:text-[#3B82F6]"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          placeholder={tags.length > 0 ? "Add another tag..." : "Add tags (press Enter or comma)"}
          value={tagInput}
          onChange={(event) => {
            const value = event.target.value;
            if (value.includes(",")) {
              commitTag(value.replaceAll(",", ""));
              setTagInput("");
              return;
            }

            setTagInput(value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitTag(tagInput);
              setTagInput("");
            }

            if (event.key === "Backspace" && tagInput === "" && tags.length > 0) {
              setTags((prev) => prev.slice(0, -1));
            }
          }}
          className="bg-muted/50"
          data-testid="forum-post-tags"
          aria-label="Post tags"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={submitting}
          className="gap-1.5"
          data-testid="forum-post-submit"
        >
          <Send className="size-3.5" />
          {submitting ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </div>
  );
}
