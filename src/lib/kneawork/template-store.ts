import { useSyncExternalStore } from "react";
import type {
  ExtendedTemplate,
  TemplateField,
  TemplateRouteStep,
  ValidationIssue,
} from "./template-types";

export interface WorkspaceRole {
  id: string;
  name: string;
  department: string;
  activeAssigneeId?: string | undefined;
  activeAssigneeName?: string | undefined;
}

export const WORKSPACE_ROLES: WorkspaceRole[] = [
  {
    id: "role_finance",
    name: "Finance Reviewer",
    department: "Finance",
    activeAssigneeId: "u_finance",
    activeAssigneeName: "Vanna",
  },
  {
    id: "role_manager",
    name: "Department Manager",
    department: "Operations",
    activeAssigneeId: "u_manager",
    activeAssigneeName: "Sokha",
  },
  {
    id: "role_director",
    name: "Executive Director",
    department: "Executive",
    activeAssigneeId: "u_director",
    activeAssigneeName: "Mr. Lim",
  },
  {
    id: "role_admin",
    name: "Operations Admin",
    department: "Administration",
    activeAssigneeId: "u_admin",
    activeAssigneeName: "Dara",
  },
  {
    id: "role_hr",
    name: "HR Reviewer",
    department: "Human Resources",
    activeAssigneeId: undefined, // Demonstrates role with no active member
    activeAssigneeName: undefined,
  },
];

