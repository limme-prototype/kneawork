import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge, UrgencyBadge } from "./status-badge";
import { personById } from "@/lib/kneawork/data";
import { currentStep } from "@/lib/kneawork/store";
import type { WorkRequest } from "@/lib/kneawork/types";

export function RequestTable({
  requests,
  selectedRequestId,
  onSelectRequest,
  currentUserId,
}: {
  requests: WorkRequest[];
  selectedRequestId?: string;
  onSelectRequest?: (id: string) => void;
  currentUserId: string;
}) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-2">
                  ID
                </th>
                <th scope="col" className="py-3 px-3">
                  Request
                </th>
                <th scope="col" className="py-3 px-3">
                  Requester
                </th>
                <th scope="col" className="py-3 px-3">
                  Current step
                </th>
                <th scope="col" className="py-3 px-3">
                  Owner
                </th>
                <th scope="col" className="py-3 px-3">
                  Status
                </th>
                <th scope="col" className="py-3 px-3">
                  Due / updated
                </th>
                <th scope="col" className="py-3 pr-4 pl-2 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req) => {
                const requester = personById(req.requesterId);
                const step = currentStep(req);
                const owner = step ? personById(step.assigneeId) : null;
                const isSelected = req.id === selectedRequestId;
                const isMe =
                  step && step.assigneeId === currentUserId && req.status === "in_review";

                return (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequest?.(req.id)}
                    className={`group cursor-pointer transition-colors ${
                      isSelected ? "bg-accent font-medium" : "hover:bg-accent/50"
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 pl-4 pr-2 font-mono text-[11px] font-semibold text-muted-foreground">
                      {req.code}
                    </td>

                    {/* Request Title & Value */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {req.title}
                      </div>
                      <div className="text-[11px] font-medium text-muted-foreground">
                        {req.valueLabel} · <span className="capitalize">{req.type}</span>
                      </div>
                    </td>

                    {/* Requester */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-foreground">{requester.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {req.department}
                      </span>
                    </td>

                    {/* Current Step */}
                    <td className="py-3.5 px-3">
                      {step ? (
                        <span className="font-medium text-foreground">{step.name}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3">
                      {owner ? (
                        <span
                          className={`font-semibold ${isMe ? "text-attention" : "text-foreground"}`}
                        >
                          {isMe ? "You" : owner.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        status={req.status}
                        currentStepName={step?.name}
                        assigneeName={owner?.name}
                        isAssignedToMe={Boolean(isMe)}
                      />
                    </td>

                    {/* Due */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {step ? (
                        <UrgencyBadge urgency={req.urgency} dueLabel={step.dueLabel} />
                      ) : (
                        <span className="text-muted-foreground">{req.updatedLabel}</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold"
                      >
                        <Link to="/requests/$requestId" params={{ requestId: req.id }}>
                          {isMe ? "Review" : "View"}
                          <ChevronRight className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Conversion View */}
      <div className="sm:hidden space-y-2.5">
        {requests.map((req) => {
          const requester = personById(req.requesterId);
          const step = currentStep(req);
          const owner = step ? personById(step.assigneeId) : null;
          const isMe = step && step.assigneeId === currentUserId && req.status === "in_review";

          return (
            <div
              key={req.id}
              className="rounded-lg border border-border bg-card p-3.5 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{req.code}</span>
                    <span className="font-bold text-xs text-foreground">{req.title}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                    {req.valueLabel} · <span className="capitalize">{req.type}</span>
                  </p>
                </div>
                <StatusBadge
                  status={req.status}
                  currentStepName={step?.name}
                  assigneeName={owner?.name}
                  isAssignedToMe={Boolean(isMe)}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
                <div>
                  <span>Step: </span>
                  <span className="font-medium text-foreground">{step?.name ?? "Completed"}</span>
                  {owner ? <span> · {isMe ? "You" : owner.name}</span> : null}
                </div>
                {step ? <UrgencyBadge urgency={req.urgency} dueLabel={step.dueLabel} /> : null}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-[10px] text-muted-foreground">By {requester.name}</span>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs font-semibold">
                  <Link to="/requests/$requestId" params={{ requestId: req.id }}>
                    {isMe ? "Review" : "View"}
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
