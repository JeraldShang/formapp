import type { FormObject } from "./Form";

export type FormDeleteObj = {
  formObj: FormObject;
  questionId: string;
  onClose: (newFormObject: FormObject | undefined) => void;
  open: boolean;
};
