export type InputType = "text" | "radio" | "checkbox";

export type RadioResponseModel = {
  options: { id: string; option: string }[];
  selected: string;
};
export type CheckBoxResponseModel = {
  id: string;
  option: string;
  selected: boolean;
};
export type QuestionModel = {
  id: string;
  question: string;
  inputType: InputType;
  response: string | RadioResponseModel | CheckBoxResponseModel[];
};

export type FormObject = {
  id: string;
  name: string;
  formId: string;
  createdById: string;
  createdAt: string;
  formObject: QuestionModel[];
};
