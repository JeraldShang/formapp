import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
const style = {
  position: "absolute" as "absolute",
  left: "50%",
  transform: "translate(90%, 0%)",
  width: 400,
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
  border: "20px",
  height: "100vh",
  outline: "none",
};
export default function FormHistory() {
  return (
    <Modal open={true}>
      <Box sx={style}>
        <p className="text-2xl font-medium">Form Edit History</p>
        <div className="mt-3 flex justify-end gap-2 text-lg text-white"></div>
      </Box>
    </Modal>
  );
}
