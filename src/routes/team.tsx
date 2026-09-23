import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/kneawork/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PEOPLE, personById } from "@/lib/kneawork/data";
import { needsActionFrom, useKneaState } from "@/lib/kneawork/store";
import type { Person } from "@/lib/kneawork/types";

export const Route = createFileRoute("/team")({
  component: TeamAndRolesPage,
});

const ROLE_RESPONSIBILITIES: Record<string, string[]> = {
  u_staff: [
    "Can create and submit purchase, expense, leave, and contract requests",
    "Attach quotation receipts and vendor invoices",
    "Track real-time progress and receive resolution notifications",
  ],
  u_finance: [
    "Review vendor quotations and financial invoice accuracy",
    "Verify operational budget allocations and tax compliance",
    "Forward qualified requests to department managers",
  ],
  u_manager: [
    "Managerial approval for Operations department expenditures",
    "Approve team leave requests and schedule capacity",
    "First-line operational risk and need assessment",
  ],
  u_admin: [
    "Administer organizational templates and sequential route rules",
    "Fulfill confirmed purchase orders and vendor disbursements",
    "Workspace user management and role delegations",
  ],
  u_director: [
    "Final executive sign-off on contracts and commercial commitments",
    "Approve capital expenditures and high-value requisitions (> USD 10,000)",
    "Organization-wide governance and policy authority",
  ],
};

const REPORTS_TO: Record<string, string> = {
  u_staff: "Sokha · Manager Approver",
  u_finance: "Mr. Lim · Director",
  u_manager: "Mr. Lim · Director",
  u_admin: "Mr. Lim · Director",
  u_director: "Board of Directors",
};

