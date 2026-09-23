import type { RequestType } from "./types";

export type TemplateCategory = "purchase" | "expense" | "leave" | "contract" | "general";

export type TemplateFieldType =
  | "text"
  | "textarea"
  | "amount"
  | "currency"
  | "date"
  | "daterange"
  | "number"
  | "select"
  | "file"
  | "person";

export interface TemplateField {
  id: string;
  label: string;
  type: TemplateFieldType;
  helpText?: string | undefined;
  required: boolean;
  section: "required" | "supporting";
  options?: string[] | undefined;
}

export interface TemplateRouteStep {
  id: string;
  name: string;
  roleId: string;
  roleName: string;
  assigneeId?: string | undefined;
  assigneeName?: string | undefined;
  responsibility: string;
  decisionType: "single" | "all";
  dueDays: number;
  onOverdue: "remind" | "escalate";
}

export interface TemplateRules {
  departmentScope: string;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  requireQuotation: boolean;
  quotationThreshold?: number | undefined;
  requireReceipt: boolean;
  requireManagerNote: boolean;
  requireLegalAssessment: boolean;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  conditionalDirectorAbove?: number | undefined;
  onMissingEvidence: "prevent" | "allow_changes_later";
}

export interface ExtendedTemplate {
  id: string;
  type: RequestType | string;
  label: string;
  description: string;
  category: TemplateCategory;
  departmentScope: string;
  whoCanSubmit: string;
  ownerId: string;
  ownerName: string;
  typicalCompletionTime: string;
  completionOutcome: string;
  version: string;
  versionStatus: "Published" | "Draft" | "Archived";
  updatedDate: string;
  usageCount: number;
  lastUsed: string;
  fields: TemplateField[];
  routeSteps: TemplateRouteStep[];
  rules: TemplateRules;
}

export type BuilderStepId = 1 | 2 | 3 | 4 | 5;

export interface ValidationIssue {
  step: BuilderStepId;
  field?: string | undefined;
  message: string;
  fixLabel: string;
}
