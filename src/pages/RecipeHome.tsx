import { Box, Grid } from '@mui/material';
import { RecipeOfTheDay } from "../components/RecipeOfTheDay";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { RecipesList } from '../components/RecipesList';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchRecipesBatch, fetchTotalNumberOfPagesInHome } from '../redux/thunks';

export const RecipeHome = () => {

    const dispatch = useAppDispatch();

    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        dispatch(fetchRecipesBatch(pageNumber));
        dispatch(fetchTotalNumberOfPagesInHome());
    }, [pageNumber]);


    return (
        <>
            <Box display="flex" flexDirection="column" height="100vh">
                <RecipeAppBar />
                <Grid container spacing={2} direction="column" flexWrap="nowrap" justifyContent="center" alignItems="center" marginTop="15px" marginLeft="0px" width="100%">
                    <Grid item xs={12} marginBottom="30px">
                        <RecipeOfTheDay />
                    </Grid>
                    <Grid container spacing={1} justifyContent="center" alignItems="center">
                        <RecipesList pageState={{ pageNumber: pageNumber, setPageNumber: setPageNumber }} />
                    </Grid>
                </Grid >
            </Box>
        </>
    );
}