import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Shield,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { AppShell } from "@/components/kneawork/app-shell";
import { PageHeader } from "@/components/kneawork/page-header";
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
import {
  DataTable,
  DataTableColumnHeader,
  DataTableMobileCard,
  type DataTableFilterableColumn,
  type DataTableFilterPillsConfig,
} from "@/components/shared/data-table";
import { cn } from "@/lib/utils";

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
  const [selectedMember, setSelectedMember] = React.useState<Person | null>(null);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteSuccess, setInviteSuccess] = React.useState<string | null>(null);

  // Deactivation confirmation flow
  const [deactivatingMember, setDeactivatingMember] = React.useState<Person | null>(null);
  const [reassignOption, setReassignOption] = React.useState<"reassign" | "notify">("reassign");
  const [deactivateNotice, setDeactivateNotice] = React.useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteDept, setInviteDept] = React.useState("Operations");
  const [inviteRole, setInviteRole] = React.useState("Staff");

  const getWorkload = React.useCallback(
    (memberId: string) => {
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
    },
    [requests],
  );

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

  // DataTable column definitions
  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
        cell: ({ row }) => {
          const p = row.original;
          const isCurrent = p.id === currentUserId;
          return (
            <div className="flex items-center gap-2.5 py-1">
              <span className="flex size-8 items-center justify-center rounded-full bg-foreground font-bold text-background text-xs shrink-0">
                {p.initials}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                    {p.name}
                  </span>
                  {isCurrent ? (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      You
                    </span>
                  ) : null}
                </div>
                <span className="block text-[12px] text-muted-foreground truncate">
                  {p.name.toLowerCase().replace(/\s+/g, ".")}@kneawork.com
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => (
          <span className="font-medium text-foreground text-xs sm:text-sm">
            {row.original.department}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="text-xs">
              <span className="font-semibold text-foreground text-xs sm:text-sm block">
                {p.role}
              </span>
              <span className="block text-[11px] text-muted-foreground">{p.title ?? p.role}</span>
            </div>
          );
        },
      },
      {
        id: "workload",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Workload" />,
        accessorFn: (row) => getWorkload(row.id).count,
        cell: ({ row }) => {
          const workload = getWorkload(row.original.id);
          return (
            <span
              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                workload.urgent
                  ? "bg-warning-soft text-warning border border-warning-border"
                  : "text-muted-foreground"
              }`}
            >
              {workload.label}
            </span>
          );
        },
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: () => (
          <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
            Active
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end" data-no-row-click>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMember(p)}
                className="font-medium text-xs h-8 px-2.5"
              >
                View details
              </Button>
            </div>
          );
        },
      },
    ],
    [currentUserId, getWorkload],
  );

  const filterableColumns = React.useMemo<DataTableFilterableColumn[]>(
    () => [
      {
        id: "department",
        title: "Department",
        options: Array.from(new Set(PEOPLE.map((p) => p.department))).map((dept) => ({
          value: dept,
          label: dept,
          count: PEOPLE.filter((p) => p.department === dept).length,
        })),
      },
      {
        id: "role",
        title: "Role",
        options: Array.from(new Set(PEOPLE.map((p) => p.role))).map((role) => ({
          value: role,
          label: role,
          count: PEOPLE.filter((p) => p.role === role).length,
        })),
      },
    ],
    [],
  );

  const filterPills = React.useMemo<DataTableFilterPillsConfig>(
    () => ({
      columnId: "department",
      allLabel: "All",
      allCount: PEOPLE.length,
      items: Array.from(new Set(PEOPLE.map((p) => p.department))).map((dept) => ({
        value: dept,
        label: dept,
        count: PEOPLE.filter((p) => p.department === dept).length,
      })),
    }),
    [],
  );

  const renderMobileCard = React.useCallback(
    (p: Person) => {
      const workload = getWorkload(p.id);
      const isCurrent = p.id === currentUserId;

      return (
        <DataTableMobileCard
          key={p.id}
          onClick={() => setSelectedMember(p)}
          title={
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-foreground font-bold text-background text-xs shrink-0">
                {p.initials}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="font-semibold text-foreground text-sm truncate">{p.name}</span>
                {isCurrent && (
                  <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                    You
                  </span>
                )}
              </div>
            </div>
          }
          subtitle={`${p.role} · ${p.department}`}
          status={
            <span className="inline-flex items-center gap-1 rounded bg-success-soft border border-success-border px-2 py-0.5 text-xs font-semibold text-success">
              Active
            </span>
          }
          attributes={[
            {
              label: "Workload",
              value: (
                <span
                  className={cn(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
                    workload.urgent
                      ? "bg-warning-soft text-warning border border-warning-border"
                      : "text-muted-foreground",
                  )}
                >
                  {workload.label}
                </span>
              ),
            },
            {
              label: "Contact",
              value: (
                <span className="text-muted-foreground text-xs truncate">
                  {p.name.toLowerCase().replace(/\s+/g, ".")}@kneawork.com
                </span>
              ),
            },
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMember(p)}
              className="font-medium text-xs h-8 px-3"
            >
              Details
            </Button>
          }
        />
      );
    },
    [currentUserId, getWorkload],
  );

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

        {/* Standard PageHeader */}
        <PageHeader
          eyebrow="Manage"
          title={`Team & Roles (${PEOPLE.length})`}
          description="Review team workload, approval roles, and designated signing authorities across departments."
          actions={
            <Button
              size="default"
              onClick={() => setIsInviteOpen(true)}
              className="gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 shadow-2xs"
            >
              <UserPlus className="size-4" />
              Invite member
            </Button>
          }
        />

        {/* Generic DataTable for Team Members */}
        <DataTable<Person>
          data={PEOPLE}
          columns={columns}
          getRowId={(p) => p.id}
          mode="auto"
          searchPlaceholder="Search member, department, role..."
          filterableColumns={filterableColumns}
          filterPills={filterPills}
          renderMobileCard={renderMobileCard}
          onRowClick={(p) => setSelectedMember(p)}
          emptyTitle="No team members found"
          emptyDescription="No members match the specified search or filter criteria."
        />
      </div>

      {/* Member Detail Drawer / Modal */}
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
