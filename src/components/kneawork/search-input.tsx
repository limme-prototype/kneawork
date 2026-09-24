import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  onClear?: () => void;
  wrapperClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, value, onChange, onClear, ...props }, ref) => {
    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div className={cn("relative flex items-center w-full", wrapperClassName)}>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground select-none shrink-0"
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={cn(
            "min-h-10 w-full rounded-md border border-input bg-card pl-10 text-sm text-foreground placeholder:text-muted-foreground shadow-2xs focus-visible:ring-1 focus-visible:ring-ring",
            hasValue ? "pr-9" : "pr-3",
            className,
          )}
          {...props}
        />
        {hasValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Clear search input"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
