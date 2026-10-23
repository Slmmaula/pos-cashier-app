"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Field, controlBase, controlState } from "./field";

export type TextareaProps = Omit<ComponentProps<"textarea">, "required"> & {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  wrapperClassName?: string;
};

export function Textarea({
  id,
  label,
  required,
  error,
  helper,
  wrapperClassName,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <Field
      id={textareaId}
      label={label}
      required={required}
      error={error}
      helper={helper}
      className={wrapperClassName}
    >
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          controlState(error),
          "resize-none px-3 py-2.5",
          className,
        )}
        {...props}
      />
    </Field>
  );
}