export function TeamAndRolesPage() {
  const { requests, currentUserId } = useKneaState();
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Deactivation confirmation flow
  const [deactivatingMember, setDeactivatingMember] = useState<Person | null>(null);
  const [reassignOption, setReassignOption] = useState<"reassign" | "notify">("reassign");
  const [deactivateNotice, setDeactivateNotice] = useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("Operations");
  const [inviteRole, setInviteRole] = useState("Staff");

  const filtered = PEOPLE.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()),
  );

  const getWorkload = (memberId: string) => {
    const assigned = needsActionFrom(requests, memberId);
    const overdueCount = assigned.filter((r) => r.urgency === "overdue").length;
    const dueCount = assigned.filter((r) => r.urgency === "due_today").length;

    if (assigned.length === 0) return { label: "0 open", urgent: false, count: 0 };
    if (overdueCount > 0) {
      return { label: `${assigned.length} open · overdue`, urgent: true, count: assigned.length };
    }
    if (dueCount > 0) {
      return {
        label: `${assigned.length} open · ${dueCount} due`,
        urgent: true,
        count: assigned.length,
      };
    }
    return { label: `${assigned.length} open`, urgent: false, count: assigned.length };
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSuccess(inviteEmail);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setTimeout(() => setInviteSuccess(null), 6000);
  };

  const handleConfirmDeactivation = () => {
    if (!deactivatingMember) return;
    const count = getWorkload(deactivatingMember.id).count;
    setDeactivateNotice(
      `${deactivatingMember.name} has been deactivated. ${
        count > 0 && reassignOption === "reassign"
          ? `${count} open requests reassigned to Sokha (Manager).`
          : `${count} open requests left in queue with admin notification.`
      }`,
    );
    setDeactivatingMember(null);
    setSelectedMember(null);
    setTimeout(() => setDeactivateNotice(null), 6000);
  };

  return (
    <AppShell
      title="Team & Roles"
      subtitle="Manage members, departments, and approval responsibilities"
      breadcrumbs={[{ label: "Manage" }, { label: "Team & Roles" }]}
    >
      <div className="space-y-6">
        {/* Success / Action Alerts */}
        {inviteSuccess ? (
          <div className="rounded-lg border border-success-border bg-success-soft p-3.5 text-xs text-success flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-success" />
              <span>
                Invitation sent to <strong>{inviteSuccess}</strong>. Pending workspace acceptance.
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInviteSuccess(null)}
              className="h-6 w-6 p-0 text-success hover:bg-success-border/30"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {deactivateNotice ? (
          <div className="rounded-lg border border-warning-border bg-warning-soft p-3.5 text-xs text-warning flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <span>{deactivateNotice}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeactivateNotice(null)}
              className="h-6 w-6 p-0 text-warning hover:bg-warning-border/30"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}

        {/* Header Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-base font-bold text-foreground">Organization members & workload</h1>
            <p className="text-xs text-muted-foreground">
              Review team workload, approval roles, and designated signing authorities
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member, department..."
                className="h-8 rounded-md pl-8 text-xs bg-card"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold shrink-0"
            >
              <UserPlus className="size-3.5" />
              Invite member
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3">
                    Member
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    Department
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    Role
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    Workload
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 pr-4 pl-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((p) => {
                  const workload = getWorkload(p.id);
                  const isCurrent = p.id === currentUserId;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedMember(p)}
                      className="group cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      {/* Member */}
                      <td className="py-4 pl-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-full bg-foreground font-bold text-background text-xs">
                            {p.initials}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                                {p.name}
                              </span>
                              {isCurrent ? (
                                <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                  You
                                </span>
                              ) : null}
                            </div>
                            <span className="block text-[13px] text-muted-foreground">
                              {p.name.toLowerCase().replace(" ", ".")}@kneawork.com
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-3 font-medium text-foreground text-sm">{p.department}</td>

                      {/* Role */}
                      <td className="py-4 px-3">
                        <div>
                          <span className="font-semibold text-foreground text-sm">{p.role}</span>
                          <span className="block text-[13px] text-muted-foreground">
                            {p.title ?? p.role}
                          </span>
                        </div>
                      </td>

                      {/* Workload */}
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            workload.urgent
                              ? "bg-warning-soft text-warning border border-warning-border"
                              : "text-muted-foreground"
                          }`}
                        >
                          {workload.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
                          Active
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 pr-4 pl-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(p);
                          }}
                          className="font-medium"
                        >
                          View details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Member Cards */}
        <div className="sm:hidden space-y-3">
          {filtered.map((p) => {
            const workload = getWorkload(p.id);
            const isCurrent = p.id === currentUserId;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedMember(p)}
                className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="flex size-9 items-center justify-center rounded-full bg-foreground font-bold text-background text-xs shrink-0">
                      {p.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{p.name}</span>
                        {isCurrent ? (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                            You
                          </span>
                        ) : null}
                      </div>
                      <span className="block text-[13px] text-muted-foreground truncate">
                        {p.role} · {p.department}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success shrink-0">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between text-[13px] border-t border-border pt-2.5">
                  <span className="text-muted-foreground">Workload</span>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                      workload.urgent
                        ? "bg-warning-soft text-warning border border-warning-border"
                        : "text-muted-foreground"
                    }`}
                  >
                    {workload.label}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <span className="text-[13px] text-muted-foreground truncate">
                    {p.name.toLowerCase().replace(" ", ".")}@kneawork.com
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(p);
                    }}
                    className="font-medium shrink-0 ml-2"
                  >
                    Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Detail Drawer / Modal (Sentence case, clean, no test harness) */}
      {selectedMember ? (
        <Dialog open onOpenChange={(open) => !open && setSelectedMember(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                  {selectedMember.initials}
                </span>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    {selectedMember.name}
                    <span className="rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
                      Active
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {selectedMember.role} · {selectedMember.department}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Workload Breakdown */}
              <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Current approval workload
                </span>
                <p className="text-foreground font-semibold text-sm">
                  {getWorkload(selectedMember.id).label} waiting for action
                </p>
                <p className="text-xs sm:text-[13px] text-muted-foreground">
                  Average turnaround time: 4.2 hours · 0 requests currently escalated.
                </p>
              </div>

              {/* Approval Responsibilities */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
                  Approval responsibilities
                </span>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1 leading-relaxed">
                  {(ROLE_RESPONSIBILITIES[selectedMember.id] ?? ["Standard member access."]).map(
                    (item) => (
                      <li key={item}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              {/* Reporting Line */}
              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-muted-foreground">
                <span className="font-semibold text-foreground">Reports to</span>
                <span className="font-medium text-foreground">
                  {REPORTS_TO[selectedMember.id] ?? "Executive"}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between border-t border-border/60 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-danger border-border hover:bg-danger-soft hover:border-danger-border"
                onClick={() => setDeactivatingMember(selectedMember)}
              >
                Deactivate member
              </Button>
              <Button size="sm" onClick={() => setSelectedMember(null)} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Deactivate Member Confirmation Modal */}
      {deactivatingMember ? (
        <Dialog open onOpenChange={() => setDeactivatingMember(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-danger flex items-center gap-2">
                <AlertTriangle className="size-4 text-danger" />
                Deactivate {deactivatingMember.name}?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {deactivatingMember.name} has {getWorkload(deactivatingMember.id).count} open
                requests currently assigned to them. Choose how to handle pending requests before
                deactivating:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 text-xs py-2">
              <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="radio"
                  name="reassignOption"
                  checked={reassignOption === "reassign"}
                  onChange={() => setReassignOption("reassign")}
                  className="mt-0.5 text-primary"
                />
                <div>
                  <span className="font-semibold text-foreground text-sm block">
                    Reassign to another reviewer
                  </span>
                  <span className="text-xs sm:text-[13px] text-muted-foreground">
                    Open requests will automatically be reassigned to Sokha (Manager Approver).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="radio"
                  name="reassignOption"
                  checked={reassignOption === "notify"}
                  onChange={() => setReassignOption("notify")}
                  className="mt-0.5 text-primary"
                />
                <div>
                  <span className="font-semibold text-foreground text-sm block">
                    Leave assigned and notify admin
                  </span>
                  <span className="text-xs sm:text-[13px] text-muted-foreground">
                    Keep existing queue and notify Dara (Workspace Admin) to manually reassign.
                  </span>
                </div>
              </label>
            </div>

            <DialogFooter className="gap-2 sm:justify-end border-t border-border/60 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeactivatingMember(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeactivation}
                className="text-xs font-semibold"
              >
                Confirm deactivation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Invite new workspace member</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              The invited member will receive an email invitation to join the KneaWork workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label htmlFor="inv-name" className="text-foreground font-semibold">
                Full name *
              </Label>
              <Input
                id="inv-name"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Sreymom Meas"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="inv-email" className="text-foreground font-semibold">
                Work email address *
              </Label>
              <Input
                id="inv-email"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="sreymom@kneawork.com"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="inv-dept" className="text-foreground font-semibold">
                  Department
                </Label>
                <select
                  id="inv-dept"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full rounded-md border border-input bg-card p-2 text-xs text-foreground"
                >
                  <option value="Operations">Operations</option>
                  <option value="Design & Ops">Design & Ops</option>
                  <option value="Finance">Finance</option>
                  <option value="Administration">Administration</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="inv-role" className="text-foreground font-semibold">
                  Approval role
                </Label>
                <select
                  id="inv-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-md border border-input bg-card p-2 text-xs text-foreground"
                >
                  <option value="Staff">Staff</option>
                  <option value="Finance Reviewer">Finance Reviewer</option>
                  <option value="Manager Approver">Manager Approver</option>
                  <option value="Workspace Admin">Workspace Admin</option>
                  <option value="Director">Director</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInviteOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
