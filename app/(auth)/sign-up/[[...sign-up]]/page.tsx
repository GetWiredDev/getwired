import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full blur-[120px] opacity-30" style={{ background: "var(--accent)" }} />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full blur-[120px] opacity-20" style={{ background: "var(--accent-hover)" }} />
      <div className="relative z-10">
        <SignUp />
      </div>
    </div>
  );
}

