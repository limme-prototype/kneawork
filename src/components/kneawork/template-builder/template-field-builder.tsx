import { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Eye, FileText, GripVertical, Plus, Trash2 } from "lucide-react";
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

  // Form state for dialog
  const [label, setLabel] = useState("");
  const [type, setType] = useState<TemplateFieldType>("text");
  const [helpText, setHelpText] = useState("");
  const [required, setRequired] = useState(true);
  const [section, setSection] = useState<"required" | "supporting">("required");

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

  const requiredFields = template.fields.filter((f) => f.section === "required" || f.required);
  const supportingFields = template.fields.filter((f) => f.section === "supporting" && !f.required);

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

      {/* Required Information Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h3 className="text-xs font-bold text-foreground">Required information</h3>
            <p className="text-[11px] text-muted-foreground">
              Essential business details needed for reviewers to evaluate the request.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAddDialog("required")}
            className="h-7 text-xs gap-1"
          >
            <Plus className="size-3" />
            Add field
          </Button>
        </div>

        {requiredFields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No required fields configured yet. Add at least one required field.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {requiredFields.map((field) => {
              const globalIdx = template.fields.findIndex((f) => f.id === field.id);
              return (
                <FieldRow
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
          </div>
        )}
      </div>

      {/* Supporting Information Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h3 className="text-xs font-bold text-foreground">Supporting information</h3>
            <p className="text-[11px] text-muted-foreground">
              Optional context, references, or vendor data that assist the approval decision.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAddDialog("supporting")}
            className="h-7 text-xs gap-1"
          >
            <Plus className="size-3" />
            Add field
          </Button>
        </div>

        {supportingFields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No optional supporting fields. You can add vendor, cost center, or notes.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {supportingFields.map((field) => {
              const globalIdx = template.fields.findIndex((f) => f.id === field.id);
              return (
                <FieldRow
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
          </div>
        )}
      </div>

      {/* Add / Edit Field Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editingField ? "Edit request field" : "Add request field"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the label, input type, and whether requesters must complete this field.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="field-label" className="text-xs font-semibold">
                Field label <span className="text-danger">*</span>
              </Label>
              <Input
                id="field-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Vendor name or Item count"
                className="text-xs bg-card h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-type" className="text-xs font-semibold">
                Field type
              </Label>
              <Select value={type} onValueChange={(val: TemplateFieldType) => setType(val)}>
                <SelectTrigger id="field-type" className="text-xs bg-card h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Short text</SelectItem>
                  <SelectItem value="textarea">Long text (multi-line)</SelectItem>
                  <SelectItem value="amount">Amount (numeric value)</SelectItem>
                  <SelectItem value="currency">Currency code</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="daterange">Date range</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Dropdown select</SelectItem>
                  <SelectItem value="file">File upload</SelectItem>
                  <SelectItem value="person">Person selector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-help" className="text-xs font-semibold">
                Help text
              </Label>
              <Input
                id="field-help"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="Guidance shown beneath the input"
                className="text-xs bg-card h-9"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <Label htmlFor="field-req" className="text-xs font-semibold block cursor-pointer">
                  Required field
                </Label>
                <span className="text-[11px] text-muted-foreground">
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
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveField}
              disabled={!label.trim()}
              className="text-xs font-semibold"
            >
              {editingField ? "Save changes" : "Add field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldRow({
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
  return (
    <div className="flex items-center justify-between p-3 transition-colors hover:bg-muted/20">
      <div className="flex items-center gap-3">
        <GripVertical className="size-4 text-muted-foreground/50 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{field.label}</span>
            <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {FIELD_TYPE_LABELS[field.type]}
            </span>
            {field.required ? (
              <span className="rounded bg-attention-soft border border-attention-border px-1.5 py-0.2 text-[10px] font-semibold text-attention">
                Required
              </span>
            ) : (
              <span className="rounded bg-muted/60 text-[10px] text-muted-foreground px-1.5 py-0.2">
                Optional
              </span>
            )}
          </div>
          {field.helpText ? (
            <p className="text-[11px] text-muted-foreground mt-0.5">{field.helpText}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
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
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          title="Edit field"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Edit2 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          title="Remove field"
          className="h-7 w-7 p-0 text-danger hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
