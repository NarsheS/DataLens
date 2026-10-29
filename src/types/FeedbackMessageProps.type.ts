import type { ReactNode } from "react";

type FeedbackMessageProps = {
  message: string;
  variant: "error" | "notice";
  icon?: ReactNode;
};

export type { FeedbackMessageProps };