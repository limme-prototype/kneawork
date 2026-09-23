import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  Edit2,
  HelpCircle,
  Info,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WORKSPACE_ROLES } from "@/lib/kneawork/template-store";
import type { ExtendedTemplate, TemplateRouteStep } from "@/lib/kneawork/template-types";

interface ApprovalRouteBuilderProps {
  template: ExtendedTemplate;
  onChange: (steps: TemplateRouteStep[]) => void;
}

export function ApprovalRouteBuilder({ template, onChange }: ApprovalRouteBuilderProps) {
  const [editingStep, setEditingStep] = useState<TemplateRouteStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [stepName, setStepName] = useState("");
  const [roleId, setRoleId] = useState("role_finance");
  const [responsibility, setResponsibility] = useState("");
  const [decisionType, setDecisionType] = useState<"single" | "all">("single");
  const [dueDays, setDueDays] = useState(1);
  const [onOverdue, setOnOverdue] = useState<"remind" | "escalate">("remind");

  const openAddStep = () => {
    setEditingStep(null);
    setStepName("");
    setRoleId("role_finance");
    setResponsibility("Checks budget, vendor terms, and operational priority");
    setDecisionType("single");
    setDueDays(1);
    setOnOverdue("remind");
    setIsDialogOpen(true);
  };

  const openEditStep = (step: TemplateRouteStep) => {
    setEditingStep(step);
    setStepName(step.name);
    setRoleId(step.roleId);
    setResponsibility(step.responsibility);
    setDecisionType(step.decisionType);
    setDueDays(step.dueDays);
    setOnOverdue(step.onOverdue);
    setIsDialogOpen(true);
  };

  const handleSaveStep = () => {
    if (!stepName.trim() || !responsibility.trim()) return;

    const role = WORKSPACE_ROLES.find((r) => r.id === roleId);

    if (editingStep) {
      const updated = template.routeSteps.map((s) =>
        s.id === editingStep.id
          ? {
              ...s,
              name: stepName.trim(),
              roleId,
              roleName: role ? role.name : "Reviewer",
              assigneeId: role?.activeAssigneeId,
              assigneeName: role?.activeAssigneeName,
              responsibility: responsibility.trim(),
              decisionType,
              dueDays,
              onOverdue,
            }
          : s,
      );
      onChange(updated);
    } else {
      const newStep: TemplateRouteStep = {
        id: `s_${Date.now()}`,
        name: stepName.trim(),
        roleId,
        roleName: role ? role.name : "Reviewer",
        assigneeId: role?.activeAssigneeId,
        assigneeName: role?.activeAssigneeName,
        responsibility: responsibility.trim(),
        decisionType,
        dueDays,
        onOverdue,
      };
      onChange([...template.routeSteps, newStep]);
    }

    setIsDialogOpen(false);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= template.routeSteps.length) return;

    const copy = [...template.routeSteps];
    const temp = copy[index]!;
    copy[index] = copy[targetIdx]!;
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const handleRemove = (id: string) => {
    onChange(template.routeSteps.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Approval route</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure ordered sequential sign-off checkpoints and designate decision
            responsibilities.
          </p>
        </div>

        <Button size="sm" onClick={openAddStep} className="h-8 text-xs font-semibold gap-1.5">
          <Plus className="size-3.5" />
          Add approval step
        </Button>
      </div>

      {/* Sequential Route Explanation Callout */}
      <div className="rounded-lg border border-border bg-muted/30 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info className="size-4 text-foreground shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-foreground">Sequential governance: </span>
          Requesters submit once. The next designated reviewer is notified only after the preceding
          reviewer approves. Assign steps to organizational roles first so the workflow survives
          personnel changes.
        </div>
      </div>

      {/* Vertical Steps List */}
      <div className="space-y-3">
        {/* Requester Start Step (Fixed Anchor) */}
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-card/60 p-3.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            0
          </span>
          <div className="flex-1">
            <span className="text-sm font-semibold text-foreground">Employee submits request</span>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              Provides required form details and evidence attachments
            </p>
          </div>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Trigger
          </span>
        </div>

        {template.routeSteps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-warning-border bg-warning-soft/30 p-6 text-center text-sm text-warning">
            No approval steps configured. A workflow requires at least one reviewer step.
          </div>
        ) : (
          template.routeSteps.map((step, idx) => {
            const role = WORKSPACE_ROLES.find((r) => r.id === step.roleId);
            const hasActiveAssignee = Boolean(role?.activeAssigneeId);

            return (
              <div
                key={step.id}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-foreground">{step.name}</span>
                        <span className="rounded bg-muted border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                          {step.roleName}
                        </span>
                        {hasActiveAssignee ? (
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <UserCheck className="size-3.5 text-success" />
                            Assigned to {step.assigneeName ?? role?.activeAssigneeName}
                          </span>
                        ) : (
                          <span className="rounded bg-danger-soft border border-danger-border px-2 py-0.5 text-xs font-semibold text-danger flex items-center gap-1">
                            <AlertTriangle className="size-3.5" />
                            No active member assigned
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
                        {step.responsibility}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      title="Move up"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === template.routeSteps.length - 1}
                      title="Move down"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditStep(step)}
                      title="Edit step"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(step.id)}
                      title="Remove step"
                      className="h-8 w-8 p-0 text-danger hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Timing & Policy metadata */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-[13px] text-muted-foreground border-t border-border/50 pt-2.5">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Due in {step.dueDays} business day(s)</span>
                  </div>
                  <div>
                    <span>Decision: </span>
                    <span className="font-medium text-foreground">
                      {step.decisionType === "single"
                        ? "One person must approve"
                        : "Everyone assigned must approve"}
                    </span>
                  </div>
                  <div>
                    <span>If overdue: </span>
                    <span className="font-medium text-foreground">
                      {step.onOverdue === "remind" ? "Remind approver" : "Escalate to director"}
                    </span>
                  </div>
                </div>

                {!hasActiveAssignee ? (
                  <div className="rounded border border-danger-border bg-danger-soft/40 p-2.5 text-xs text-danger flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>
                      <strong>Publishing blocked:</strong> {step.roleName} has no active member
                      assigned in this workspace. Assign a member before publishing this template.
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Step Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingStep ? "Edit approval step" : "Add approval step"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Define the review checkpoint, assigned role, pass/fail responsibility, and time limit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="step-name" className="text-sm font-semibold">
                Step name <span className="text-danger">*</span>
              </Label>
              <Input
                id="step-name"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="e.g. Finance Review or Director Confirmation"
                className="bg-card"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="step-role" className="text-sm font-semibold">
                Who approves? (Assigned role) <span className="text-danger">*</span>
              </Label>
              <Select value={roleId} onValueChange={(val) => setRoleId(val)}>
                <SelectTrigger id="step-role" className="bg-card min-h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}{" "}
                      {r.activeAssigneeName
                        ? `(Assigned: ${r.activeAssigneeName})`
                        : "(No active member)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs sm:text-[13px] text-muted-foreground">
                Assign roles first and people second so templates remain valid if employees change.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="step-resp" className="text-sm font-semibold">
                Decision responsibility <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="step-resp"
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
                placeholder="e.g. Checks quotation, receipt, and budget availability"
                className="bg-card min-h-[72px] resize-none"
              />
              <p className="text-xs sm:text-[13px] text-muted-foreground">
                Clear pass/fail criteria approvers must verify before signing off.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="step-due" className="text-xs font-semibold">
                  Due after previous step
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="step-due"
                    type="number"
                    min={1}
                    max={30}
                    value={dueDays}
                    onChange={(e) => setDueDays(parseInt(e.target.value) || 1)}
                    className="text-xs bg-card h-9 w-20"
                  />
                  <span className="text-xs text-muted-foreground">business day(s)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="step-overdue" className="text-xs font-semibold">
                  If overdue
                </Label>
                <Select
                  value={onOverdue}
                  onValueChange={(val: "remind" | "escalate") => setOnOverdue(val)}
                >
                  <SelectTrigger id="step-overdue" className="text-xs bg-card h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remind">Remind approver</SelectItem>
                    <SelectItem value="escalate">Escalate to director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Decision requirement</Label>
              <RadioGroup
                value={decisionType}
                onValueChange={(val: "single" | "all") => setDecisionType(val)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                <label className="flex items-center gap-2 rounded-lg border border-border p-2.5 bg-card cursor-pointer hover:bg-muted/30">
                  <RadioGroupItem value="single" id="dt-single" />
                  <span className="text-xs font-medium text-foreground">
                    One person must approve
                  </span>
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-border p-2.5 bg-card cursor-pointer hover:bg-muted/30">
                  <RadioGroupItem value="all" id="dt-all" />
                  <span className="text-xs font-medium text-foreground">
                    Everyone assigned must approve
                  </span>
                </label>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveStep}
              disabled={!stepName.trim() || !responsibility.trim()}
              className="text-xs font-semibold"
            >
              {editingStep ? "Save changes" : "Add step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
