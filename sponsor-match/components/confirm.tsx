"use client";

import { useCallback, useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui";

/** ブラウザ標準の confirm() の代わりに使う確認ダイアログ */
export function useConfirm() {
  const [state, setState] = useState<{ message: string; okLabel: string; onOk: () => void } | null>(null);

  const ask = useCallback((message: string, onOk: () => void, okLabel = "実行する") => {
    setState({ message, onOk, okLabel });
  }, []);

  const close = useCallback(() => setState(null), []);

  const dialog = (
    <Modal
      open={state !== null}
      onClose={close}
      title="確認"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            キャンセル
          </Button>
          <Button
            className="bg-accent-600 hover:bg-accent-700"
            onClick={() => {
              state?.onOk();
              close();
            }}
          >
            {state?.okLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-navy-800">{state?.message}</p>
    </Modal>
  );

  return { ask, dialog };
}
