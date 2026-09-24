import { HelpCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PEOPLE } from "@/lib/kneawork/data";
import type { ExtendedTemplate, TemplateCategory } from "@/lib/kneawork/template-types";

interface TemplateBasicsFormProps {
  template: ExtendedTemplate;
  onChange: (updates: Partial<ExtendedTemplate>) => void;
}

export function TemplateBasicsForm({ template, onChange }: TemplateBasicsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-foreground">Template basics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Define what this template is for, who may submit requests, and what successful completion
          means.
        </p>
      </div>

      <div className="space-y-4">
        {/* Template Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="template-name" className="text-sm font-semibold text-foreground">
              Template name <span className="text-danger">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">{template.label.length}/80</span>
          </div>
          <Input
            id="template-name"
            value={template.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="e.g. Purchase Request"
            className="bg-card"
            maxLength={80}
          />
          <p className="text-xs sm:text-[13px] text-muted-foreground">
            Clear, recognizable title shown to employees on the request start page.
          </p>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="template-desc" className="text-sm font-semibold text-foreground">
              Short description <span className="text-danger">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">{template.description.length}/240</span>
          </div>
          <Textarea
            id="template-desc"
            value={template.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="e.g. Buy goods or services from an approved vendor"
            className="bg-card min-h-[72px] resize-none"
            maxLength={240}
          />
          <p className="text-xs sm:text-[13px] text-muted-foreground">
            Explains the primary purpose so employees choose the correct request process.
          </p>
        </div>

        {/* Category & Scope */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="template-category" className="text-sm font-semibold text-foreground">
              Request category <span className="text-danger">*</span>
            </Label>
            <Select
              value={template.category}
              onValueChange={(val: TemplateCategory) => onChange({ category: val })}
            >
              <SelectTrigger id="template-category" className="bg-card min-h-10 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="general">General request</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              Controls reporting classification and standard policy templates.
            </p>
          </div>

          {/* Department Scope */}
          <div className="space-y-1.5">
            <Label htmlFor="template-department" className="text-sm font-semibold text-foreground">
              Department scope
            </Label>
            <Select
              value={template.departmentScope}
              onValueChange={(val) => onChange({ departmentScope: val })}
            >
              <SelectTrigger id="template-department" className="bg-card min-h-10 text-sm">
                <SelectValue placeholder="Select departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All departments">All departments</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Design & Ops">Design & Ops</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              Which teams have permission to see and submit this template.
            </p>
          </div>
        </div>

        {/* Who can submit & Owner */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Who can submit */}
          <div className="space-y-1.5">
            <Label htmlFor="template-submitters" className="text-sm font-semibold text-foreground">
              Who can submit?
            </Label>
            <Select
              value={template.whoCanSubmit}
              onValueChange={(val) => onChange({ whoCanSubmit: val })}
            >
              <SelectTrigger id="template-submitters" className="bg-card min-h-10 text-sm">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All members">All members</SelectItem>
                <SelectItem value="Full-time staff">Full-time staff</SelectItem>
                <SelectItem value="Managers only">Managers only</SelectItem>
                <SelectItem value="Department leads">Department leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Owner */}
          <div className="space-y-1.5">
            <Label htmlFor="template-owner" className="text-sm font-semibold text-foreground">
              Template owner <span className="text-danger">*</span>
            </Label>
            <Select
              value={template.ownerId}
              onValueChange={(val) => {
                const person = PEOPLE.find((p) => p.id === val);
                onChange({
                  ownerId: val,
                  ownerName: person ? `${person.name} · ${person.role}` : "Dara · Operations Admin",
                });
              }}
            >
              <SelectTrigger id="template-owner" className="bg-card min-h-10 text-sm">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {PEOPLE.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {p.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              Accountable administrator responsible for updating this process.
            </p>
          </div>
        </div>

        {/* Typical Completion Time */}
        <div className="space-y-1.5">
          <Label htmlFor="template-time" className="text-sm font-semibold text-foreground">
            Typical completion time
          </Label>
          <Input
            id="template-time"
            value={template.typicalCompletionTime}
            onChange={(e) => onChange({ typicalCompletionTime: e.target.value })}
            placeholder="e.g. 1–2 business days"
            className="bg-card"
          />
          <p className="text-xs sm:text-[13px] text-muted-foreground">
            Sets realistic expectations for requesters before submission.
          </p>
        </div>

        {/* What Does Completion Mean? (Spec requirement: Completion outcome prevents vague workflows) */}
        <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="template-outcome" className="text-sm font-bold text-foreground">
              What does completion mean? <span className="text-danger">*</span>
            </Label>
            <Info className="size-4 text-muted-foreground" />
          </div>
          <Input
            id="template-outcome"
            value={template.completionOutcome}
            onChange={(e) => onChange({ completionOutcome: e.target.value })}
            placeholder="e.g. Approved purchase ready for fulfillment and vendor invoice processing"
            className="bg-card"
          />
          <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
            A trustworthy workflow defines the concrete business deliverable produced upon final
            approval, preventing ambiguous or dead-end requests.
          </p>
        </div>
      </div>
    </div>
  );
}
