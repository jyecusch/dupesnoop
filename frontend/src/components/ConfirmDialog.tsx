import { createPortal } from "react-dom";
import Button from "./Button";

interface ModalProps {
  children: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

const Modal = ({ children, onCancel, onConfirm }: ModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        {children}
        <div className="flex justify-center mt-4 gap-2">
          <Button
            elevated
            color="secondary"
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            elevated
            color="primary"
            onClick={() => {
              onConfirm();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

const ConfirmDialog = ({ onCancel, onConfirm, children }: ConfirmDialogProps) => {
  return createPortal(
    <Modal onCancel={onCancel} onConfirm={onConfirm}>
      {children}
    </Modal>,
    document.body
  );
};

export default ConfirmDialog;