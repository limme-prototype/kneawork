import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Check,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Mail,
  Phone,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { personById } from "@/lib/kneawork/data";
import { useKneaState } from "@/lib/kneawork/store";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type TabType = "profile" | "security" | "notifications" | "language" | "accounts";

export function ProfilePage() {
  const { currentUserId } = useKneaState();
  const me = personById(currentUserId);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [phone, setPhone] = useState("+855 12 889 900");
  const [telegram, setTelegram] = useState("@sokha_ops");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice("Saved just now");
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const reportsTo =
    me.id === "u_staff"
      ? "Sokha · Manager Approver"
      : me.id === "u_manager"
        ? "Mr. Lim · Director"
        : me.id === "u_finance"
          ? "Mr. Lim · Director"
          : "Board of Directors";

  return (
    <AppShell
      title="My Profile"
      subtitle="Manage your personal information, access, and preferences"
      breadcrumbs={[{ label: "Settings" }, { label: "My Profile" }]}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Profile Identity Card (Compact HiBob Record: Department, Role & Reporting Line grouped) */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-13 items-center justify-center rounded-full bg-foreground text-base font-bold text-background shadow-2xs">
                {me.initials}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground">{me.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.2 text-[10px] font-semibold text-success">
                    Active
                  </span>
                </div>
                {/* Department, role, and reporting line grouped together */}
                <p className="text-xs text-foreground font-medium mt-0.5">
                  {me.role} · <span className="text-muted-foreground">{me.department}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span>
                    Reports to{" "}
                    <strong className="text-foreground font-semibold">{reportsTo}</strong>
                  </span>
                  <span>·</span>
                  <span>Member since 10 Sep 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Tabs (Account Settings Pattern using Button component) */}
        <div className="flex items-center gap-1 border-b border-border pb-px text-xs overflow-x-auto scrollbar-none whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 h-9 rounded-none border-b-2 text-xs transition-colors shrink-0 ${
              activeTab === "profile"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-3.5" />
            Profile & contact
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-1.5 h-9 rounded-none border-b-2 text-xs transition-colors shrink-0 ${
              activeTab === "security"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <KeyRound className="size-3.5" />
            Security & login
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-1.5 h-9 rounded-none border-b-2 text-xs transition-colors shrink-0 ${
              activeTab === "notifications"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="size-3.5" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("language")}
            className={`flex items-center gap-1.5 h-9 rounded-none border-b-2 text-xs transition-colors shrink-0 ${
              activeTab === "language"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="size-3.5" />
            Language & region
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center gap-1.5 h-9 rounded-none border-b-2 text-xs transition-colors shrink-0 ${
              activeTab === "accounts"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="size-3.5" />
            Connected accounts
          </Button>
        </div>

        {/* Tab 1: Profile & Contact with Explicit Sentence Case & Connection States */}
        {activeTab === "profile" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Left: Editable Personal Information */}
            <div className="md:col-span-7 rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="border-b border-border/60 pb-2">
                <h2 className="text-xs font-semibold text-foreground">Personal information</h2>
                <p className="text-[11px] text-muted-foreground">
                  Contact details used for approval alert notifications
                </p>
              </div>

              {savedNotice ? (
                <div className="rounded-md border border-success-border bg-success-soft p-2.5 text-xs text-success flex items-center gap-2">
                  <Check className="size-4 text-success" />
                  <span>{savedNotice}</span>
                </div>
              ) : null}

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Full name</Label>
                    <span className="text-[10px] text-muted-foreground">
                      Organization controlled
                    </span>
                  </div>
                  <Input disabled value={me.name} className="text-xs bg-muted/40 font-medium" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Work email</Label>
                    <span className="text-[10px] font-semibold text-success bg-success-soft px-1.5 py-0.2 rounded border border-success-border">
                      Verified
                    </span>
                  </div>
                  <Input
                    disabled
                    value={`${me.name.toLowerCase().replace(" ", ".")}@kneawork.com`}
                    className="text-xs bg-muted/40"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-foreground font-semibold">
                    Mobile phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs bg-card"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telegram" className="text-foreground font-semibold">
                      Telegram username
                    </Label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success-soft px-1.5 py-0.2 rounded border border-success-border">
                      <Send className="size-2.5" />
                      Connected
                    </span>
                  </div>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="text-xs bg-card"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Connected to @KneaWorkBot for instant approval alerts.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">
                    {savedNotice
                      ? "All changes saved"
                      : "Unsaved changes will update notifications immediately"}
                  </span>
                  <Button type="submit" size="sm" className="text-xs font-semibold">
                    Save changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Right: Access & Responsibilities (Read-Only Organization Permissions) */}
            <div className="md:col-span-5 rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="border-b border-border/60 pb-2">
                <h2 className="text-xs font-semibold text-foreground">Access & responsibilities</h2>
                <p className="text-[11px] text-muted-foreground">
                  Assigned permissions determined by workspace policy
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="rounded-md border border-border/60 bg-muted/40 p-3">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Assigned role
                  </span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{me.role}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {me.department} Department
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-foreground block">
                    You can submit
                  </span>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1 leading-relaxed">
                    <li>Purchase requests up to USD 10,000</li>
                    <li>Expense and travel claims</li>
                    <li>Annual and sick leave requests</li>
                    <li>General administrative inquiries</li>
                  </ul>
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <span className="text-[11px] font-semibold text-foreground block">
                    Approval responsibilities
                  </span>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1 leading-relaxed">
                    {me.id === "u_manager" ? (
                      <>
                        <li>Manager Approval for Operations department expenditures</li>
                        <li>Leave requests for direct reports</li>
                        <li>Department purchases within delegated spending limits</li>
                      </>
                    ) : me.id === "u_finance" ? (
                      <>
                        <li>Financial verification of invoices, quotations, and account codes</li>
                        <li>Tax receipt validation for reimbursements</li>
                        <li>Budget code assignment before manager review</li>
                      </>
                    ) : me.id === "u_director" ? (
                      <>
                        <li>Final executive confirmation on major purchases (&gt; USD 10,000)</li>
                        <li>Contract execution and commercial commitments</li>
                      </>
                    ) : (
                      <li>No approval sign-off duties assigned to this role</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-md border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  Organizational roles, approval delegations, and spending limits are governed by
                  Workspace Administrators. Contact Dara for permission adjustments.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Other Tabs Placeholder */
          <div className="rounded-lg border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            <ShieldCheck className="mx-auto size-8 text-muted-foreground mb-2" />
            <h3 className="font-semibold text-foreground text-sm capitalize">
              {activeTab} settings
            </h3>
            <p className="mt-1 text-muted-foreground">
              Configured with standard organizational security policies and enterprise SAML SSO.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
