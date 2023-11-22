import type { GetServerSidePropsContext } from "next/types";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      formId: context.query.formId,
    },
  };
}

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import SignIn from "../signIn";
import { api } from "~/utils/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";

type inputType = "text" | "radio" | "checkbox";

type radioResponseModel = {
  options: { id: string; option: string }[];
  selected: string;
};
type checkBoxResponseModel = {
  id: string;
  option: string;
  selected: boolean;
};
type questionModel = {
  id: number;
  question: string;
  inputType: inputType;
  response: string | radioResponseModel | checkBoxResponseModel[];
};
type radioCheckSelectChangeModel = {
  type: "radio" | "check";
  selected: string;
};
type radioCheckQuestionChangeModel = {
  id: number;
  question: string;
};

type FormDetailsProps = {
  formId: string;
};
const Form: React.FC<FormDetailsProps> = ({ formId }) => {
  const { mutate: createFormMutate } = api.form.createForm.useMutation();
  const { data: existFormCall, isLoading } = api.form.getSpecificForm.useQuery({
    formId: formId,
  });
  const [questionData, setQuestionData] = useState<questionModel[]>([
    {
      id: 0,
      question: "Question 1",
      inputType: "text",
      response: "",
    },
  ]);
  const [name, setName] = useState<string>("Untitled Form");
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [saveIsDisabled, setSaveIsDisabled] = useState(true);

  useEffect(() => {
    if (!isLoading && existFormCall != null) {
      setName(existFormCall?.name);
      setQuestionData(existFormCall?.formObject);
    } else {
      enableSave();
    }
  }, [isLoading]);

  const { data: sessionData } = useSession();
  if (sessionData == null) {
    return <SignIn />;
  }
  function addQuestion(type: inputType) {
    setShowAddOptions(false);
    let questionNumber = questionData.length + 1;
    if (type == "text") {
      setQuestionData((prevArr) => [
        ...prevArr,
        {
          id: questionNumber - 1,
          question: `Question ${questionNumber}`,
          inputType: "text",
          response: "",
        },
      ]);
    } else if (type == "radio") {
      let selectedId = createId();
      setQuestionData((prevArr) => [
        ...prevArr,
        {
          id: questionNumber - 1,
          question: `Question ${questionNumber}`,
          inputType: "radio",
          response: {
            options: [
              { option: "Option 1", id: selectedId },
              { option: "Option 2", id: createId() },
              { option: "Option 3", id: createId() },
              { option: "Option 4", id: createId() },
            ],
            selected: selectedId,
          },
        },
      ]);
    } else if (type == "checkbox") {
      setQuestionData((prevArr) => [
        ...prevArr,
        {
          id: questionNumber - 1,
          question: `Question ${questionNumber}`,
          inputType: "checkbox",
          response: [
            { id: createId(), option: "Option 1", selected: true },
            { id: createId(), option: "Option 2", selected: true },
            { id: createId(), option: "Option 3", selected: false },
            { id: createId(), option: "Option 4", selected: false },
          ],
        },
      ]);
    }
  }
  function enableSave() {
    setSaveIsDisabled(false);
  }
  function deleteRadioOption(questionId: number, id: string) {
    setQuestionData((prevArr) => {
      const newArray = [...prevArr];

      newArray.forEach((questionObj) => {
        if (questionObj.id == questionId) {
          questionObj.response.questions.forEach(option);
        }
      });
    });
  }
  function mutateQuestion(
    questionId: number,
    questionOrResponse: "question" | "response",
    data: string | radioCheckSelectChangeModel | radioCheckQuestionChangeModel,
  ) {
    setQuestionData((prevArr) => {
      const newArray = [...prevArr];

      if (questionOrResponse == "question" && typeof data != "object") {
        newArray[questionId]!.question = data;
      } else if (typeof data == "object") {
        if (data.selected != undefined) {
          if (data.type == "radio") {
            newArray[questionId]!.response.selected = data.selected;
          } else {
            if (Array.isArray(newArray[questionId]!.response.selected)) {
              if (
                newArray[questionId]!.response.selected.includes(data.selected)
              ) {
                let tempArr = newArray[questionId]!.response.selected.filter(
                  (ans: string) => ans !== data.selected,
                );

                newArray[questionId]!.response.selected = tempArr;
              } else {
                newArray[questionId]!.response.selected = [
                  ...newArray[questionId]!.response.selected,
                  data.selected,
                ];
              }
            }
          }
        } else if (data.question != undefined) {
          newArray.forEach((questionObj) => {
            if (questionObj.response.options != undefined) {
              questionObj.response.options.forEach((responseObj) => {
                if (responseObj.id == data.id) {
                  responseObj.option = data.question;
                }
              });
            }
          });
        }
      } else {
        newArray[questionId]!.response = data;
      }

      return newArray;
    });
  }

  return (
    <>
      <Head>
        <title>Form</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center font-sans">
        <div className="flex w-full bg-gray-200 py-3">
          <div className="flex w-1/2 items-center justify-start">
            <a
              href="/"
              className="mx-3 h-10 rounded-lg bg-blue-600 px-2 py-1 font-serif text-white"
            >
              Home
            </a>
            <img
              src={sessionData.user.image!}
              className="h-14 w-14 rounded-full"
              alt="Profile Picture"
            />
          </div>
        </div>
        <div className="my-10 w-1/2 rounded-lg bg-gray-200 px-2">
          <div className=" border-b-2 border-gray-400 py-6">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                enableSave();
                setName(e.target.value);
              }}
              className="text-cl mx-3 w-4/5 bg-gray-200 text-3xl outline-none"
            />
          </div>
          <div className="my-2 flex">
            <p className="mx-3">{sessionData.user.email}</p>
            <button className="font-bold text-red-500">Sign Out</button>
            <div className="flex grow justify-end">
              <button
                onClick={() => {
                  setSaveIsDisabled(true);
                  createFormMutate({
                    formId: formId!,
                    name: name!,
                    createdById: sessionData?.user.id!,
                    formObject: questionData,
                  });
                }}
                disabled={saveIsDisabled}
                className="rounded-md bg-blue-500 px-5 font-bold text-white hover:bg-blue-400 disabled:opacity-20"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {questionData.map((data) => (
          <div
            className="mt-4 flex w-1/2 flex-col gap-3 rounded-lg bg-gray-200 px-2 py-4"
            onChange={() => {
              enableSave();
            }}
          >
            <input
              type="text"
              value={data.question}
              className="bg-gray-200 text-lg font-semibold outline-none"
              onChange={(e) => {
                mutateQuestion(data.id, "question", e.target.value);
              }}
            />
            {typeof data.response == "string" ? (
              <input
                type="text"
                className="border-b border-gray-400 bg-gray-200 outline-none"
                value={data.response}
                onChange={(e) => {
                  mutateQuestion(data.id, "response", e.target.value);
                }}
                placeholder="Fill in response here"
              />
            ) : data.inputType == "radio" ? (
              <div className="flex flex-col">
                {data.response.options.map((questionObj, indexOfQuestion) => (
                  <label>
                    <input
                      className="mr-2"
                      size={10}
                      type="radio"
                      name={questionObj.option}
                      id={questionObj.id}
                      checked={data.response.selected == questionObj.id}
                      onChange={() => {
                        mutateQuestion(data.id, "response", {
                          type: "radio",
                          selected: questionObj.id,
                        });
                      }}
                    />
                    <input
                      className="bg-gray-200 outline-none"
                      type="text"
                      value={questionObj.option}
                      onChange={(e) => {
                        mutateQuestion(data.id, "response", {
                          id: questionObj.id,
                          question: e.target.value,
                        });
                      }}
                    />
                  </label>
                ))}
                <p className="mt-3 text-sm opacity-50">
                  Multiple Choice: Only one can be selected
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.response.questions.map((question, indexOfQuestion) => (
                  <label>
                    <input
                      className="mr-2"
                      size={10}
                      type="checkbox"
                      name={question}
                      id={question}
                      checked={data.response.selected.includes(question)}
                      onChange={() => {
                        mutateQuestion(data.id, "response", {
                          type: "check",
                          selected: question,
                        });
                      }}
                    />
                    <input
                      className="bg-gray-200 outline-none"
                      type="text"
                      value={question}
                      onChange={(e) => {
                        mutateQuestion(data.id, "response", {
                          index: indexOfQuestion,
                          question: e.target.value,
                        });
                      }}
                    />
                  </label>
                ))}
                <p className="mt-3 text-sm opacity-50">
                  Multi Select: Multiple options can be selected
                </p>
              </div>
            )}
          </div>
        ))}
        <div className="mb-10 mt-4 flex w-1/2 grow justify-end">
          {showAddOptions ? (
            <div className="flex h-fit flex-col rounded-lg bg-blue-500  text-white">
              <button
                onClick={() => {
                  addQuestion("text");
                }}
                className="rounded-t-lg px-2 py-2 hover:bg-blue-200 hover:text-blue-500"
              >
                Text Response
              </button>
              <button
                onClick={() => {
                  addQuestion("radio");
                }}
                className="px-2 py-2 hover:bg-blue-200 hover:text-blue-500"
              >
                Multiple Choice
              </button>
              <button
                onClick={() => {
                  addQuestion("checkbox");
                }}
                className=" px-2 py-2 hover:bg-blue-200 hover:text-blue-500"
              >
                Checkbox
              </button>
              <button
                onClick={() => setShowAddOptions(false)}
                className="rounded-b-lg bg-red-500 px-2 py-2 hover:bg-red-200 "
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddOptions(true)}
              className=" h-8 w-8 rounded-full border-2 border-blue-500 p-1 text-blue-500 hover:border-blue-200 hover:text-blue-200"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}
        </div>
      </main>
    </>
  );
};

function radioQuestionView(data);

export default Form;
