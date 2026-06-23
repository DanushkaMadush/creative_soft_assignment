import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type DeleteConfirmationDialogProps = {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  title?: string;
  itemName?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteConfirmationDialog = ({
  open,
  loading = false,
  error = null,
  title = "Delete Item",
  itemName,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {description ? (
          <Typography>{description}</Typography>
        ) : (
          <>
            <Typography>
              Are you sure you want to delete
              {itemName && (
                <>
                  {" "}
                  <strong>{itemName}</strong>
                </>
              )}
              ?
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Deleting..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
