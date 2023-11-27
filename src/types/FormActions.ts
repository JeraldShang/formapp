import { FormObject } from "./Form";

export interface FormDeleteObj {
  formObj: FormObject;
  questionId: String;
  onClose: (newFormObject: FormObject | undefined) => void;
  open: boolean;
}
