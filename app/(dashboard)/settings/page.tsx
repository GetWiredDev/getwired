"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">
                {user?.fullName ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">
                {user?.primaryEmailAddress?.emailAddress ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>
              External service connections (configured in Convex dashboard)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "OpenRouter", description: "AI agent & response drafting (via OpenRouter.ai)" },
              { name: "Reddit API", description: "Reddit post discovery" },
              { name: "SerpApi", description: "Google Trends data" },
              { name: "DataForSEO", description: "SEO metrics & competitor data" },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
                <Badge variant="secondary">Configure in Convex</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Jobs</CardTitle>
            <CardDescription>
              Automated tasks running in the background
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Keyword Analysis", schedule: "Daily at 6:00 AM UTC" },
              { name: "Reddit Scan", schedule: "Every 4 hours" },
              { name: "Weekly Digest", schedule: "Mondays at 8:00 AM UTC" },
            ].map((job) => (
              <div key={job.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{job.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.schedule}
                  </p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

