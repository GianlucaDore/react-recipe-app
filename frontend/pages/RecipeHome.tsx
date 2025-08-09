import { Box, Grid } from '@mui/material';
import { RecipeOfTheDay } from "../components/RecipeOfTheDay";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { RecipesList } from '../components/RecipesList';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchRecipeOfTheDay, fetchRecipesBatch, fetchTotalNumberOfPagesInHome } from '../redux/thunks';
import { Toaster } from '../components/Toaster';
import { setMessageSnackbar, setOpenSnackbar, setSeveritySnackbar } from '../redux/snackbarSlice';
import { getErrorMessage } from '../utils/helpers';

export const RecipeHome = () => {

    const dispatch = useAppDispatch();

    const [pageNumber, setPageNumber] = useState(1);

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(fetchRecipesBatch(pageNumber)).unwrap();
                await dispatch(fetchTotalNumberOfPagesInHome()).unwrap();
            } 
            catch (err) {
                dispatch(setMessageSnackbar(getErrorMessage(err)));
                dispatch(setSeveritySnackbar("error"));
                dispatch(setOpenSnackbar());
            }
        };
        fetchData();
        
    }, [dispatch, pageNumber]);


    useEffect(() => {
        const fetchRotd = async () => {
            try {
                await dispatch(fetchRecipeOfTheDay()).unwrap();
            }
            catch (err) {
                dispatch(setMessageSnackbar(getErrorMessage(err)));
                dispatch(setSeveritySnackbar("error"));
                dispatch(setOpenSnackbar());
            }
        };
        fetchRotd();
    });


    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <RecipeAppBar />
            <Toaster />
            <Grid container spacing={2} width="100%"direction="column" flexWrap="nowrap" justifyContent="center" alignItems="center" paddingTop="15px" marginLeft="0px">
                <Grid item xs={12} marginBottom="35px" paddingBottom="25px" justifyContent="center" sx={{ backgroundColor: "#3B2F2F" }}>
                    <RecipeOfTheDay />
                </Grid>
                <Grid container spacing={1} justifyContent="center" alignItems="center">
                    <RecipesList pageState={{ pageNumber: pageNumber, setPageNumber: setPageNumber }} />
                </Grid>
            </Grid >
        </Box>
    );
}