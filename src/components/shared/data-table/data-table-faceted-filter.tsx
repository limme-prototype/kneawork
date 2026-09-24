import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { DataTableFilterOption } from "./data-table-types";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue> | undefined;
  title?: string | undefined;
  options: DataTableFilterOption[];
  singleSelect?: boolean | undefined;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  singleSelect = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue();
  const selectedValues = React.useMemo(() => {
    if (Array.isArray(filterValue)) {
      return new Set(filterValue.map(String));
    }
    if (typeof filterValue === "string" && filterValue.length > 0) {
      return new Set([filterValue]);
    }
    return new Set<string>();
  }, [filterValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-dashed text-xs font-medium gap-1.5"
        >
          <PlusCircle className="size-3.5 text-muted-foreground" />
          <span>{title}</span>
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 font-semibold text-[11px] lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1.5 font-semibold text-[11px]"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((opt) => selectedValues.has(opt.value))
                    .map((opt) => (
                      <Badge
                        variant="secondary"
                        key={opt.value}
                        className="rounded-sm px-1.5 font-medium text-[11px]"
                      >
                        {opt.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} className="h-9 text-xs" />
          <CommandList className="max-h-60">
            <CommandEmpty className="py-2.5 text-center text-xs text-muted-foreground">
              No matching options.
            </CommandEmpty>
            <CommandGroup className="p-1">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                const Icon = option.icon;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (singleSelect) {
                        if (isSelected) {
                          column?.setFilterValue(undefined);
                        } else {
                          column?.setFilterValue(option.value);
                        }
                        return;
                      }

                      const updatedValues = new Set(selectedValues);
                      if (isSelected) {
                        updatedValues.delete(option.value);
                      } else {
                        updatedValues.add(option.value);
                      }
                      const filterValues = Array.from(updatedValues);
                      column?.setFilterValue(filterValues.length ? filterValues : undefined);
                    }}
                    className="text-xs cursor-pointer py-1.5 px-2"
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="size-3" />
                    </div>
                    {Icon && <Icon className="mr-2 size-3.5 text-muted-foreground" />}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-[10px] text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup className="p-1">
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
