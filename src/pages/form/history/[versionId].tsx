import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import { Head } from "next/document";
import type { GetServerSidePropsContext } from "next/types";
import FormHistory from "~/components/formHistory";
import { SheetTrigger, Sheet } from "~/components/ui/sheet";
import SignIn from "~/pages/signIn";
import { checkBoxResponseModel } from "~/types/Form";
import { api } from "~/utils/api";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      formId: context.query.versionId,
    },
  };
}
type radioResponseModel = {
  options: { id: string; option: string }[];
  selected: string;
};
type FormDetailsProps = {
  formId: string;
};
const dateConfiguration: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
};

const PastFormSnapShot: React.FC<FormDetailsProps> = ({ formId }) => {
  const { data: sessionData } = useSession();
  const { data: formData, isLoading } = api.form.getSpecificVersionId.useQuery({
    formId: formId,
  });
  if (sessionData == null) {
    return <SignIn />;
  }
  function isRadioResponse(response: any): response is radioResponseModel {
    return (
      typeof response === "object" &&
      response !== null &&
      "selected" in response
    );
  }

  return (
    <>
      <main className=" flex min-h-screen flex-col items-center font-sans">
        <div className="flex w-full bg-gray-200 py-3">
          <div className="flex w-1/2 items-center justify-start">
            <a
              href="/"
              className="mx-3 flex h-10 items-center rounded-lg bg-blue-600 px-2 py-1 font-serif text-white"
            >
              Home
            </a>

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
              <FormHistory formId={formData?.formId!} />
            </Sheet>
          </div>
        </div>
        {isLoading || formData == null || formData.formObject == null ? null : (
          <div className="flex w-full justify-center bg-red-500 text-white">
            Your viewing version saved on{" "}
            {new Date(formData!.createdAt).toLocaleDateString(
              "en-US",
              dateConfiguration,
            )}
            , {new Date(formData!.createdAt).toTimeString().slice(0, 8)}
          </div>
        )}

        {isLoading ||
        formData == null ||
        formData.formObject == null ||
        !Array.isArray(formData.formObject) ? (
          <p>Loading</p>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="my-10 w-1/2 rounded-lg bg-gray-200 px-2">
              <div className=" border-b-2 border-gray-400 py-6">
                <input
                  type="text"
                  value={formData?.name}
                  className="text-cl mx-3 w-4/5 bg-gray-200 text-3xl outline-none"
                />
              </div>
              <div className="my-2 flex">
                <p className="mx-3">{sessionData.user.email}</p>
                {/* {type of formData.formObject} */}
              </div>
            </div>
            {formData?.formObject.map((data: any) => (
              <div className="mt-4 flex w-1/2 flex-col gap-3 rounded-lg bg-gray-200 px-2 py-4">
                <div className="flex">
                  <div className="w-2/3">
                    <input
                      type="text"
                      value={data.question}
                      className="bg-gray-200 text-lg font-semibold outline-none"
                    />
                  </div>
                </div>

                {typeof data.response == "string" ? (
                  <input
                    type="text"
                    className="border-b border-gray-400 bg-gray-200 outline-none"
                    value={data.response}
                    placeholder="Fill in response here"
                  />
                ) : isRadioResponse(data.response) ? (
                  <div className="flex flex-col">
                    {data.response.options.map((optionObj: any) => (
                      <label className="flex">
                        {isRadioResponse(data.response) ? (
                          <input
                            className="mr-2"
                            size={10}
                            type="radio"
                            name={optionObj.option}
                            id={optionObj.id}
                            checked={data.response.selected == optionObj.id}
                          />
                        ) : null}

                        <input
                          className="w-3/4 bg-gray-200 outline-none"
                          type="text"
                          value={optionObj.option}
                        />
                      </label>
                    ))}

                    <div className="mt-3 flex ">
                      <p className="text-sm opacity-50">
                        Multiple Choice: Only one can be selected
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {data.response.map((optionObj: checkBoxResponseModel) => (
                      <label className="flex">
                        <input
                          className="mr-2"
                          size={10}
                          type="checkbox"
                          name={optionObj.option}
                          id={optionObj.id}
                          checked={optionObj.selected}
                        />
                        <input
                          className="w-3/4 bg-gray-200 outline-none"
                          type="text"
                          value={optionObj.option}
                        />
                        <div className="mr-4 flex grow justify-end"></div>
                      </label>
                    ))}
                    <div className="mt-3 flex ">
                      <p className="text-sm opacity-50">
                        Multi Select: Multiple options can be selected
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default PastFormSnapShot;
