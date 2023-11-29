import type { GetServerSidePropsContext } from "next/types";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      formId: context.query.formId,
    },
  };
}

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import SignIn from "../signIn";
import { api } from "~/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { createId } from "@paralleldrive/cuid2";
import DeleteQuestion from "~/components/deleteQuestion";
import { FormObject } from "~/types/Form";
import FormHistory from "~/components/formHistory";
import { Sheet, SheetTrigger } from "~/components/ui/sheet";
import Link from "next/link";

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
  id: string;
  question: string;
  inputType: inputType;
  response: string | radioResponseModel | checkBoxResponseModel[];
};

type FormDetailsProps = {
  formId: string;
};
const Form: React.FC<FormDetailsProps> = ({ formId }) => {
  const { mutate: createFormMutate } = api.form.createForm.useMutation();
  const { data: existFormCall, isLoading } =
    api.form.getSpecificFormId.useQuery({
      formId: formId,
    });
  console.log(existFormCall);
  const [questionData, setQuestionData] = useState<questionModel[]>([
    {
      id: createId(),
      question: "Question 1",
      inputType: "text",
      response: "",
    },
  ]);
  const [name, setName] = useState<string>("Untitled Form");
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [saveIsDisabled, setSaveIsDisabled] = useState(true);
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
  const [selectedDeleteQuestion, setSelectedDeleteQuestion] =
    useState<string>("");
  const [openFormHistory, setOpenFormHistory] = useState(true);

  useEffect(() => {
    if (!isLoading && existFormCall != null) {
      setName(existFormCall?.name);
      setQuestionData(existFormCall?.formObject as questionModel[]);
    }
  }, [isLoading]);

  const { data: sessionData } = useSession();
  if (sessionData == null) {
    return <SignIn />;
  }

  function closeDeleteQuestionModal(newFormObj: FormObject | undefined) {
    if (newFormObj != undefined) {
      setQuestionData(newFormObj.formObject);
      enableSave();
    }
    console.log(newFormObj);
    setShowDeleteQuestionModal(false);
  }

  // Type guards
  function isRadioResponse(response: any): response is radioResponseModel {
    return (
      typeof response === "object" &&
      response !== null &&
      "selected" in response
    );
  }

  function isCheckBoxResponse(
    response: any,
  ): response is checkBoxResponseModel[] {
    return (
      Array.isArray(response) && response.every((item) => "selected" in item)
    );
  }

  function addQuestion(type: inputType) {
    setShowAddOptions(false);
    let questionNumber = questionData.length + 1;
    if (type == "text") {
      setQuestionData((prevArr) => [
        ...prevArr,
        {
          id: createId(),
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
          id: createId(),
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
          id: createId(),
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

  const mutateRadioQuestion = {
    delete: (questionId: string, optionId: string) => {
      setQuestionData((prevArr) => {
        const newArray = [...prevArr];

        newArray.forEach((questionObj, index) => {
          if (
            questionObj.id == questionId &&
            isRadioResponse(questionObj.response)
          ) {
            let tempOptionsArr: { id: string; option: string }[] = [];
            questionObj.response.options.forEach(
              (optionsObj: { id: string; option: string }) => {
                if (optionsObj.id != optionId) {
                  tempOptionsArr.push(optionsObj);
                }
              },
            );
            questionObj.response.options = tempOptionsArr;
          }
        });
        return newArray;
      });
    },
    add: (questionId: string) => {
      //setQuestionData somehow renders twice so to prevent this im using counter
      let renderCount = 0;
      setQuestionData((prevArr) => {
        //rendercount Checker
        if (renderCount > 0) return [...prevArr];
        renderCount++;

        const newArray = [...prevArr];
        newArray.forEach((questionObj, index) => {
          if (
            questionObj.id == questionId &&
            isRadioResponse(questionObj.response) &&
            newArray[index] != undefined &&
            isRadioResponse(newArray[index]?.response)
          ) {
            questionObj.response.options.push({
              id: createId(),
              option: "Another Question",
            });
          }
        });
        return newArray;
      });
    },
    select: (questionId: string, selectedId: string) => {
      setQuestionData((prevArr) => {
        let newArray = [...prevArr];
        newArray.forEach((questionObj) => {
          if (
            questionObj.id == questionId &&
            isRadioResponse(questionObj.response)
          ) {
            questionObj.response.selected = selectedId;
          }
        });

        return newArray;
      });
    },
    option: (questionId: string, optionId: string, newOption: string) => {
      setQuestionData((prevArr) => {
        let newArray = [...prevArr];
        newArray.forEach((questionObj) => {
          if (
            questionObj.id == questionId &&
            isRadioResponse(questionObj.response)
          ) {
            console.log(questionObj.response.options);
            questionObj.response.options.forEach((optionObj) => {
              if (optionObj.id == optionId) {
                optionObj.option = newOption;
              }
            });
          }
        });

        return newArray;
      });
    },
  };
  const mutateCheckQuestion = {
    select: (questionId: string, selected: string) => {
      //setQuestionData somehow renders twice so to prevent this im using counter
      let renderCount = 0;
      setQuestionData((prevArr) => {
        //rendercount Checker
        if (renderCount > 0) return [...prevArr];
        renderCount++;

        let newArray = [...prevArr];
        newArray.forEach((questionObj: questionModel, index) => {
          if (
            questionObj.id == questionId &&
            isCheckBoxResponse(questionObj.response)
          ) {
            questionObj.response.forEach((optionObj: checkBoxResponseModel) => {
              if (optionObj.id == selected) {
                optionObj.selected = !optionObj.selected;
              }
            });
          }
        });
        return newArray;
      });
    },
    delete: (questionId: string, optionId: string) => {
      setQuestionData((prevArr) => {
        const newArray = [...prevArr];

        newArray.forEach((questionObj, index) => {
          if (
            questionObj.id == questionId &&
            isCheckBoxResponse(questionObj.response)
          ) {
            let tempOptionsArr: {
              id: string;
              option: string;
              selected: boolean;
            }[] = [];
            questionObj.response.forEach((optionObj: checkBoxResponseModel) => {
              if (optionObj.id != optionId) {
                tempOptionsArr.push(optionObj);
              }
            });

            questionObj.response = tempOptionsArr;
          }
        });
        return newArray;
      });
    },
    add: (questionId: string) => {
      //setQuestionData somehow renders twice so to prevent this im using counter
      let renderCount = 0;
      setQuestionData((prevArr) => {
        //rendercount Checker
        if (renderCount > 0) return [...prevArr];
        renderCount++;

        const newArray = [...prevArr];
        newArray.forEach((questionObj, index) => {
          if (
            questionObj.id == questionId &&
            isCheckBoxResponse(questionObj.response) &&
            newArray[index] != undefined &&
            isCheckBoxResponse(newArray[index]?.response)
          ) {
            let tempOptionsArr: {
              id: string;
              option: string;
              selected: boolean;
            }[] = [];

            questionObj.response.push({
              id: createId(),
              option: "Another Question",
              selected: false,
            });
          }
        });
        return newArray;
      });
    },
    option: (questionId: string, optionId: string, newOption: string) => {
      setQuestionData((prevArr) => {
        let newArray = [...prevArr];
        newArray.forEach((questionObj) => {
          if (
            questionObj.id == questionId &&
            isCheckBoxResponse(questionObj.response)
          ) {
            questionObj.response.forEach((optionObj) => {
              if (optionObj.id == optionId) {
                optionObj.option = newOption;
              }
            });
          }
        });

        return newArray;
      });
    },
  };

  function mutateQuestionTitle(newQuestion: string, questionId: string) {
    setQuestionData((prevArr) => {
      let newArray = [...prevArr];
      newArray.forEach((questionObj) => {
        if (questionObj.id == questionId) {
          questionObj.question = newQuestion;
        }
      });
      return newArray;
    });
  }

  function mutateTextQuestionResponse(questionId: string, newResposne: string) {
    setQuestionData((prevArr) => {
      let newArray = [...prevArr];
      newArray.forEach((questionObj) => {
        if (questionObj.id == questionId) {
          questionObj.response = newResposne;
        }
      });
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
        {showDeleteQuestionModal ? (
          <DeleteQuestion
            formObj={existFormCall!}
            questionId={selectedDeleteQuestion}
            open={showDeleteQuestionModal}
            onClose={closeDeleteQuestionModal}
          />
        ) : null}

        <div className="flex w-full bg-gray-200 py-3">
          <div className="flex w-1/2 items-center justify-start">
            <Link
              className="mx-3 flex h-10 items-center rounded-lg bg-blue-600 px-2 py-1 font-serif text-white"
              href={"/"}
            >
              Home
            </Link>
            <img
              src={sessionData.user.image!}
              className="h-14 w-14 rounded-full"
              alt="Profile Picture"
            />
          </div>
          <div className="mr-8 flex w-1/2 items-center justify-end ">
            <Sheet>
              <SheetTrigger>
                <FontAwesomeIcon className="h-8 w-8" icon={faClockRotateLeft} />
              </SheetTrigger>
              <FormHistory formId={formId} />
            </Sheet>
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
            <div className="flex">
              <div className="w-2/3">
                <input
                  type="text"
                  value={data.question}
                  className="bg-gray-200 text-lg font-semibold outline-none"
                  onChange={(e) => {
                    mutateQuestionTitle(e.target.value, data.id);
                  }}
                />
              </div>
              <div className="flex w-1/3 justify-end  font-sans text-sm ">
                <button
                  className="text-red-500 hover:text-red-300"
                  onClick={() => {
                    setSelectedDeleteQuestion(data.id);
                    setShowDeleteQuestionModal(true);
                  }}
                >
                  Delete Question
                </button>
              </div>
            </div>

            {typeof data.response == "string" ? (
              <input
                type="text"
                className="border-b border-gray-400 bg-gray-200 outline-none"
                value={data.response}
                onChange={(e) => {
                  mutateTextQuestionResponse(data.id, e.target.value);
                }}
                placeholder="Fill in response here"
              />
            ) : isRadioResponse(data.response) ? (
              <div className="flex flex-col">
                {data.response.options.map((optionObj) => (
                  <label className="flex">
                    {isRadioResponse(data.response) ? (
                      <input
                        className="mr-2"
                        size={10}
                        type="radio"
                        name={optionObj.option}
                        id={optionObj.id}
                        checked={data.response.selected == optionObj.id}
                        onChange={() => {
                          mutateRadioQuestion.select(data.id, optionObj.id);
                        }}
                      />
                    ) : null}

                    <input
                      className="w-3/4 bg-gray-200 outline-none"
                      type="text"
                      value={optionObj.option}
                      onChange={(e) => {
                        mutateRadioQuestion.option(
                          data.id,
                          optionObj.id,
                          e.target.value,
                        );
                      }}
                    />
                    <div className="mr-4 flex grow justify-end">
                      <button
                        onClick={() => {
                          mutateRadioQuestion.delete(data.id, optionObj.id);
                          enableSave();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className="h-4 text-red-600 hover:text-red-300"
                        />
                      </button>
                    </div>
                  </label>
                ))}

                <div className="mt-3 flex ">
                  <p className="text-sm opacity-50">
                    Multiple Choice: Only one can be selected
                  </p>
                  <div className="mr-3 flex grow justify-end">
                    <button
                      onClick={() => {
                        mutateRadioQuestion.add(data.id);
                        enableSave();
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="h-5 w-5 rounded-full border border-black hover:scale-105"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.response.map(
                  (
                    optionObj: checkBoxResponseModel,
                    optionObjIndex: number,
                  ) => (
                    <label className="flex">
                      <input
                        className="mr-2"
                        size={10}
                        type="checkbox"
                        name={optionObj.option}
                        id={optionObj.id}
                        checked={optionObj.selected}
                        onChange={() => {
                          mutateCheckQuestion.select(data.id, optionObj.id);
                        }}
                      />
                      <input
                        className="w-3/4 bg-gray-200 outline-none"
                        type="text"
                        value={optionObj.option}
                        onChange={(e) => {
                          mutateCheckQuestion.option(
                            data.id,
                            optionObj.id,
                            e.target.value,
                          );
                        }}
                      />
                      <div className="mr-4 flex grow justify-end">
                        <button
                          onClick={() => {
                            mutateCheckQuestion.delete(data.id, optionObj.id);
                            enableSave();
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            className="h-4 text-red-600 hover:text-red-300"
                          />
                        </button>
                      </div>
                    </label>
                  ),
                )}
                <div className="mt-3 flex ">
                  <p className="text-sm opacity-50">
                    Multi Select: Multiple options can be selected
                  </p>
                  <button
                    className="mr-3 flex grow justify-end"
                    onClick={() => {
                      mutateCheckQuestion.add(data.id);
                      enableSave();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="h-5 w-5 rounded-full border border-black hover:scale-105"
                    />
                  </button>
                </div>
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
              onClick={() => {
                setShowAddOptions(true);
                enableSave();
              }}
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

// function radioQuestionView(data);

export default Form;
