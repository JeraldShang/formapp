import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import SignIn from "./pages/signIn";
import { api } from "~/utils/api";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "next/navigation";

export default function FormView(formData: JSON[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [existFormData, setExistFormData] = useState<object>();
  const [name, setName] = useState<string>();
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [questionData, setQuestionData] = useState<questionModel[]>([
    {
      id: 0,
      question: "Question 1",
      inputType: "text",
      response: "",
    },
  ]);
  return (
    <div>
      <div className="my-10 w-1/2 rounded-lg bg-gray-200 px-2">
        <div className=" border-b-2 border-gray-400 py-6">
          <input
            type="text"
            value={name}
            className="text-cl mx-3 w-4/5 bg-gray-200 text-3xl outline-none"
          />
        </div>
        <div className="my-2 flex">
          <p className="mx-3">{sessionData.user.email}</p>
          <button className="font-bold text-red-500">Sign Out</button>
          <div className="flex grow justify-end">
            <button
              onClick={() => {
                createFormMutate({
                  formId: formId!,
                  name: name!,
                  createdById: sessionData?.user.id!,
                  formObject: questionData,
                });
              }}
              className="rounded-md bg-blue-500 px-5 font-bold text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {questionData.map((data) => (
        <div className="mt-4 flex w-1/2 flex-col gap-3 rounded-lg bg-gray-200 px-2 py-4">
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
          ) : (
            <div></div>
          )}
        </div>
      ))}
      <div className="mt-4 flex w-1/2 grow justify-end">
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
            <button className="px-2 py-2 hover:bg-blue-200 hover:text-blue-500">
              Multiple Choice
            </button>
            <button className=" px-2 py-2 hover:bg-blue-200 hover:text-blue-500">
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
            className="h-8 w-8 rounded-full border-2 border-blue-500 p-1 text-blue-500 hover:border-blue-200 hover:text-blue-200"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
    </div>
  );
}
