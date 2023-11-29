import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import type { FormDeleteObj } from "~/types/FormActions";
import type { QuestionModel } from "~/types/Form";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
  border: "20px",
};

const DeleteQuestion: React.FC<FormDeleteObj> = ({
  formObj,
  questionId,
  onClose,
  open,
}) => {
  function deleteQuestionFunc() {
    const newFormObj = formObj;

    const tempQuestions: QuestionModel[] = [];
    newFormObj.formObject.forEach((questionObj: QuestionModel) => {
      if (questionObj.id != questionId) {
        tempQuestions.push(questionObj);
      }
    });
    newFormObj.formObject = tempQuestions;

    onClose(newFormObj);
  }
  return (
    <Modal
      open={open}
      onClose={() => {
        onClose(undefined);
      }}
    >
      <Box sx={style}>
        <p>Are you sure you want to delete this question?</p>
        <div className="mt-3 flex justify-end gap-2 text-lg text-white">
          <button
            onClick={() => {
              onClose(undefined);
            }}
            className="rounded-lg bg-blue-500 px-3 py-1 "
          >
            No
          </button>
          <button
            onClick={deleteQuestionFunc}
            className="rounded-lg bg-red-500 px-3 py-1 "
          >
            Yes
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default DeleteQuestion;
