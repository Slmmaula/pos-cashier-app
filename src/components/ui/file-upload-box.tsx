"use client";

import { useId, useState, type ChangeEvent } from "react";
import { X, type LucideIcon } from "lucide-react";
import { Field } from "./field";
import { cn } from "@/lib/cn";

export type UploadedFile = {
  name: string;
  type: string;
  dataUrl: string;
};

type FileUploadBoxProps = {
  label?: string;
  icon: LucideIcon;
  accept: string[];
  hints: string[];
  maxSizeMB?: number;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  error?: string;
  className?: string;
};

export function FileUploadBox({
  label,
  icon: Icon,
  accept,
  hints,
  maxSizeMB = 2,
  value,
  onChange,
  error,
  className,
}: FileUploadBoxProps) {
  const inputId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!accept.includes(file.type)) {
      setLocalError("Format file tidak didukung");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`Ukuran file melebihi ${maxSizeMB}MB`);
      return;
    }

    setLocalError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result),
      });
    };
    reader.onerror = () => setLocalError("File gagal dibaca");
    reader.readAsDataURL(file);
  }

  const isImage = value?.type.startsWith("image/");

  return (
    <Field
      id={inputId}
      label={label}
      error={error ?? localError ?? undefined}
      className={className}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <label
            htmlFor={inputId}
            className={cn(
              "flex size-32 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-control border border-line bg-card p-2 text-center text-xs text-placeholder transition hover:bg-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
            )}
          >
            {value && isImage ? (
              <img
                src={value.dataUrl}
                alt={value.name}
                className="size-full object-cover"
              />
            ) : value ? (
              <>
                <Icon className="size-5 text-muted" />
                <span className="line-clamp-2 break-all text-muted">
                  {value.name}
                </span>
              </>
            ) : (
              <>
                <Icon className="size-5" />
                <span>Klik untuk upload</span>
              </>
            )}
            <input
              id={inputId}
              type="file"
              accept={accept.join(",")}
              onChange={handleChange}
              className="sr-only"
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                onChange(null);
              }}
              aria-label="Hapus file"
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-line bg-card text-danger shadow-card transition hover:bg-danger-soft"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs leading-5 text-placeholder">
          {hints.map((hint) => (
            <p key={hint}>{hint}</p>
          ))}
        </div>
      </div>
    </Field>
  );
}
