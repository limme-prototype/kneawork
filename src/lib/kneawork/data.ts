import type { Person, RequestType, Urgency, WorkRequest } from "./types";

export const PEOPLE: Person[] = [
  {
    id: "u_staff",
    name: "Rith",
    role: "Staff",
    title: "Staff Designer · Design & Ops",
    department: "Design & Ops",
    initials: "RT",
  },
  {
    id: "u_finance",
    name: "Vanna",
    role: "Finance Reviewer",
    title: "Finance Officer · Finance",
    department: "Finance",
    initials: "VN",
  },
  {
    id: "u_manager",
    name: "Sokha",
    role: "Manager Approver",
    title: "Team Lead · Operations",
    department: "Operations",
    initials: "SK",
  },
  {
    id: "u_admin",
    name: "Dara",
    role: "Workspace Admin",
    title: "Operations Admin · Administration",
    department: "Administration",
    initials: "DR",
  },
  {
    id: "u_director",
    name: "Mr. Lim",
    role: "Director",
    title: "Managing Director · Executive",
    department: "Executive",
    initials: "LM",
  },
];

export function personById(id: string): Person {
  return (
    PEOPLE.find((p) => p.id === id) ?? {
      id,
      name: "Unassigned",
      role: "Unassigned",
      title: "Unassigned",
      department: "—",
      initials: "?",
    }
  );
}

export function formatUrgency(urgency: Urgency): string {
  switch (urgency) {
    case "due_today":
      return "Due today";
    case "overdue":
      return "Overdue";
    case "normal":
    default:
      return "Normal timeline";
  }
}

export interface WorkflowTemplate {
  type: RequestType;
  label: string;
  description: string;
  purpose: string;
  valueLabel: string;
  valuePlaceholder: string;
  requiresAttachment: boolean;
  fieldsCount: number;
  evidenceRule: string;
  version: string;
  versionStatus: "Published" | "Draft" | "Archived";
  updatedDate: string;
  ownerName: string;
}

export const TEMPLATES: WorkflowTemplate[] = [
  {
    type: "purchase",
    label: "Purchase Request",
    description: "Buy goods or services from a vendor",
    purpose:
      "Procure equipment, software, or external services requiring supplier quotations and spend verification.",
    valueLabel: "Amount (USD)",
    valuePlaceholder: "e.g. 850.00",
    requiresAttachment: true,
    fieldsCount: 7,
    evidenceRule: "Official supplier quotation required for requests above USD 100",
    version: "1.2",
    versionStatus: "Published",
    updatedDate: "10 Sep 2026",
    ownerName: "Dara · Operations Admin",
  },
  {
    type: "expense",
    label: "Expense Claim",
    description: "Claim money you already spent",
    purpose:
      "Reimburse out-of-pocket business travel, team meals, or urgent office operational expenses.",
    valueLabel: "Amount (USD)",
    valuePlaceholder: "e.g. 86.50",
    requiresAttachment: true,
    fieldsCount: 5,
    evidenceRule: "Original fiscal tax receipt or Telegram transfer proof required",
    version: "1.1",
    versionStatus: "Published",
    updatedDate: "05 Sep 2026",
    ownerName: "Vanna · Finance Reviewer",
  },
  {
    type: "leave",
    label: "Leave Request",
    description: "Request time away from work",
    purpose:
      "Schedule annual leave, medical leave, or personal time-off with direct team lead verification.",
    valueLabel: "Duration",
    valuePlaceholder: "e.g. 3 days",
    requiresAttachment: false,
    fieldsCount: 4,
    evidenceRule: "Medical certificate required for sick leaves exceeding 2 consecutive days",
    version: "1.0",
    versionStatus: "Published",
    updatedDate: "01 Sep 2026",
    ownerName: "Dara · Operations Admin",
  },
  {
    type: "contract",
    label: "Contract Approval",
    description: "Get a document or agreement approved",
    purpose:
      "Formal review and legal sign-off for client retainers, vendor MoUs, or commercial lease agreements.",
    valueLabel: "Contract value",
    valuePlaceholder: "e.g. USD 12,000 / 12 months",
    requiresAttachment: true,
    fieldsCount: 6,
    evidenceRule: "Final PDF draft and legal risk assessment required",
    version: "2.0",
    versionStatus: "Published",
    updatedDate: "12 Sep 2026",
    ownerName: "Mr. Lim · Executive Director",
  },
];

