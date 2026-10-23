"use client";

import { useId, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { Field, controlBase, controlState } from "./field";

export type PasswordInputProps = Omit<
  ComponentProps<"input">,
  "required" | "type"
> & {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  wrapperClassName?: string;
};

export function PasswordInput({
  id,
  label,
  required,
  error,
  helper,
  wrapperClassName,
  className,
  ...props
}: PasswordInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

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
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className={cn(
            controlBase,
            controlState(error),
            "h-10 px-3 pr-10",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={
            visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
          }
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  );
}