export const INITIAL_EXTENDED_TEMPLATES: ExtendedTemplate[] = [
  {
    id: "tmpl_purchase",
    type: "purchase",
    label: "Purchase Request",
    description: "Buy goods or services from an approved vendor",
    category: "purchase",
    departmentScope: "All departments",
    whoCanSubmit: "All members",
    ownerId: "u_admin",
    ownerName: "Dara · Operations Admin",
    typicalCompletionTime: "1–2 business days",
    completionOutcome: "Approved purchase ready for fulfillment and vendor invoice processing",
    version: "1.2",
    versionStatus: "Published",
    updatedDate: "10 Sep 2026",
    usageCount: 18,
    lastUsed: "Today",
    fields: [
      {
        id: "f1",
        label: "Title / item",
        type: "text",
        helpText: "Concise summary of goods or services requested",
        required: true,
        section: "required",
      },
      {
        id: "f2",
        label: "Amount",
        type: "amount",
        helpText: "Total monetary expenditure",
        required: true,
        section: "required",
      },
      {
        id: "f3",
        label: "Currency",
        type: "currency",
        helpText: "Default USD or KHR",
        required: true,
        section: "required",
      },
      {
        id: "f4",
        label: "Needed-by date",
        type: "date",
        helpText: "Target fulfillment deadline",
        required: true,
        section: "required",
      },
      {
        id: "f5",
        label: "Business justification",
        type: "textarea",
        helpText: "Operational context explaining the business need",
        required: true,
        section: "required",
      },
      {
        id: "f6",
        label: "Vendor",
        type: "text",
        helpText: "Supplier or merchant name",
        required: false,
        section: "supporting",
      },
      {
        id: "f7",
        label: "Quotation attachment",
        type: "file",
        helpText: "Official vendor quotation or price breakdown",
        required: true,
        section: "supporting",
      },
    ],
    routeSteps: [
      {
        id: "s1",
        name: "Finance Review",
        roleId: "role_finance",
        roleName: "Finance Reviewer",
        assigneeId: "u_finance",
        assigneeName: "Vanna",
        responsibility: "Checks quotation, receipt, and budget availability",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
      {
        id: "s2",
        name: "Manager Approval",
        roleId: "role_manager",
        roleName: "Department Manager",
        assigneeId: "u_manager",
        assigneeName: "Sokha",
        responsibility: "Confirms the business operational need and department priority",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
      {
        id: "s3",
        name: "Director Confirmation",
        roleId: "role_director",
        roleName: "Executive Director",
        assigneeId: "u_director",
        assigneeName: "Mr. Lim",
        responsibility: "Final executive confirmation for capital expenditures",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "escalate",
      },
    ],
    rules: {
      departmentScope: "All departments",
      minAmount: 0,
      maxAmount: 10000,
      requireQuotation: true,
      quotationThreshold: 100,
      requireReceipt: false,
      requireManagerNote: false,
      requireLegalAssessment: false,
      allowedFileTypes: ["PDF", "JPG", "PNG"],
      maxFileSizeMb: 10,
      conditionalDirectorAbove: 10000,
      onMissingEvidence: "prevent",
    },
  },
  {
    id: "tmpl_expense",
    type: "expense",
    label: "Expense Claim",
    description: "Claim reimbursement for money already spent on behalf of the company",
    category: "expense",
    departmentScope: "All departments",
    whoCanSubmit: "All members",
    ownerId: "u_finance",
    ownerName: "Vanna · Finance Reviewer",
    typicalCompletionTime: "1–2 business days",
    completionOutcome: "Approved claim released for bank transfer or cash payment",
    version: "1.1",
    versionStatus: "Published",
    updatedDate: "05 Sep 2026",
    usageCount: 24,
    lastUsed: "Yesterday",
    fields: [
      {
        id: "ef1",
        label: "Expense purpose",
        type: "text",
        helpText: "Client dinner, transport, supplies, etc.",
        required: true,
        section: "required",
      },
      {
        id: "ef2",
        label: "Amount spent",
        type: "amount",
        helpText: "Exact total indicated on receipts",
        required: true,
        section: "required",
      },
      {
        id: "ef3",
        label: "Expense date",
        type: "date",
        helpText: "Date the transaction took place",
        required: true,
        section: "required",
      },
      {
        id: "ef4",
        label: "Receipt or payment slip",
        type: "file",
        helpText: "Scanned paper receipt or Telegram transfer screenshot",
        required: true,
        section: "required",
      },
      {
        id: "ef5",
        label: "Additional notes",
        type: "textarea",
        helpText: "Any notes regarding attendees or project allocation",
        required: false,
        section: "supporting",
      },
    ],
    routeSteps: [
      {
        id: "es1",
        name: "Finance Review",
        roleId: "role_finance",
        roleName: "Finance Reviewer",
        assigneeId: "u_finance",
        assigneeName: "Vanna",
        responsibility: "Validates tax receipt eligibility, amounts, and account coding",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
      {
        id: "es2",
        name: "Manager Approval",
        roleId: "role_manager",
        roleName: "Department Manager",
        assigneeId: "u_manager",
        assigneeName: "Sokha",
        responsibility: "Confirms member was authorized to incur the expense",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
    ],
    rules: {
      departmentScope: "All departments",
      minAmount: 0,
      maxAmount: 2500,
      requireQuotation: false,
      requireReceipt: true,
      requireManagerNote: false,
      requireLegalAssessment: false,
      allowedFileTypes: ["PDF", "JPG", "PNG"],
      maxFileSizeMb: 10,
      onMissingEvidence: "prevent",
    },
  },
  {
    id: "tmpl_leave",
    type: "leave",
    label: "Leave Request",
    description: "Request time away from work for annual, personal, or sick leave",
    category: "leave",
    departmentScope: "All departments",
    whoCanSubmit: "Full-time staff",
    ownerId: "u_admin",
    ownerName: "Dara · Operations Admin",
    typicalCompletionTime: "1 business day",
    completionOutcome: "Leave calendar booked and attendance record adjusted",
    version: "1.0",
    versionStatus: "Published",
    updatedDate: "01 Sep 2026",
    usageCount: 42,
    lastUsed: "2 days ago",
    fields: [
      {
        id: "lf1",
        label: "Leave type",
        type: "select",
        helpText: "Annual leave, sick leave, compassionate leave",
        required: true,
        section: "required",
        options: ["Annual Leave", "Sick Leave", "Unpaid Leave", "Maternity / Paternity"],
      },
      {
        id: "lf2",
        label: "Duration & dates",
        type: "daterange",
        helpText: "Start and end calendar dates",
        required: true,
        section: "required",
      },
      {
        id: "lf3",
        label: "Reason",
        type: "textarea",
        helpText: "Brief note explaining coverage or reason",
        required: true,
        section: "required",
      },
      {
        id: "lf4",
        label: "Handover contact",
        type: "person",
        helpText: "Colleague covering urgent responsibilities",
        required: false,
        section: "supporting",
      },
    ],
    routeSteps: [
      {
        id: "ls1",
        name: "Manager Approval",
        roleId: "role_manager",
        roleName: "Department Manager",
        assigneeId: "u_manager",
        assigneeName: "Sokha",
        responsibility: "Ensures adequate team roster coverage during requested absence",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
    ],
    rules: {
      departmentScope: "All departments",
      requireQuotation: false,
      requireReceipt: false,
      requireManagerNote: false,
      requireLegalAssessment: false,
      allowedFileTypes: ["PDF", "JPG", "PNG"],
      maxFileSizeMb: 5,
      onMissingEvidence: "prevent",
    },
  },
  {
    id: "tmpl_contract",
    type: "contract",
    label: "Contract Approval",
    description: "Get legal and management approval for commercial agreements and leases",
    category: "contract",
    departmentScope: "Operations, Management",
    whoCanSubmit: "Managers only",
    ownerId: "u_director",
    ownerName: "Mr. Lim · Executive Director",
    typicalCompletionTime: "3–4 business days",
    completionOutcome: "Executed legal contract countersigned and filed to corporate registry",
    version: "2.0",
    versionStatus: "Published",
    updatedDate: "12 Sep 2026",
    usageCount: 8,
    lastUsed: "3 days ago",
    fields: [
      {
        id: "cf1",
        label: "Counterparty / entity",
        type: "text",
        helpText: "Name of registered company or individual",
        required: true,
        section: "required",
      },
      {
        id: "cf2",
        label: "Contract value",
        type: "amount",
        helpText: "Total monetary commitment",
        required: true,
        section: "required",
      },
      {
        id: "cf3",
        label: "Term & effective dates",
        type: "daterange",
        helpText: "Agreement duration",
        required: true,
        section: "required",
      },
      {
        id: "cf4",
        label: "Draft agreement file",
        type: "file",
        helpText: "Latest reviewed PDF or Word document",
        required: true,
        section: "required",
      },
      {
        id: "cf5",
        label: "Executive summary & risks",
        type: "textarea",
        helpText: "Key commitments, termination clauses, and liabilities",
        required: true,
        section: "required",
      },
    ],
    routeSteps: [
      {
        id: "cs1",
        name: "Finance Review",
        roleId: "role_finance",
        roleName: "Finance Reviewer",
        assigneeId: "u_finance",
        assigneeName: "Vanna",
        responsibility: "Reviews payment schedules, currency exposure, and tax withholding",
        decisionType: "single",
        dueDays: 2,
        onOverdue: "remind",
      },
      {
        id: "cs2",
        name: "Manager Approval",
        roleId: "role_manager",
        roleName: "Department Manager",
        assigneeId: "u_manager",
        assigneeName: "Sokha",
        responsibility: "Verifies deliverables, timeline feasibility, and operational capacity",
        decisionType: "single",
        dueDays: 2,
        onOverdue: "remind",
      },
      {
        id: "cs3",
        name: "Director Confirmation",
        roleId: "role_director",
        roleName: "Executive Director",
        assigneeId: "u_director",
        assigneeName: "Mr. Lim",
        responsibility: "Final corporate signatory authority and binding execution",
        decisionType: "single",
        dueDays: 2,
        onOverdue: "escalate",
      },
    ],
    rules: {
      departmentScope: "Operations, Management",
      minAmount: 1000,
      maxAmount: 100000,
      requireQuotation: false,
      requireReceipt: false,
      requireManagerNote: true,
      requireLegalAssessment: true,
      allowedFileTypes: ["PDF"],
      maxFileSizeMb: 25,
      onMissingEvidence: "prevent",
    },
  },
];

interface TemplateStoreState {
  templates: ExtendedTemplate[];
  drafts: Record<string, ExtendedTemplate>;
}

let templateStoreState: TemplateStoreState = {
  templates: INITIAL_EXTENDED_TEMPLATES,
  drafts: {},
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeTemplateStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return templateStoreState;
}

export function useTemplates() {
  return useSyncExternalStore(subscribeTemplateStore, getSnapshot, getSnapshot);
}

export function createBlankTemplate(): ExtendedTemplate {
  return {
    id: `tmpl_${Date.now()}`,
    type: "general",
    label: "",
    description: "",
    category: "purchase",
    departmentScope: "All departments",
    whoCanSubmit: "All members",
    ownerId: "u_admin",
    ownerName: "Dara · Operations Admin",
    typicalCompletionTime: "1–2 business days",
    completionOutcome: "",
    version: "1.0",
    versionStatus: "Draft",
    updatedDate: "Just now",
    usageCount: 0,
    lastUsed: "Never",
    fields: [
      {
        id: "f_title",
        label: "Title / item",
        type: "text",
        helpText: "What is being requested",
        required: true,
        section: "required",
      },
      {
        id: "f_justification",
        label: "Business justification",
        type: "textarea",
        helpText: "Explain why this expenditure or request is necessary",
        required: true,
        section: "required",
      },
      {
        id: "f_needed_by",
        label: "Needed-by date",
        type: "date",
        helpText: "Target completion or delivery date",
        required: true,
        section: "required",
      },
    ],
    routeSteps: [
      {
        id: "rs_finance",
        name: "Finance Review",
        roleId: "role_finance",
        roleName: "Finance Reviewer",
        assigneeId: "u_finance",
        assigneeName: "Vanna",
        responsibility: "Checks quotation, receipt, and budget availability",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
      {
        id: "rs_manager",
        name: "Manager Approval",
        roleId: "role_manager",
        roleName: "Department Manager",
        assigneeId: "u_manager",
        assigneeName: "Sokha",
        responsibility: "Confirms the business operational need",
        decisionType: "single",
        dueDays: 1,
        onOverdue: "remind",
      },
    ],
    rules: {
      departmentScope: "All departments",
      minAmount: 0,
      maxAmount: 10000,
      requireQuotation: true,
      quotationThreshold: 100,
      requireReceipt: false,
      requireManagerNote: false,
      requireLegalAssessment: false,
      allowedFileTypes: ["PDF", "JPG", "PNG"],
      maxFileSizeMb: 10,
      conditionalDirectorAbove: 10000,
      onMissingEvidence: "prevent",
    },
  };
}

export function validateTemplate(tmpl: ExtendedTemplate): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Step 1: Basics
  if (!tmpl.label.trim() || tmpl.label.trim().length < 3) {
    issues.push({
      step: 1,
      field: "label",
      message: "Template name must be at least 3 characters",
      fixLabel: "Fix name",
    });
  }
  if (!tmpl.description.trim() || tmpl.description.trim().length < 10) {
    issues.push({
      step: 1,
      field: "description",
      message: "Short description must be at least 10 characters",
      fixLabel: "Fix description",
    });
  }
  if (!tmpl.completionOutcome.trim()) {
    issues.push({
      step: 1,
      field: "completionOutcome",
      message: "Completion outcome must be defined to prevent ambiguous requests",
      fixLabel: "Define outcome",
    });
  }

  // Step 2: Request Form
  const requiredFields = tmpl.fields.filter((f) => f.required);
  if (requiredFields.length === 0) {
    issues.push({
      step: 2,
      field: "fields",
      message: "Request form must have at least one required field",
      fixLabel: "Add required field",
    });
  }

  // Step 3: Approval Route
  if (tmpl.routeSteps.length === 0) {
    issues.push({
      step: 3,
      field: "routeSteps",
      message: "At least one approval step is required",
      fixLabel: "Add step",
    });
  }

  tmpl.routeSteps.forEach((step, idx) => {
    if (!step.name.trim()) {
      issues.push({
        step: 3,
        field: `step_name_${idx}`,
        message: `Step ${idx + 1} is missing a step name`,
        fixLabel: "Name step",
      });
    }
    if (!step.responsibility.trim()) {
      issues.push({
        step: 3,
        field: `step_resp_${idx}`,
        message: `Step "${step.name || idx + 1}" must have a decision responsibility defined`,
        fixLabel: "Define responsibility",
      });
    }

    // Role-first check: role must have an active member in workspace
    const role = WORKSPACE_ROLES.find((r) => r.id === step.roleId);
    if (!role || !role.activeAssigneeId) {
      issues.push({
        step: 3,
        field: `step_role_${idx}`,
        message: `${step.roleName || "Assigned role"} has no active member assigned in workspace`,
        fixLabel: "Fix assignment",
      });
    }
  });

  // Step 4: Rules & Evidence
  if (
    tmpl.rules.requireQuotation &&
    (tmpl.rules.quotationThreshold === undefined || tmpl.rules.quotationThreshold < 0)
  ) {
    issues.push({
      step: 4,
      field: "quotationThreshold",
      message: "Quotation requirement requires a valid threshold amount",
      fixLabel: "Fix rule",
    });
  }

  return issues;
}

export function saveDraftTemplate(tmpl: ExtendedTemplate) {
  const updated: ExtendedTemplate = {
    ...tmpl,
    versionStatus: "Draft",
    updatedDate: "Draft saved just now",
  };
  templateStoreState = {
    ...templateStoreState,
    drafts: {
      ...templateStoreState.drafts,
      [tmpl.id]: updated,
    },
  };
  emit();
  return updated;
}

export function publishTemplate(tmpl: ExtendedTemplate) {
  const publishedVersion = tmpl.versionStatus === "Draft" ? tmpl.version : tmpl.version;
  const published: ExtendedTemplate = {
    ...tmpl,
    version: publishedVersion,
    versionStatus: "Published",
    updatedDate: "Today",
  };

  const existingIdx = templateStoreState.templates.findIndex((t) => t.id === tmpl.id);
  let newTemplates = [...templateStoreState.templates];

  if (existingIdx >= 0) {
    newTemplates[existingIdx] = published;
  } else {
    newTemplates = [published, ...newTemplates];
  }

  // Remove from drafts if present
  const newDrafts = { ...templateStoreState.drafts };
  delete newDrafts[tmpl.id];

  templateStoreState = {
    templates: newTemplates,
    drafts: newDrafts,
  };
  emit();
  return published;
}

export function createNewVersionFromPublished(templateId: string): ExtendedTemplate {
  const published = templateStoreState.templates.find((t) => t.id === templateId);
  if (!published) throw new Error("Template not found");

  const currentVer = parseFloat(published.version) || 1.0;
  const nextVer = (currentVer + 0.1).toFixed(1);

  const draftCopy: ExtendedTemplate = {
    ...published,
    id: `tmpl_${published.type}_v${nextVer.replace(".", "_")}_${Date.now()}`,
    version: nextVer,
    versionStatus: "Draft",
    updatedDate: "Just now",
    usageCount: 0,
    lastUsed: "Not published yet",
    fields: published.fields.map((f) => ({ ...f })),
    routeSteps: published.routeSteps.map((s) => ({ ...s })),
    rules: { ...published.rules },
  };

  saveDraftTemplate(draftCopy);
  return draftCopy;
}

export function archiveTemplate(templateId: string) {
  templateStoreState = {
    ...templateStoreState,
    templates: templateStoreState.templates.map((t) =>
      t.id === templateId ? { ...t, versionStatus: "Archived" } : t,
    ),
  };
  emit();
}
