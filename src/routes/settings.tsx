import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { personById } from "@/lib/kneawork/data";
import { useKneaState } from "@/lib/kneawork/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: WorkspaceSettingsPage,
});

type SettingsSection = "profile" | "general" | "notify" | "usage" | "security";

function WorkspaceSettingsPage() {
  const { currentUserId } = useKneaState();
  const me = personById(currentUserId);

  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  // Profile Form States
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState("+855 12 889 900");
  const [telegram, setTelegram] = useState(
    me.id === "u_finance"
      ? "vanna_finance"
      : me.id === "u_manager"
        ? "sokha_ops"
        : me.id === "u_director"
          ? "mengty_director"
          : "panharith_tech"
  );
  const [bioNote, setBioNote] = useState("Finance & procurement reviewer for Phnom Penh operations.");
  const [avatarCustom, setAvatarCustom] = useState<string | null>(null);
  const [displayDensity, setDisplayDensity] = useState<"comfortable" | "compact">("comfortable");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General & Regional Form States
  const [orgName, setOrgName] = useState("Mekong Design Co.");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en-US");

  // Notifications Form States
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [reminderHours, setReminderHours] = useState("24");
  const [autoEscalate, setAutoEscalate] = useState(true);

  // Usage & Quota Policy States
  const [maxFileMb, setMaxFileMb] = useState("10");
  const [warnThreshold, setWarnThreshold] = useState("80");
  const [monthlyCapPerPerson, setMonthlyCapPerPerson] = useState("0");

  // Saved Alert
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const cleanTelegramHandle = (val: string) => {
    return val.trim().replace(/^(https?:\/\/)?(t\.me\/|telegram\.me\/)/i, "").replace(/^@/, "");
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSavedMessage(`Settings saved successfully at ${timeStr}`);
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarCustom(url);
      setSavedMessage("Profile photo updated");
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  const sections: { id: SettingsSection; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "profile", label: "My Profile", icon: UserRound },
    { id: "general", label: "Organization", icon: Building2 },
    { id: "notify", label: "Notifications & Telegram", icon: Bell },
    { id: "usage", label: "Plan & Usage Limits", icon: Gauge, badge: "33%" },
    { id: "security", label: "Security & Compliance", icon: ShieldCheck },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Settings" }, { label: "Workspace Settings" }]}>
      <div className="space-y-6 pb-12">
        <PageHeader
          eyebrow="Workspace Management"
          title="Settings & Governance"
          description="Manage your user profile, approval routing rules, notification dispatch, and workspace quota meters."
          actions={
            <Button
              onClick={() => handleSave()}
              size="default"
              className="gap-1.5 font-semibold bg-[#003D96] hover:bg-[#002D70] text-white shadow-2xs h-9 px-4"
            >
              <Check className="size-4" />
              Save changes
            </Button>
          }
        />

        {/* Global Feedback Banner */}
        {savedMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{savedMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSavedMessage(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Left Vertical Tabs Rail (220px) + Right Content Panel */}
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 items-start">
          {/* Left Navigation Rail (Desktop: Sticky vertical list; Mobile: Horizontal chips) */}
          <aside className="min-w-0 lg:sticky lg:top-20">
            <nav
              aria-label="Settings sections"
              className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-border"
            >
              {sections.map(({ id, label, icon: Icon, badge }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      "flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 lg:w-full",
                      isActive
                        ? "bg-[#003D96] text-white shadow-2xs font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Panel */}
          <main className="min-w-0 max-w-[780px] space-y-6">
            {/* SECTION 1: MY PROFILE */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                {/* Photo & Identity Banner */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="relative group shrink-0 self-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative size-24 rounded-full overflow-hidden border-2 border-border focus:outline-none focus:ring-2 focus:ring-[#003D96] focus:ring-offset-2 transition-transform group-hover:scale-102"
                        title="Click to change profile picture"
                        aria-label="Upload profile photo"
                      >
                        {avatarCustom ? (
                          <img src={avatarCustom} alt={me.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-[#F2F7FF] flex items-center justify-center text-xl font-bold text-[#003D96]">
                            {me.initials}
                          </div>
                        )}
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera className="size-6" />
                        </span>
                      </button>
                      <span className="absolute bottom-0 right-0 size-7 rounded-full bg-[#003D96] text-white flex items-center justify-center shadow-md pointer-events-none border-2 border-card">
                        <Camera className="size-3.5" />
                      </span>
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground">Profile Photo</h3>
                      <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                        Displayed on requests, decision logs, and notification feeds across your organization. Recommended size: 256x256px.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-xs font-semibold gap-1.5"
                        >
                          <Camera className="size-3.5" />
                          {avatarCustom ? "Change photo" : "Upload photo"}
                        </Button>
                        {avatarCustom && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAvatarCustom(null)}
                            className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Self-Managed Details Form */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-5">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">Contact & Identity</h3>
                    <p className="text-xs text-muted-foreground">
                      Information used by colleagues and Telegram bots to route time-sensitive approvals.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="pf-name" className="text-xs font-semibold text-foreground">
                        Full Name (English)
                      </Label>
                      <Input
                        id="pf-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 text-sm bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pf-phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" />
                        Direct Phone / Call Line
                      </Label>
                      <Input
                        id="pf-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+855 12 000 000"
                        className="h-10 text-sm bg-background font-mono"
                      />
                      <span className="text-[11px] text-muted-foreground">Used for urgent call-escalations</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pf-telegram" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Send className="size-3.5 text-[#003D96]" />
                        Telegram Handle (@username)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-muted-foreground select-none">@</span>
                        <Input
                          id="pf-telegram"
                          value={telegram}
                          onChange={(e) => setTelegram(cleanTelegramHandle(e.target.value))}
                          placeholder="username"
                          className="h-10 pl-7 text-sm bg-background font-mono"
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">Linked to @AnumatWorkBot for 1-click approvals</span>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="pf-bio" className="text-xs font-semibold text-foreground">
                        Approval Role Context & Notes
                      </Label>
                      <Textarea
                        id="pf-bio"
                        rows={2}
                        value={bioNote}
                        onChange={(e) => setBioNote(e.target.value)}
                        maxLength={120}
                        className="text-sm bg-background resize-none"
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Brief note shown in the Team Directory card</span>
                        <span>{bioNote.length} / 120</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin-Governed Identity Card (Locked to maintain audit integrity) */}
                <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Corporate Governance Identity</h3>
                      <p className="text-xs text-muted-foreground">
                        Email, role, and department are provisioned by workspace administrators to maintain audit compliance.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-border/60 rounded-lg border border-border bg-card text-xs sm:text-sm">
                    <div className="flex items-center justify-between p-3.5">
                      <span className="text-muted-foreground">Corporate Email:</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <Mail className="size-3.5 text-muted-foreground" />
                        {me.id === "u_finance"
                          ? "vanna.meas@mekongdesign.com"
                          : me.id === "u_manager"
                            ? "sokha.kem@mekongdesign.com"
                            : me.id === "u_director"
                              ? "lim.mengty@mekongdesign.com"
                              : "panharith.sok@mekongdesign.com"}
                        <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 border border-emerald-200">
                          Verified SSO
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5">
                      <span className="text-muted-foreground">Approval Permission:</span>
                      <span className="font-semibold text-foreground">{me.role}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5">
                      <span className="text-muted-foreground">Assigned Department:</span>
                      <span className="font-medium text-foreground">{me.department}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5">
                      <span className="text-muted-foreground">Reports Directly To:</span>
                      <span className="font-medium text-foreground">
                        {me.id === "u_staff"
                          ? "Sokha Kem · Operations Manager"
                          : me.id === "u_manager" || me.id === "u_finance"
                            ? "Mr. Lim Mengty · Executive Director"
                            : "Board of Directors"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Display Density Preference */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Display Density</h3>
                  <p className="text-xs text-muted-foreground">
                    Adjust vertical spacing and padding in approval queues and data tables.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setDisplayDensity("comfortable")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        displayDensity === "comfortable"
                          ? "border-[#003D96] bg-[#F2F7FF] text-[#003D96] font-semibold ring-1 ring-[#003D96]"
                          : "border-border hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="text-sm font-semibold">Comfortable (Standard)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">44px touch targets, ideal for daily reviewing</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayDensity("compact")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        displayDensity === "compact"
                          ? "border-[#003D96] bg-[#F2F7FF] text-[#003D96] font-semibold ring-1 ring-[#003D96]"
                          : "border-border hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="text-sm font-semibold">Compact (High Density)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">36px rows, shows more items per screen</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: ORGANIZATION */}
            {activeSection === "general" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-5">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">Organization Profile</h3>
                    <p className="text-xs text-muted-foreground">
                      Company branding and primary operational currencies for all requests.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="org-name" className="text-xs font-semibold text-foreground">
                        Organization Legal Name
                      </Label>
                      <Input
                        id="org-name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="h-10 text-sm bg-background font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="org-cur" className="text-xs font-semibold text-foreground">
                        Base Operational Currency
                      </Label>
                      <select
                        id="org-cur"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#003D96]"
                      >
                        <option value="USD">USD ($) — United States Dollar</option>
                        <option value="KHR" disabled>KHR (៛) — Cambodian Riel (Coming v1.3)</option>
                      </select>
                      <span className="text-[11px] text-muted-foreground">All approval thresholds are evaluated in this currency</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="org-lang" className="text-xs font-semibold text-foreground">
                        Primary System Language
                      </Label>
                      <select
                        id="org-lang"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#003D96]"
                      >
                        <option value="en-US">English (United States)</option>
                        <option value="en-GB">English (United Kingdom)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-foreground">
                        Workspace Timezone & Audit Standard
                      </Label>
                      <Input
                        disabled
                        value="Asia/Phnom Penh (GMT+7 · Indochina Time)"
                        className="h-10 text-sm bg-muted/50 font-mono text-muted-foreground"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        Applied to all digital approval signatures and audit history logs
                      </span>
                    </div>
                  </div>
                </div>

                {/* About & System Version */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <h3 className="text-base font-semibold text-foreground">System Specifications</h3>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3 text-xs sm:text-[13px]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">Anumat Workflow Engine</span>
                      <span className="rounded-full bg-[#003D96]/10 text-[#003D96] px-2.5 py-0.5 font-mono text-xs font-semibold">
                        v1.2.0 (Build 2026.09)
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Crafted by Mekong Design Labs · Requests. Approvals. Clear. Built with React, TanStack Start, and shadcn/ui.
                    </p>
                    <div className="flex items-center gap-4 pt-1 border-t border-border/60">
                      <a href="#roadmap" className="text-[#003D96] hover:underline font-medium inline-flex items-center gap-1">
                        Product Roadmap <ExternalLink className="size-3" />
                      </a>
                      <a href="#privacy" className="text-[#003D96] hover:underline font-medium">
                        Privacy Policy
                      </a>
                      <a href="#terms" className="text-[#003D96] hover:underline font-medium">
                        Terms of Service
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: NOTIFICATIONS & TELEGRAM */}
            {activeSection === "notify" && (
              <div className="space-y-6">
                {/* Telegram Bot Highlight Integration */}
                <div className="rounded-xl border border-[#003D96]/25 bg-[#F2F7FF] p-6 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="size-11 rounded-xl bg-[#003D96] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Send className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            Telegram Approval Bot (@AnumatWorkBot)
                          </h3>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 border border-emerald-300">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Receive instant actionable notifications on your mobile device. Approve, request clarifications, or reject directly in Telegram with secure 1-tap buttons.
                        </p>
                      </div>
                    </div>
                    <Switch checked={telegramAlerts} onCheckedChange={setTelegramAlerts} aria-label="Toggle Telegram Bot Alerts" />
                  </div>

                  <div className="rounded-lg bg-card border border-border p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Linked Telegram:</span>
                      <span className="font-mono text-[#003D96] font-medium">@{telegram}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://t.me/AnumatWorkBot?start=auth_${currentUserId}`, "_blank")}
                      className="h-8 text-xs font-semibold gap-1.5"
                    >
                      <ExternalLink className="size-3" />
                      Test Bot Alert
                    </Button>
                  </div>
                </div>

                {/* Notification Delivery Channels */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">Alert Delivery Channels</h3>
                    <p className="text-xs text-muted-foreground">
                      Configure how you and your team receive decision requests and turnaround updates.
                    </p>
                  </div>

                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between py-3.5">
                      <div>
                        <div className="text-sm font-semibold text-foreground">In-App Notification Bell</div>
                        <p className="text-xs text-muted-foreground">
                          Top-bar badge counters and desktop slide-out action notifications
                        </p>
                      </div>
                      <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} aria-label="Toggle in-app alerts" />
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Daily Morning Digest Email</div>
                        <p className="text-xs text-muted-foreground">
                          Summary sent at 08:30 AM with all items requiring review or pending delegation
                        </p>
                      </div>
                      <Switch checked={dailyDigest} onCheckedChange={setDailyDigest} aria-label="Toggle daily digest" />
                    </div>
                  </div>
                </div>

                {/* Follow-up Reminders & Delegation */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">Automated Follow-up Reminders</h3>
                    <p className="text-xs text-muted-foreground">
                      Nudge designated approvers before SLA turnaround commitments are breached.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rem-interval" className="text-xs font-semibold text-foreground">
                        Reminder Interval
                      </Label>
                      <select
                        id="rem-interval"
                        value={reminderHours}
                        onChange={(e) => setReminderHours(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#003D96]"
                      >
                        <option value="12">After 12 hours waiting</option>
                        <option value="24">After 24 hours waiting (Recommended)</option>
                        <option value="48">After 48 hours waiting</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Out-of-Office Auto-Delegation
                      </Label>
                      <div className="flex items-center justify-between h-10 px-3 rounded-md border border-border bg-muted/20">
                        <span className="text-xs text-foreground font-medium">Re-route if on leave</span>
                        <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} aria-label="Toggle auto delegation" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    When enabled, pending decisions automatically route to the secondary approver (Mr. Lim · Director) if an approver has marked approved leave in the system.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 4: PLAN, QUOTAS & USAGE LIMITS */}
            {activeSection === "usage" && (
              <div className="space-y-6">
                {/* Subscription Tier Banner */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">Team Growth Plan</h3>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 border border-emerald-200">
                          Active · $29/mo
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Current monthly usage cycle resets on <strong>1 Oct 2026 (in 4 days)</strong>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#003D96] hover:bg-[#002D70] text-white font-semibold text-xs h-9 px-4 shrink-0"
                    >
                      Upgrade Plan
                    </Button>
                  </div>

                  {/* Quota Health Meters */}
                  <div className="space-y-4 pt-1">
                    {/* Meter 1: Active Team Members */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Users className="size-4 text-[#003D96]" />
                          Active Team Members
                        </span>
                        <span className="font-mono text-muted-foreground">
                          <strong className="text-foreground">5</strong> / 15 members (33%)
                        </span>
                      </div>
                      <Progress value={33} className="h-2.5 bg-muted" />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>10 seats remaining</span>
                        <span>Tier limit: 15</span>
                      </div>
                    </div>

                    {/* Meter 2: Published Request Templates */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Layers className="size-4 text-[#003D96]" />
                          Published Request Templates
                        </span>
                        <span className="font-mono text-muted-foreground">
                          <strong className="text-foreground">4</strong> / 20 templates (20%)
                        </span>
                      </div>
                      <Progress value={20} className="h-2.5 bg-muted" />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>16 template slots remaining</span>
                        <span>Tier limit: 20</span>
                      </div>
                    </div>

                    {/* Meter 3: AI Workflow Builder */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Sparkles className="size-4 text-purple-600" />
                          AI Workflow Builds (Monthly)
                        </span>
                        <span className="font-mono text-muted-foreground">
                          <strong className="text-foreground">7</strong> / 25 builds (28%)
                        </span>
                      </div>
                      <Progress value={28} className="h-2.5 bg-muted" />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>18 AI builds remaining this month</span>
                        <span>Resets monthly</span>
                      </div>
                    </div>

                    {/* Meter 4: Document Storage */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Database className="size-4 text-blue-600" />
                          Document & Quotation Storage
                        </span>
                        <span className="font-mono text-muted-foreground">
                          <strong className="text-foreground">2.1 GB</strong> / 10 GB (21%)
                        </span>
                      </div>
                      <Progress value={21} className="h-2.5 bg-muted" />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>7.9 GB free storage</span>
                        <span>High-availability S3</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quota Policy Notice */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs sm:text-[13px] text-blue-900 flex items-start gap-3">
                  <ShieldCheck className="size-5 text-[#003D96] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-[#003D96]">Uninterrupted Approvals Guarantee</p>
                    <p className="text-blue-800 leading-relaxed">
                      If your organization approaches any usage limit, ongoing approval workflows and decision signatures are never blocked. You will receive an advisory notification with 5 business days to archive inactive templates or upgrade.
                    </p>
                  </div>
                </div>

                {/* Team Policy Rules & Limits */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">Internal Team Policy Limits</h3>
                    <p className="text-xs text-muted-foreground">
                      Admin governance parameters applied across all requests and attachments.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pol-file" className="text-xs font-semibold text-foreground">
                        Max Quotation Attachment
                      </Label>
                      <select
                        id="pol-file"
                        value={maxFileMb}
                        onChange={(e) => setMaxFileMb(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#003D96]"
                      >
                        <option value="5">5 MB per file</option>
                        <option value="10">10 MB per file (Default)</option>
                        <option value="25">25 MB per file</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pol-warn" className="text-xs font-semibold text-foreground">
                        Quota Warning Threshold
                      </Label>
                      <select
                        id="pol-warn"
                        value={warnThreshold}
                        onChange={(e) => setWarnThreshold(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#003D96]"
                      >
                        <option value="70">Notify at 70% capacity</option>
                        <option value="80">Notify at 80% capacity (Default)</option>
                        <option value="90">Notify at 90% capacity</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pol-cap" className="text-xs font-semibold text-foreground">
                        Staff Monthly Cap
                      </Label>
                      <select
                        id="pol-cap"
                        value={monthlyCapPerPerson}
                        onChange={(e) => setMonthlyCapPerPerson(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#003D96]"
                      >
                        <option value="0">No submission cap</option>
                        <option value="10">Max 10 requests / user</option>
                        <option value="20">Max 20 requests / user</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: SECURITY & COMPLIANCE */}
            {activeSection === "security" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">Security & Access Controls</h3>
                    <p className="text-xs text-muted-foreground">
                      Enterprise authentication standards, active sessions, and compliance guarantees.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-muted/20 p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <KeyRound className="size-4 text-[#003D96]" />
                          Single Sign-On (SAML / Google Workspace)
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enforced for all 5 team members under @mekongdesign.com
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 border border-emerald-200">
                        Enforced
                      </span>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/20 p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          Current Active Session
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Chrome on Windows 11 · IP 119.82.252.14 · Phnom Penh, Cambodia (Active Now)
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                        Sign out other devices
                      </Button>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/20 p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <FileText className="size-4 text-[#003D96]" />
                          Immutable Audit Log Retention
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Every submission, view, return note, and signature is cryptographically hashed and stored for 7 years
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 border border-blue-200">
                        Compliant
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