export function templateByType(type: string): WorkflowTemplate | undefined {
  return TEMPLATES.find((t) => t.type === type);
}

export const ROUTES_BY_TYPE: Record<RequestType, { name: string; assigneeId: string }[]> = {
  purchase: [
    { name: "Finance Review", assigneeId: "u_finance" },
    { name: "Manager Approval", assigneeId: "u_manager" },
    { name: "Director Confirmation", assigneeId: "u_director" },
  ],
  expense: [
    { name: "Finance Review", assigneeId: "u_finance" },
    { name: "Manager Approval", assigneeId: "u_manager" },
  ],
  leave: [{ name: "Manager Approval", assigneeId: "u_manager" }],
  contract: [
    { name: "Finance Review", assigneeId: "u_finance" },
    { name: "Manager Approval", assigneeId: "u_manager" },
    { name: "Director Confirmation", assigneeId: "u_director" },
  ],
};

export const ROUTE_STEPS = ROUTES_BY_TYPE.purchase;

export const SEED_REQUESTS: WorkRequest[] = [
  {
    id: "r1",
    code: "#0021",
    type: "purchase",
    title: "Laptop Purchase (Dell)",
    requesterId: "u_staff",
    department: "Design & Ops",
    valueLabel: "$850.00",
    reason: "Laptop for design work and daily tasks. Needed for upcoming project delivery.",
    status: "in_review",
    urgency: "due_today",
    submittedLabel: "Submitted 10 Sep 2026, 09:15 AM",
    updatedLabel: "Updated 10:03 AM",
    steps: [
      {
        id: "r1s1",
        name: "Finance Review",
        assigneeId: "u_finance",
        status: "approved",
        dueLabel: "Due today",
        decidedLabel: "Reviewed 10:03 AM",
        note: "Within budget.",
      },
      {
        id: "r1s2",
        name: "Manager Approval",
        assigneeId: "u_manager",
        status: "pending",
        dueLabel: "Waiting for your approval",
      },
      {
        id: "r1s3",
        name: "Admin Confirmation",
        assigneeId: "u_admin",
        status: "locked",
        dueLabel: "Pending",
      },
    ],
    attachments: [
      { id: "a1", filename: "quotation.pdf", size: "245 KB" },
      { id: "a2", filename: "specification.pdf", size: "120 KB" },
    ],
    audit: [
      {
        id: "e1",
        actorId: "u_staff",
        action: "Submitted request",
        timestampLabel: "10 Sep 2026, 09:15 AM",
        comment: "Please approve. This laptop is for design work. Needed for Q4 project delivery.",
        channel: "Web",
      },
      {
        id: "e2",
        actorId: "u_finance",
        action: "Assigned to Finance Review",
        timestampLabel: "10 Sep 2026, 09:16 AM",
        channel: "System",
      },
      {
        id: "e3",
        actorId: "u_finance",
        action: "Finance Review approved",
        timestampLabel: "10 Sep 2026, 10:03 AM",
        comment: "Quotation verified against vendor catalog. Within allocated department budget.",
        channel: "Web",
      },
      {
        id: "e4",
        actorId: "u_manager",
        action: "Forwarded to Manager Approval",
        timestampLabel: "10 Sep 2026, 10:04 AM",
        channel: "System",
      },
      {
        id: "e5",
        actorId: "u_manager",
        action: "Automated reminder notification sent",
        timestampLabel: "10 Sep 2026, 02:00 PM",
        comment: "Notification sent via Telegram bot: '1 request pending your sign-off'.",
        channel: "System",
      },
    ],
  },
  {
    id: "r2",
    code: "EX-1188",
    type: "expense",
    title: "Client meeting transport and lunch",
    requesterId: "u_staff",
    department: "Operations",
    valueLabel: "USD 86.50",
    reason:
      "Travel to Sihanoukville to meet the distributor and a working lunch with two of their staff.",
    status: "in_review",
    urgency: "due_today",
    submittedLabel: "Submitted yesterday",
    updatedLabel: "Updated 2 hours ago",
    steps: [
      {
        id: "r2s1",
        name: "Finance Review",
        assigneeId: "u_finance",
        status: "pending",
        dueLabel: "Due today",
      },
      {
        id: "r2s2",
        name: "Manager Approval",
        assigneeId: "u_manager",
        status: "locked",
        dueLabel: "Due in 2 days",
      },
      {
        id: "r2s3",
        name: "Director Confirmation",
        assigneeId: "u_director",
        status: "locked",
        dueLabel: "Due in 3 days",
      },
    ],
    attachments: [{ id: "a3", filename: "receipts-combined.pdf", size: "780 KB" }],
    audit: [
      {
        id: "e3",
        actorId: "u_staff",
        action: "Submitted request",
        timestampLabel: "Yesterday",
        channel: "Mobile",
      },
    ],
  },
  {
    id: "r3",
    code: "LV-0342",
    type: "leave",
    title: "Annual leave — family wedding",
    requesterId: "u_manager",
    department: "Operations",
    valueLabel: "3 days (24–26 Sep)",
    reason: "Family wedding in Battambang. Handover notes prepared for Sokha.",
    status: "in_review",
    urgency: "normal",
    submittedLabel: "Submitted 2 days ago",
    updatedLabel: "Updated yesterday",
    steps: [
      {
        id: "r3s1",
        name: "Finance Review",
        assigneeId: "u_finance",
        status: "approved",
        dueLabel: "Due 2 days ago",
        decidedLabel: "Approved yesterday",
        note: "No payroll impact.",
      },
      {
        id: "r3s2",
        name: "Manager Approval",
        assigneeId: "u_manager",
        status: "skipped",
        dueLabel: "—",
        decidedLabel: "Skipped — requester is the step owner",
      },
      {
        id: "r3s3",
        name: "Director Confirmation",
        assigneeId: "u_director",
        status: "pending",
        dueLabel: "Due tomorrow",
      },
    ],
    attachments: [],
    audit: [
      {
        id: "e4",
        actorId: "u_manager",
        action: "Submitted request",
        timestampLabel: "2 days ago",
        channel: "Mobile",
      },
      {
        id: "e5",
        actorId: "u_finance",
        action: "Approved Finance Review",
        timestampLabel: "Yesterday",
        comment: "No payroll impact.",
        channel: "Mobile",
      },
    ],
  },
  {
    id: "r4",
    code: "CT-0091",
    type: "contract",
    title: "Renew cleaning service agreement",
    requesterId: "u_admin",
    department: "People & Admin",
    valueLabel: "USD 3,600 / 12 months",
    reason: "Current agreement ends 30 September. Same vendor, same monthly rate.",
    status: "changes_requested",
    urgency: "normal",
    submittedLabel: "Submitted 4 days ago",
    updatedLabel: "Updated 2 days ago",
    steps: [
      {
        id: "r4s1",
        name: "Finance Review",
        assigneeId: "u_finance",
        status: "changes_requested",
        dueLabel: "Due 3 days ago",
        decidedLabel: "Changes requested 2 days ago",
        note: "Please attach the signed vendor renewal letter before I can review the value.",
      },
      {
        id: "r4s2",
        name: "Manager Approval",
        assigneeId: "u_manager",
        status: "locked",
        dueLabel: "Due in 2 days",
      },
      {
        id: "r4s3",
        name: "Director Confirmation",
        assigneeId: "u_director",
        status: "locked",
        dueLabel: "Due in 3 days",
      },
    ],
    attachments: [{ id: "a4", filename: "draft-agreement-v2.pdf", size: "240 KB" }],
    audit: [
      {
        id: "e6",
        actorId: "u_admin",
        action: "Submitted request",
        timestampLabel: "4 days ago",
        channel: "Web",
      },
      {
        id: "e7",
        actorId: "u_finance",
        action: "Requested changes at Finance Review",
        timestampLabel: "2 days ago",
        comment: "Please attach the signed vendor renewal letter.",
        channel: "Mobile",
      },
    ],
  },
  {
    id: "r5",
    code: "PR-2038",
    type: "purchase",
    title: "Office water delivery — September",
    requesterId: "u_staff",
    department: "Operations",
    valueLabel: "USD 120.00",
    reason: "Monthly drinking water delivery for the office.",
    status: "approved",
    urgency: "normal",
    submittedLabel: "Submitted 8 days ago",
    updatedLabel: "Completed 5 days ago",
    steps: [
      {
        id: "r5s1",
        name: "Finance Review",
        assigneeId: "u_finance",
        status: "approved",
        dueLabel: "Due 7 days ago",
        decidedLabel: "Approved 7 days ago",
      },
      {
        id: "r5s2",
        name: "Manager Approval",
        assigneeId: "u_manager",
        status: "approved",
        dueLabel: "Due 6 days ago",
        decidedLabel: "Approved 6 days ago",
      },
      {
        id: "r5s3",
        name: "Director Confirmation",
        assigneeId: "u_director",
        status: "approved",
        dueLabel: "Due 5 days ago",
        decidedLabel: "Approved 5 days ago",
        note: "Recurring cost, within budget.",
      },
    ],
    attachments: [{ id: "a5", filename: "water-supplier-invoice.pdf", size: "96 KB" }],
    audit: [
      {
        id: "e8",
        actorId: "u_staff",
        action: "Submitted request",
        timestampLabel: "8 days ago",
        channel: "Mobile",
      },
      {
        id: "e9",
        actorId: "u_director",
        action: "Approved Director Confirmation",
        timestampLabel: "5 days ago",
        comment: "Recurring cost, within budget.",
        channel: "Mobile",
      },
    ],
  },
  {
    id: "r6",
    code: "EX-1180",
    type: "expense",
    title: "Duplicate taxi claim",
    requesterId: "u_staff",
    department: "Operations",
    valueLabel: "USD 14.00",
    reason: "Taxi to the bank.",
    status: "rejected",
    urgency: "normal",
    submittedLabel: "Submitted 10 days ago",
    updatedLabel: "Completed 9 days ago",
    steps: [
      {
        id: "r6s1",
        name: "Finance Review",
        assigneeId: "u_finance",
        status: "rejected",
        dueLabel: "Due 9 days ago",
        decidedLabel: "Rejected 9 days ago",
        note: "Already claimed on EX-1174.",
      },
      {
        id: "r6s2",
        name: "Manager Approval",
        assigneeId: "u_manager",
        status: "cancelled",
        dueLabel: "—",
      },
      {
        id: "r6s3",
        name: "Director Confirmation",
        assigneeId: "u_director",
        status: "cancelled",
        dueLabel: "—",
      },
    ],
    attachments: [],
    audit: [
      {
        id: "e10",
        actorId: "u_staff",
        action: "Submitted request",
        timestampLabel: "10 days ago",
        channel: "Mobile",
      },
      {
        id: "e11",
        actorId: "u_finance",
        action: "Rejected at Finance Review",
        timestampLabel: "9 days ago",
        comment: "Already claimed on EX-1174.",
        channel: "Mobile",
      },
    ],
  },
];
