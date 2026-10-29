import type { FeedbackMessageProps } from "../../types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const FeedbackMessage = ({ message, variant, icon }: FeedbackMessageProps) => {
  if (!message) return null;

  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          : "flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
      }
    >
      {icon ??
        (isError ? (
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
        ))}
      <div>
        {isError && (
          <p className="font-semibold">
            Não foi possível concluir a operação
          </p>
        )}
        <p className={isError ? "mt-1" : ""}>{message}</p>
      </div>
    </div>
  );
}

export default FeedbackMessage;
