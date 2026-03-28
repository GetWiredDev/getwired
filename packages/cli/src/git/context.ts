import { execFileSync } from "node:child_process";

export interface RegressionContext {
  currentBranch?: string;
  defaultCommitId?: string;
  defaultCommitShort?: string;
  source: "branch" | "latest-commit" | "none";
  description?: string;
}

const PRIMARY_BRANCH_REFS = [
  "origin/main",
  "main",
  "origin/master",
  "master",
  "origin/develop",
  "develop",
] as const;

const MAINLINE_BRANCHES = new Set(["main", "master", "develop"]);

export function getRegressionContext(projectPath: string): RegressionContext {
  const currentBranch = runGit(projectPath, ["branch", "--show-current"]);
  const availableRefs = new Set(
    (runGit(projectPath, ["for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin"]) ?? "")
      .split("\n")
      .map((ref) => ref.trim())
      .filter(Boolean),
  );

  if (currentBranch && !MAINLINE_BRANCHES.has(currentBranch)) {
    const baseRef = PRIMARY_BRANCH_REFS.find((ref) => availableRefs.has(ref));
    if (baseRef) {
      const mergeBase = runGit(projectPath, ["merge-base", "HEAD", baseRef]);
      const mergeBaseShort = mergeBase
        ? runGit(projectPath, ["rev-parse", "--short", mergeBase])
        : undefined;

      if (mergeBase && mergeBaseShort) {
        return {
          currentBranch,
          defaultCommitId: mergeBase,
          defaultCommitShort: mergeBaseShort,
          source: "branch",
          description: `Current branch ${currentBranch} against ${baseRef} (${mergeBaseShort})`,
        };
      }
    }
  }

  const previousCommit = runGit(projectPath, ["rev-parse", "HEAD~1"]);
  const previousCommitShort = previousCommit
    ? runGit(projectPath, ["rev-parse", "--short", previousCommit])
    : undefined;

  if (previousCommit && previousCommitShort) {
    return {
      currentBranch,
      defaultCommitId: previousCommit,
      defaultCommitShort: previousCommitShort,
      source: "latest-commit",
      description: `Latest commit baseline (${previousCommitShort})${currentBranch ? ` on ${currentBranch}` : ""}`,
    };
  }

  return {
    currentBranch,
    source: "none",
  };
}

function runGit(projectPath: string, args: string[]): string | undefined {
  try {
    const output = execFileSync("git", args, {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output || undefined;
  } catch {
    return undefined;
  }
}
