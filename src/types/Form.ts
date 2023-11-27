export type inputType = "text" | "radio" | "checkbox";

export interface radioResponseModel {
  options: { id: string; option: string }[];
  selected: string;
}
export interface checkBoxResponseModel {
  id: string;
  option: string;
  selected: boolean;
}
export interface questionModel {
  id: string;
  question: string;
  inputType: inputType;
  response: string | radioResponseModel | checkBoxResponseModel[];
}

export interface FormObject {
  id: string;
  name: string;
  formId: string;
  createdById: string;
  createdAt: any;
  formObject: any;
}
