import { SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { api } from "~/utils/api";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const dateConfiguration: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
};

const FormHistory = ({ formId }: { formId: string }) => {
  const { data: pastForms } = api.form.getPastFormVersions.useQuery({
    formId: formId,
  });
  console.log(process.env.NEXTAUTH_URL);
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="text-2xl">Version History</SheetTitle>
      </SheetHeader>
      <div className="mt-10">
        <a
          href={`http://localhost:3000/form/${formId}`}
          className="text-md mb-10 flex h-12 items-center rounded-lg bg-blue-400 px-4 text-white duration-300 hover:scale-105 hover:cursor-pointer"
        >
          <div>Current Version</div>

          <div className="flex grow justify-end">
            <FontAwesomeIcon icon={faChevronRight} className="h-5" />
          </div>
        </a>
        {!pastForms ? (
          <p>Loading</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pastForms.map((formObj) => (
              <a
                href={`http://localhost:3000/form/history/${formObj.id}`}
                className="text-md flex h-12 items-center rounded-lg bg-blue-400 px-4 text-white duration-300 hover:scale-105 hover:cursor-pointer"
              >
                <div>
                  {new Date(formObj.createdAt).toLocaleDateString(
                    "en-US",
                    dateConfiguration,
                  )}
                  , {new Date(formObj.createdAt).toTimeString().slice(0, 8)}
                </div>

                <div className="flex grow justify-end">
                  <FontAwesomeIcon icon={faChevronRight} className="h-5" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </SheetContent>
  );
};

export default FormHistory;
