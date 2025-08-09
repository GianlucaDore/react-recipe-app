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
        setOpenSnackbar: (state) => {
            state.open = true;
        },
        setCloseSnackbar: (state) => {
            state.open = false;
        },
        setAutoHideDurationSnackbar: (state, action) => {
            state.autoHideDuration = action.payload;
        },
        setMessageSnackbar: (state, action) => {
            state.message = action.payload;
        },
        setPositionSnackbar: (state, action) => {
            state.position = action.payload;
        },
        setSeveritySnackbar: (state, action) => {
            state.severity = action.payload;
        },
        setOpenSnackbarWithParameters: (state, action) => {
            state.open = action.payload.open;
            state.autoHideDuration = action.payload.autoHideDuration;
            state.message = action.payload.message;
            state.position = action.payload.position;
            state.severity = action.payload.severity;
        }
    }
});

export const getIsOpen = (state: RootState) => state.snackbar.open;
export const getAutoHideDuration = (state: RootState) => state.snackbar.autoHideDuration;
export const getMessage = (state: RootState) => state.snackbar.autoHideDuration;
export const getPosition = (state: RootState) => state.snackbar.position;
export const getSeverity = (state: RootState) => state.snackbar.severity;
export const getVariant = (state: RootState) => state.snackbar.variant;

export const getEntireSnackbar = (state: RootState) => state.snackbar;

export const { setOpenSnackbar, setCloseSnackbar, setAutoHideDurationSnackbar, setMessageSnackbar, setPositionSnackbar, setSeveritySnackbar, setOpenSnackbarWithParameters } = snackbarSlice.actions;


export default snackbarSlice.reducer;