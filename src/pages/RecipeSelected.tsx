import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSingleRecipe } from "../redux/thunks";
import { getCurrentRecipe } from "../redux/recipeSlice";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Box, CircularProgress, Grid, LinearProgress, List, ListItem, ListItemText, Typography } from "@mui/material";

export const RecipeSelected = () => {

    const { recipeId } = useParams();

    const dispatch = useAppDispatch();

    const recipeData = useAppSelector(getCurrentRecipe);

    useEffect(() => {
        dispatch(fetchSingleRecipe(recipeId));
    }, []);

    return (
        <>
            <Box display="flex" flexDirection="column" height="100vh">
                <RecipeAppBar />
                <Grid container spacing={2} direction="row" flexWrap="nowrap" justifyContent="center" alignItems="center" width="100%" height="100%" margin="0px">
                    <Grid item xs={12} md={5} height="100%">
                        <Box display="flex" flexDirection="column" height="100%">
                            <Box display="flex" flexDirection="row" height="25vh">
                                <Typography>Recipe</Typography>
                            </Box>
                            <Box>
                                {recipeData ? (
                                    <List>
                                        {
                                            recipeData.ingredients.map((ingredient) => {
                                                return (
                                                    <ListItem>
                                                        <ListItemText primary={ingredient} />
                                                    </ListItem>)
                                            })
                                        }
                                    </List>
                                ) : (<LinearProgress />)}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={7} justifyContent="center" alignItems="center">
                        <Box display="flex" flexDirection="column" height="100%" overflow="hidden" sx={{ overflowY: "scroll" }} >
                            <Box height="50vh">
                                <img src="/ricettabase" alt={recipeData?.title} />
                            </Box>
                            <Box>
                                {recipeData ? (
                                    <Typography>{recipeData.preparation}</Typography>
                                ) : (<CircularProgress />)}
                            </Box>
                        </Box>
                    </Grid>
                </Grid >
            </Box>

        </>);
}