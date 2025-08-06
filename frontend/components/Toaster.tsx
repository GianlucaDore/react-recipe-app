import { Alert, Snackbar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { getEntireSnackbar, setClose } from "../redux/snackbarSlice"
import { SnackbarState } from "../redux/storetypes";

export const Toaster = () =>{

    const dispatch = useAppDispatch();

    const snackbarState: SnackbarState = useAppSelector(getEntireSnackbar);


    const handleCloseSnackbar = () => {
        dispatch(setClose);
    }


    return (
        <Snackbar
            open={snackbarState.open}
            autoHideDuration={snackbarState.autoHideDuration}
            onClose={handleCloseSnackbar}
        >
            <Alert
                onClose={handleCloseSnackbar}
                severity={snackbarState.severity}
                variant={snackbarState.variant}
            >
                {snackbarState.message}
            </Alert>
        </Snackbar>
    )
}