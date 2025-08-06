import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { SnackbarState } from './storetypes';


const initialState: SnackbarState = {
    open: false,
    autoHideDuration: 5000,
    message: "",
    position: {
        vertical: 'top',
        horizontal: 'right'
    },
    severity: "success",
    variant: "filled"
}


export const snackbarSlice = createSlice({
    name: 'snackbar',
    initialState,
    reducers: {
        setOpen: (state, _) => {
            state.open = true;
        },
        setClose: (state, _) => {
            state.open = false;
        },
        setAutoHideDuration: (state, action) => {
            state.autoHideDuration = action.payload;
        },
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setPosition: (state, action) => {
            state.position = action.payload;
        },
        setSeverity: (state, action) => {
            state.severity = action.payload;
        }
    }
});

export const getIsOpen = (state: RootState) => (state as any).snackbar.open;
export const getAutoHideDuration = (state: RootState) => (state as any).snackbar.autoHideDuration;
export const getMessage = (state: RootState) => (state as any).snackbar.autoHideDuration;
export const getPosition = (state: RootState) => (state as any).snackbar.position;
export const getSeverity = (state: RootState) => (state as any).snackbar.severity;
export const getVariant = (state: RootState) => (state as any).snackbar.variant;

export const { setOpen, setClose, setAutoHideDuration, setMessage, setPosition, setSeverity } = snackbarSlice.actions;


export default snackbarSlice.reducer;