import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Eye,
  GripVertical,
  Plus,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  ExtendedTemplate,
  TemplateField,
  TemplateFieldType,
} from "@/lib/kneawork/template-types";
import { cn } from "@/lib/utils";

interface TemplateFieldBuilderProps {
  template: ExtendedTemplate;
  onChange: (fields: TemplateField[]) => void;
  onOpenPreview: () => void;
}

const FIELD_TYPE_LABELS: Record<TemplateFieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  amount: "Amount (numeric)",
  currency: "Currency code",
  date: "Single date",
  daterange: "Date range",
  number: "Number",
  select: "Dropdown select",
  file: "File upload",
  person: "Person selector",
};

export function TemplateFieldBuilder({
  template,
  onChange,
  onOpenPreview,
}: TemplateFieldBuilderProps) {
  const [editingField, setEditingField] = useState<TemplateField | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form state for dialog
  const [label, setLabel] = useState("");
  const [type, setType] = useState<TemplateFieldType>("text");
  const [helpText, setHelpText] = useState("");
  const [required, setRequired] = useState(true);
  const [section, setSection] = useState<"required" | "supporting">("required");

  // Sensors with 8px pointer activation distance for safe mobile scrolling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const openAddDialog = (targetSection: "required" | "supporting") => {
    setEditingField(null);
    setLabel("");
    setType("text");
    setHelpText("");
    setRequired(targetSection === "required");
    setSection(targetSection);
    setIsDialogOpen(true);
  };

  const openEditDialog = (field: TemplateField) => {
    setEditingField(field);
    setLabel(field.label);
    setType(field.type);
    setHelpText(field.helpText ?? "");
    setRequired(field.required);
    setSection(field.section);
    setIsDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!label.trim()) return;

    if (editingField) {
      const updated = template.fields.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              label: label.trim(),
              type,
              helpText: helpText.trim() ? helpText.trim() : undefined,
              required,
              section,
            }
          : f,
      );
      onChange(updated);
    } else {
      const newField: TemplateField = {
        id: `f_${Date.now()}`,
        label: label.trim(),
        type,
        helpText: helpText.trim() ? helpText.trim() : undefined,
        required,
        section,
      };
      onChange([...template.fields, newField]);
    }
    setIsDialogOpen(false);
  };

  const handleRemoveField = (id: string) => {
    onChange(template.fields.filter((f) => f.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= template.fields.length) return;

    const copy = [...template.fields];
    const temp = copy[index]!;
    copy[index] = copy[targetIdx]!;
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = template.fields.findIndex((f) => f.id === active.id);
    const newIndex = template.fields.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(template.fields, oldIndex, newIndex));
    }
  };

  const requiredFields = template.fields.filter((f) => f.section === "required" || f.required);
  const supportingFields = template.fields.filter((f) => f.section === "supporting" && !f.required);
  const activeField = activeId ? template.fields.find((f) => f.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Request form</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure the fields and proof employees must provide when submitting this request.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreview}
          className="h-8 text-xs font-semibold gap-1.5"
        >
          <Eye className="size-3.5" />
          Preview request form
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart({ active }) {
              const f = template.fields.find((field) => field.id === active.id);
              return `Lifted field ${f?.label || active.id}. Use arrow keys to reorder.`;
            },
            onDragOver({ active, over }) {
              if (over) {
                const fromIdx = template.fields.findIndex((f) => f.id === active.id) + 1;
                const toIdx = template.fields.findIndex((f) => f.id === over.id) + 1;
                return `Field moved from position ${fromIdx} to ${toIdx}.`;
              }
              return "Field is no longer over a droppable target.";
            },
            onDragEnd({ active, over }) {
              if (over) {
                const toIdx = template.fields.findIndex((f) => f.id === over.id) + 1;
                return `Dropped field at position ${toIdx}.`;
              }
              return "Drag cancelled.";
            },
            onDragCancel() {
              return "Dragging was cancelled.";
            },
          },
        }}
      >
        {/* Required Information Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">Required information</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground">
                Essential business details needed for reviewers to evaluate the request.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAddDialog("required")}
              className="gap-1 font-semibold"
            >
              <Plus className="size-3.5" />
              Add field
            </Button>
          </div>

          {requiredFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No required fields configured yet. Add at least one required field.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              <SortableContext
                items={requiredFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {requiredFields.map((field) => {
                  const globalIdx = template.fields.findIndex((f) => f.id === field.id);
                  return (
                    <SortableFieldRow
                      key={field.id}
                      field={field}
                      isFirst={globalIdx === 0}
                      isLast={globalIdx === template.fields.length - 1}
                      onMoveUp={() => handleMove(globalIdx, "up")}
                      onMoveDown={() => handleMove(globalIdx, "down")}
                      onEdit={() => openEditDialog(field)}
                      onRemove={() => handleRemoveField(field.id)}
                    />
                  );
                })}
              </SortableContext>
            </div>
          )}
        </div>

        {/* Supporting Information Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">Supporting information</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground">
                Optional context, references, or vendor data that assist the approval decision.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAddDialog("supporting")}
              className="gap-1 font-semibold"
            >
              <Plus className="size-3.5" />
              Add field
            </Button>
          </div>

          {supportingFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No optional supporting fields. You can add vendor, cost center, or notes.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              <SortableContext
                items={supportingFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {supportingFields.map((field) => {
                  const globalIdx = template.fields.findIndex((f) => f.id === field.id);
                  return (
                    <SortableFieldRow
                      key={field.id}
                      field={field}
                      isFirst={globalIdx === 0}
                      isLast={globalIdx === template.fields.length - 1}
                      onMoveUp={() => handleMove(globalIdx, "up")}
                      onMoveDown={() => handleMove(globalIdx, "down")}
                      onEdit={() => openEditDialog(field)}
                      onRemove={() => handleRemoveField(field.id)}
                    />
                  );
                })}
              </SortableContext>
            </div>
          )}
        </div>

        {/* Drag Overlay Preview */}
        <DragOverlay>
          {activeField ? (
            <div className="flex items-center justify-between p-3 rounded-lg border-2 border-primary bg-card shadow-lg opacity-95">
              <div className="flex items-center gap-3">
                <GripVertical className="size-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground">{activeField.label}</span>
                <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  {FIELD_TYPE_LABELS[activeField.type]}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add / Edit Field Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingField ? "Edit request field" : "Add request field"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Define the label, input type, and whether requesters must complete this field.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="field-label" className="text-xs font-bold">
                Field label *
              </Label>
              <Input
                id="field-label"
                placeholder="e.g. Total Estimated Amount, Target Delivery Date"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="field-type" className="text-xs font-bold">
                  Data type
                </Label>
                <Select value={type} onValueChange={(val) => setType(val as TemplateFieldType)}>
                  <SelectTrigger id="field-type" className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="field-sec" className="text-xs font-bold">
                  Section
                </Label>
                <Select
                  value={section}
                  onValueChange={(val) => setSection(val as "required" | "supporting")}
                >
                  <SelectTrigger id="field-sec" className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required information</SelectItem>
                    <SelectItem value="supporting">Supporting information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-help" className="text-xs font-bold">
                Help text / guidance
              </Label>
              <Input
                id="field-help"
                placeholder="e.g. Include VAT if vendor quoted with tax"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <Label htmlFor="field-req" className="text-sm font-semibold block cursor-pointer">
                  Required field
                </Label>
                <span className="text-xs text-muted-foreground">
                  Requesters cannot submit without completing this item
                </span>
              </div>
              <Switch
                id="field-req"
                checked={required}
                onCheckedChange={(val) => {
                  setRequired(val);
                  if (val) setSection("required");
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveField}
              disabled={!label.trim()}
              className="font-semibold"
            >
              {editingField ? "Save changes" : "Add field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableFieldRow({
  field,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}: {
  field: TemplateField;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
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
  } = useSortable({ id: field.id });

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
        "flex items-center justify-between p-3 transition-colors hover:bg-muted/20",
        isDragging && "bg-muted/40 ring-1 ring-primary",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Dedicated Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder field ${field.label}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-none"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{field.label}</span>
            <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
              {FIELD_TYPE_LABELS[field.type]}
            </span>
            {field.required ? (
              <span className="rounded bg-attention-soft border border-attention-border px-1.5 py-0.5 text-xs font-semibold text-attention">
                Required
              </span>
            ) : (
              <span className="rounded bg-muted/60 text-xs text-muted-foreground px-1.5 py-0.5">
                Optional
              </span>
            )}
          </div>
          {field.helpText ? (
            <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 truncate">{field.helpText}</p>
          ) : null}
        </div>
      </div>

      {/* Accessible fallback buttons */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          aria-label={`Move ${field.label} up`}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          aria-label={`Move ${field.label} down`}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          title="Edit field"
          aria-label={`Edit ${field.label}`}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Edit2 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          title="Remove field"
          aria-label={`Remove ${field.label}`}
          className="h-7 w-7 p-0 text-danger hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
