export type RequestType = "purchase" | "expense" | "leave" | "contract";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "cancelled";

export type ApprovalStepStatus =
  | "locked"
  | "pending"
  | "approved"
  | "changes_requested"
  | "rejected"
  | "skipped"
  | "reassigned"
  | "cancelled";

export type Urgency = "normal" | "due_today" | "overdue";

export interface Person {
  id: string;
  name: string;
  role: string;
  title?: string;
  department: string;
  initials: string;
}

export interface ApprovalStep {
  id: string;
  name: string;
  assigneeId: string;
  status: ApprovalStepStatus;
  dueLabel: string;
  decidedLabel?: string | undefined;
  note?: string | undefined;
}

export interface Attachment {
  id: string;
  filename: string;
  size: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  timestampLabel: string;
  comment?: string | undefined;
  channel: "Web" | "Mobile" | "System";
}

export interface WorkRequest {
  id: string;
  code: string;
  type: RequestType;
  title: string;
  requesterId: string;
  department: string;
  valueLabel: string;
  reason: string;
  status: RequestStatus;
  urgency: Urgency;
  submittedLabel: string;
  updatedLabel: string;
  steps: ApprovalStep[];
  attachments: Attachment[];
  audit: AuditEntry[];
}

export type Decision = "approve" | "changes" | "reject";
