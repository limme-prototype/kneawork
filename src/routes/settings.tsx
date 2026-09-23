import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Check,
  Clock,
  Globe,
  KeyRound,
  Lock,
  MessageSquare,
  Shield,
  Sliders,
  Users,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { personById } from "@/lib/kneawork/data";
import { useKneaState } from "@/lib/kneawork/store";

export const Route = createFileRoute("/settings")({
  component: WorkspaceSettingsPage,
});

type SettingsCategory = "workflow" | "workspace" | "notifications" | "security";

export function WorkspaceSettingsPage() {
  const { currentUserId } = useKneaState();
  const me = personById(currentUserId);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("workflow");

  // Form states
  const [reminderHours, setReminderHours] = useState("24");
  const [currency, setCurrency] = useState("USD");
  const [lang, setLang] = useState("km_en");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSavedMessage(`Settings saved. Updated by ${me.name} · Today at ${timeStr}`);
    setTimeout(() => setSavedMessage(null), 5000);
  };

  return (
    <AppShell
      title="Workspace Settings"
      subtitle="Configure approval policies, notifications, and regional workspace defaults"
      breadcrumbs={[{ label: "Settings" }, { label: "Workspace Settings" }]}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h1 className="text-base font-bold text-foreground">Workspace governance & policies</h1>
          <p className="text-xs text-muted-foreground">
            Settings apply organization-wide across all sequential approval routes and audit logs
          </p>
        </div>

        {/* Feedback Alert */}
        {savedMessage ? (
          <div className="rounded-md border border-success-border bg-success-soft p-3 text-xs text-success flex items-center gap-2 shadow-2xs">
            <Check className="size-4 shrink-0" />
            <span className="font-medium text-foreground">{savedMessage}</span>
          </div>
        ) : null}

        {/* Modular Navigation Categories (HiBob Pattern: Organization by Intent) */}
        <div className="flex items-center gap-1 border-b border-border pb-px text-xs overflow-x-auto scrollbar-none whitespace-nowrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("workflow")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-none border-b-2 transition-colors shrink-0 ${
              activeCategory === "workflow"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="size-3.5" />
            Workflow & reminders
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("workspace")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-none border-b-2 transition-colors shrink-0 ${
              activeCategory === "workspace"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="size-3.5" />
            Workspace & localization
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("notifications")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-none border-b-2 transition-colors shrink-0 ${
              activeCategory === "notifications"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="size-3.5" />
            Notification channels
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("security")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-none border-b-2 transition-colors shrink-0 ${
              activeCategory === "security"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="size-3.5" />
            Security & access
          </Button>
        </div>

        {/* Category 1: Workflow */}
        {activeCategory === "workflow" ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Setting Row 1: Approval Reminders */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Automated follow-up reminders
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sends automated notifications when a request is waiting longer than designated
                    thresholds
                  </p>
                </div>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground self-start sm:self-auto">
                  Active rule
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="reminders" className="text-foreground font-medium">
                    Reminder interval
                  </Label>
                  <select
                    id="reminders"
                    value={reminderHours}
                    onChange={(e) => setReminderHours(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-2 text-xs text-foreground"
                  >
                    <option value="12">After 12 hours waiting</option>
                    <option value="24">After 24 hours waiting (Standard)</option>
                    <option value="48">After 48 hours waiting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Repeat frequency</Label>
                  <Input disabled value="Every 24 hours" className="text-xs bg-muted/40" />
                </div>

                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Dispatched channels</Label>
                  <Input disabled value="In-app · Telegram Bot" className="text-xs bg-muted/40" />
                </div>
              </div>
            </div>

            {/* Setting Row 2: Escalation & Delegation */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Escalation & out-of-office delegation
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Auto-reassign pending decisions when designated approvers are on approved leave
                  </p>
                </div>
                <span className="rounded bg-success-soft border border-success-border px-2 py-0.5 text-[10px] font-semibold text-success">
                  Enabled
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delegated manager approvals temporarily route to{" "}
                <strong className="text-foreground">Mr. Lim (Director)</strong> when Sokha is on
                leave.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold"
              >
                Save workflow settings
              </Button>
            </div>
          </form>
        ) : null}

        {/* Category 2: Workspace & Localization */}
        {activeCategory === "workspace" ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Regional & localization defaults
                </h2>
                <p className="text-xs text-muted-foreground">
                  Language, currency, and timezone formats
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="currency" className="text-foreground font-medium">
                    Operational currency
                  </Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-2 text-xs text-foreground"
                  >
                    <option value="USD">USD ($) — United States Dollar</option>
                    <option value="KHR">KHR (៛) — Khmer Riel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lang" className="text-foreground font-medium">
                    Workspace language
                  </Label>
                  <select
                    id="lang"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-2 text-xs text-foreground"
                  >
                    <option value="km_en">English & Khmer (Bilingual UI)</option>
                    <option value="en">English (Primary)</option>
                    <option value="km">Khmer (ភាសាខ្មែរ)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-foreground font-medium">Workspace timezone</Label>
                  <Input disabled value="Asia/Phnom Penh (GMT+7)" className="text-xs bg-muted/40" />
                  <span className="text-[10px] text-muted-foreground">
                    Used for all immutable audit log timestamps
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold"
                >
                  Save regional settings
                </Button>
              </div>
            </div>
          </form>
        ) : null}

        {/* Category 3: Notifications */}
        {activeCategory === "notifications" ? (
          <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Notification dispatch channels
              </h2>
              <p className="text-xs text-muted-foreground">
                Control alert delivery to approvers and requesters
              </p>
            </div>

            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-semibold text-foreground">
                    In-app alerts & bell notifications
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Top bar notification counter and audit badges
                  </p>
                </div>
                <span className="font-semibold text-success bg-success-soft border border-success-border px-2 py-0.5 rounded text-[11px]">
                  Enabled
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-semibold text-foreground">
                    Telegram bot notifications (@KneaWorkBot)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Instant actionable alerts with decision buttons
                  </p>
                </div>
                <span className="font-semibold text-success bg-success-soft border border-success-border px-2 py-0.5 rounded text-[11px]">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-semibold text-foreground">Email digest notifications</span>
                  <p className="text-[11px] text-muted-foreground">
                    Daily summary of overdue or escalated approvals
                  </p>
                </div>
                <span className="font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded text-[11px]">
                  Optional
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Category 4: Security */}
        {activeCategory === "security" ? (
          <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Enterprise security & audit policies
              </h2>
              <p className="text-xs text-muted-foreground">
                Session policies and immutable governance logs
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-border bg-muted/30 p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground">
                    Single sign-on (Google Workspace SAML)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    All 5 workspace members authenticated via domain SSO
                  </p>
                </div>
                <span className="font-semibold text-success text-xs">Enforced</span>
              </div>

              <div className="rounded-md border border-border bg-muted/30 p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground">
                    Immutable audit trail retention
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Every decision, timestamp, and attachment preserved for 7 years
                  </p>
                </div>
                <span className="font-semibold text-muted-foreground text-xs">Compliant</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
