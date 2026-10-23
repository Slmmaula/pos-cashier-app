"use client";

import { useId, type ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Field, controlBase, controlState } from "./field";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<
  ComponentProps<"select">,
  "required" | "children"
> & {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  wrapperClassName?: string;
};

export function Select({
  id,
  options,
  placeholder,
  label,
  required,
  error,
  helper,
  wrapperClassName,
  className,
  value,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const isPlaceholder = placeholder !== undefined && value === "";

  return (
    <Field
      id={selectId}
      label={label}
      required={required}
      error={error}
      helper={helper}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={selectId}
          value={value}
          aria-invalid={error ? true : undefined}
          className={cn(
            controlBase,
            controlState(error),
            "h-10 appearance-none px-3 pr-9",
            isPlaceholder && "text-placeholder",
            className,
          )}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-card text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </Field>
  );
}
