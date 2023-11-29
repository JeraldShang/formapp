export type InputType = "text" | "radio" | "checkbox";

export interface RadioResponseModel {
  options: { id: string; option: string }[];
  selected: string;
}
export interface CheckBoxResponseModel {
  id: string;
  option: string;
  selected: boolean;
}
export interface QuestionModel {
  id: string;
  question: string;
  inputType: InputType;
  response: string | RadioResponseModel | CheckBoxResponseModel[];
}

export interface FormObject {
  id: string;
  name: string;
  formId: string;
  createdById: string;
  createdAt: any;
  formObject: QuestionModel[];
}
