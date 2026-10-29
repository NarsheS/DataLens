import type { ChangeEvent, RefObject } from "react";

type ImportCardProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  isLoading: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChooseFile: () => void;
};

export type { ImportCardProps };