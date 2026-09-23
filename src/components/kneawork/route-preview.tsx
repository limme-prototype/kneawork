import {
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES_BY_TYPE, personById } from "@/lib/kneawork/data";
import type { RequestType } from "@/lib/kneawork/types";

const STEP_DUTIES: Record<string, string> = {
  "Finance Review": "Checks quotation, tax receipt, and allocated budget",
  "Manager Approval": "Confirms operational business need and validates necessity",
  "Director Confirmation": "Provides final executive confirmation and commitment",
};

const TYPICAL_REVIEW_TIMES: Record<RequestType, string> = {
  purchase: "1–2 business days",
  expense: "1 business day",
  leave: "4–8 hours",
  contract: "2–3 business days",
};

export function RoutePreview({
  type = "purchase",
  collapsible = false,
  initiallyExpanded = true,
}: {
  type?: RequestType;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const steps = ROUTES_BY_TYPE[type] ?? ROUTES_BY_TYPE.purchase;
  const reviewTime = TYPICAL_REVIEW_TIMES[type] ?? "1–2 business days";

  return (
    <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
      {/* Header Summary */}
      <div className="p-3.5 sm:p-4 bg-muted/40 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Who reviews this request?</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {steps.length} {steps.length === 1 ? "approval step" : "approval steps"} · Typical
              review time: <strong className="text-foreground">{reviewTime}</strong>
            </p>
          </div>

          {collapsible ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpanded((prev) => !prev)}
              className="font-semibold"
            >
              <span>{expanded ? "Hide route" : "View route"}</span>
              {expanded ? (
                <ChevronUp className="size-3.5 ml-1" />
              ) : (
                <ChevronDown className="size-3.5 ml-1" />
              )}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Expanded Route Content */}
      {expanded ? (
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Submitter Origin (Clear separation: NOT an approval step) */}
          <div className="flex items-center gap-2.5 rounded-md bg-muted/30 border border-border p-3 text-sm text-foreground">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-2xs">
              <User className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm">You submit the request</p>
              <p className="text-[13px] text-muted-foreground">
                Workflow initiates immediately and notifies the first assigned reviewer
              </p>
            </div>
          </div>

          {/* Sequential Ordered Reviewers */}
          <ol className="space-y-2 pt-0.5">
            {steps.map((step, idx) => {
              const person = personById(step.assigneeId);
              const duty = STEP_DUTIES[step.name] ?? "Validates request compliance";

              return (
                <li key={step.name} className="relative">
                  {/* Step Connector */}
                  <div className="flex items-center justify-start pl-4 py-0.5 text-muted-foreground/40">
                    <ArrowDown className="size-3.5 text-muted-foreground" />
                  </div>

                  <div className="rounded-md border border-border bg-card p-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-attention-soft border border-attention-border text-xs font-bold text-attention mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-foreground">{step.name}</p>
                          <p className="text-[13px] font-medium text-foreground mt-0.5">
                            {person.name} ·{" "}
                            <span className="text-muted-foreground font-normal">{person.role}</span>
                          </p>
                          <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                            {duty}
                          </p>
                        </div>
                      </div>

                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
                        {idx === 0
                          ? "1st review"
                          : idx === steps.length - 1
                            ? "Final sign-off"
                            : "Verification"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
