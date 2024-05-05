import { Box, Grid } from '@mui/material';
import { RecipeOfTheDay } from "../components/RecipeOfTheDay";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { RecipesList } from '../components/RecipesList';
import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchRecipes } from '../redux/thunks';

export const RecipeHome = () => {

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchRecipes());
    }, [])


    return (
        <>
            <Box display="flex" flexDirection="column" height="100vh">
                <RecipeAppBar />
                <Grid container spacing={2} direction="column" flexWrap="nowrap" justifyContent="center" alignItems="center" marginTop="15px" marginLeft="0px" width="100%">
                    <Grid item xs={12} marginBottom="30px">
                        <RecipeOfTheDay />
                    </Grid>
                    <Grid container spacing={1} justifyContent="center" alignItems="center">
                        <RecipesList />
                    </Grid>
                </Grid >
            </Box>
        </>
    );
}