import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  Edit2,
  GripVertical,
  Info,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
import { cn } from "@/lib/utils";

interface ApprovalRouteBuilderProps {
  template: ExtendedTemplate;
  onChange: (steps: TemplateRouteStep[]) => void;
}

export function ApprovalRouteBuilder({ template, onChange }: ApprovalRouteBuilderProps) {
  const [editingStep, setEditingStep] = useState<TemplateRouteStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form state
  const [stepName, setStepName] = useState("");
  const [roleId, setRoleId] = useState("role_finance");
  const [responsibility, setResponsibility] = useState("");
  const [decisionType, setDecisionType] = useState<"single" | "all">("single");
  const [dueDays, setDueDays] = useState(1);
  const [onOverdue, setOnOverdue] = useState<"remind" | "escalate">("remind");

  // dnd-kit sensors: pointer with 8px threshold to prevent accidental drags on mobile taps
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = template.routeSteps.findIndex((s) => s.id === active.id);
    const newIndex = template.routeSteps.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(template.routeSteps, oldIndex, newIndex));
    }
  };

  const activeStep = activeId
    ? template.routeSteps.find((s) => s.id === activeId)
    : null;

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
          personnel changes. Drag handle or use Move Up/Down buttons to reorder.
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            accessibility={{
              announcements: {
                onDragStart({ active }) {
                  const s = template.routeSteps.find((step) => step.id === active.id);
                  return `Lifted step ${s?.name || active.id}. Use arrow keys to reorder.`;
                },
                onDragOver({ active, over }) {
                  if (over) {
                    const fromIdx = template.routeSteps.findIndex((s) => s.id === active.id) + 1;
                    const toIdx = template.routeSteps.findIndex((s) => s.id === over.id) + 1;
                    return `Step moved from position ${fromIdx} to ${toIdx}.`;
                  }
                  return "Step is no longer over a droppable target.";
                },
                onDragEnd({ active, over }) {
                  if (over) {
                    const toIdx = template.routeSteps.findIndex((s) => s.id === over.id) + 1;
                    return `Dropped step at position ${toIdx}.`;
                  }
                  return "Drag cancelled.";
                },
                onDragCancel() {
                  return "Dragging was cancelled.";
                },
              },
            }}
          >
            <SortableContext
              items={template.routeSteps.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {template.routeSteps.map((step, idx) => {
                const role = WORKSPACE_ROLES.find((r) => r.id === step.roleId);
                const hasActiveAssignee = Boolean(role?.activeAssigneeId);

                return (
                  <SortableStepCard
                    key={step.id}
                    step={step}
                    idx={idx}
                    totalSteps={template.routeSteps.length}
                    role={role}
                    hasActiveAssignee={hasActiveAssignee}
                    onMove={handleMove}
                    onEdit={() => openEditStep(step)}
                    onRemove={() => handleRemove(step.id)}
                  />
                );
              })}
            </SortableContext>

            {/* Drag Overlay Preview */}
            <DragOverlay>
              {activeStep ? (
                <div className="rounded-lg border-2 border-primary bg-card p-4 shadow-xl opacity-95">
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      •
                    </span>
                    <div>
                      <span className="text-sm font-bold text-foreground">{activeStep.name}</span>
                      <p className="text-xs text-muted-foreground">{activeStep.roleName}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Add / Edit Step Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingStep ? "Edit approval step" : "Add approval step"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Define the responsible reviewer role, the verification checklist, and the response SLA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="step-name" className="text-xs font-bold">
                Step name *
              </Label>
              <Input
                id="step-name"
                placeholder="e.g. Line Manager Approval, Finance Audit"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="step-role" className="text-xs font-bold">
                Responsible role *
              </Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger id="step-role" className="bg-card">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex items-center gap-2">
                        <span>{r.name}</span>
                        {r.activeAssigneeName ? (
                          <span className="text-xs text-muted-foreground">
                            ({r.activeAssigneeName})
                          </span>
                        ) : (
                          <span className="text-xs text-danger font-medium">(Unassigned)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="step-resp" className="text-xs font-bold">
                Decision responsibility checklist *
              </Label>
              <Textarea
                id="step-resp"
                rows={2}
                placeholder="What exactly should this reviewer verify before approving?"
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
                className="bg-card text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Sign-off policy</Label>
              <RadioGroup
                value={decisionType}
                onValueChange={(val) => setDecisionType(val as "single" | "all")}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 rounded border border-border p-2.5 bg-card">
                  <RadioGroupItem value="single" id="dt-single" />
                  <Label htmlFor="dt-single" className="text-xs cursor-pointer">
                    First to respond
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded border border-border p-2.5 bg-card">
                  <RadioGroupItem value="all" id="dt-all" />
                  <Label htmlFor="dt-all" className="text-xs cursor-pointer">
                    All must approve
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="step-sla" className="text-xs font-bold">
                  SLA (business days)
                </Label>
                <Input
                  id="step-sla"
                  type="number"
                  min={1}
                  max={30}
                  value={dueDays}
                  onChange={(e) => setDueDays(Number(e.target.value) || 1)}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="step-overdue" className="text-xs font-bold">
                  If overdue
                </Label>
                <Select
                  value={onOverdue}
                  onValueChange={(val) => setOnOverdue(val as "remind" | "escalate")}
                >
                  <SelectTrigger id="step-overdue" className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remind">Remind approver</SelectItem>
                    <SelectItem value="escalate">Escalate to Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveStep}
              disabled={!stepName.trim() || !responsibility.trim()}
              className="font-semibold"
            >
              {editingStep ? "Save changes" : "Add step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableStepCard({
  step,
  idx,
  totalSteps,
  role,
  hasActiveAssignee,
  onMove,
  onEdit,
  onRemove,
}: {
  step: TemplateRouteStep;
  idx: number;
  totalSteps: number;
  role: (typeof WORKSPACE_ROLES)[number] | undefined;
  hasActiveAssignee: boolean;
  onMove: (idx: number, direction: "up" | "down") => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80 shadow-2xs space-y-3",
        isDragging && "ring-2 ring-primary shadow-md",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Dedicated Accessible Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder step ${idx + 1}: ${step.name}`}
            className="flex size-9 sm:size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-none -ml-1 mt-0.5"
          >
            <GripVertical className="size-4" />
          </button>

          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-foreground truncate">
                {step.name}
              </span>
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

        {/* Fallback Accessible Actions: Move Up / Down, Edit, Remove */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(idx, "up")}
            disabled={idx === 0}
            title="Move up"
            aria-label={`Move ${step.name} up`}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(idx, "down")}
            disabled={idx === totalSteps - 1}
            title="Move down"
            aria-label={`Move ${step.name} down`}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            title="Edit step"
            aria-label={`Edit ${step.name}`}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            title="Remove step"
            aria-label={`Remove ${step.name}`}
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
            <strong>Publishing blocked:</strong> {step.roleName} has no active member assigned
            in this workspace. Assign a member before publishing this template.
          </span>
        </div>
      ) : null}
    </div>
  );
}
