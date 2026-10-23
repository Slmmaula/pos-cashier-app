"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Field, controlBase, controlState } from "./field";

export type InputProps = Omit<ComponentProps<"input">, "required"> & {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  wrapperClassName?: string;
};

export function Input({
  id,
  label,
  required,
  error,
  helper,
  leftIcon,
  wrapperClassName,
  className,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasIcon = Boolean(leftIcon);

  return (
    <Field
      id={inputId}
      label={label}
      required={required}
      error={error}
      helper={helper}
      className={wrapperClassName}
    >
      <div className="relative">
        {hasIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-foreground">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            controlBase,
            controlState(error),
            "h-10 px-3",
            hasIcon && "pl-10",
            className,
          )}
          {...props}
        />
      </div>
    </Field>
  );
}
