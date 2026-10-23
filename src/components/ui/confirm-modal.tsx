"use client";

import { Button } from "./button";
import { Modal } from "./modal";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Hapus",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      widthClassName="max-w-[400px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline-neutral" onClick={onClose}>
            Batal
          </Button>
          <Button variant="outline-danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-foreground">{message}</p>
    </Modal>
  );
}
