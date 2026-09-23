import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ExtendedTemplate } from "@/lib/kneawork/template-types";

interface PublishTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ExtendedTemplate;
  onConfirmPublish: () => void;
}

export function PublishTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirmPublish,
}: PublishTemplateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Publish {template.label || "request"} template?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <span className="block">
              This template will immediately become available in the employee request catalog for
              new submissions.
            </span>
            <span className="block font-medium text-foreground">
              New requests will use version {template.version}. Existing requests already in flight
              will remain pinned to their original version.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-end">
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmPublish}
            className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Publish template
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
