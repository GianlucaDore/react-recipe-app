import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSingleRecipe } from "../redux/thunks";
import { getCurrentRecipe } from "../redux/recipeSlice";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Box, CircularProgress, Grid, LinearProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import { RecipeStats } from "../components/RecipeStats";


export const RecipeSelected = () => {

    const { recipeId } = useParams();

    const dispatch = useAppDispatch();

    const recipeData = useAppSelector(getCurrentRecipe);

    useEffect(() => {
        if (recipeId !== undefined)
            dispatch(fetchSingleRecipe(recipeId));
    }, [dispatch, recipeId]);

    return (
        <>
            <Box display="flex" flexDirection="column" height="100vh">
                <RecipeAppBar />
                <Grid container spacing={2} direction="row" flexWrap="nowrap" justifyContent="center" alignItems="center" width="100%" height="100%" margin="0px">
                    <Grid item xs={12} md={3} height="100%">
                        <Box display="flex" flexDirection="column" height="100%">
                            <Box display="flex" flexDirection="row" height="25vh">
                                <Typography>Recipe</Typography>
                            </Box>
                            <Box textAlign="center">
                                {recipeData ? (
                                    <List>
                                        {
                                            recipeData.ingredients.map((ingredient) => {
                                                return (
                                                    <ListItem key={ingredient}>
                                                        <ListItemText primary={ingredient} />
                                                    </ListItem>)
                                            })
                                        }
                                    </List>
                                ) : (<LinearProgress />)}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid container xs={12} md={2} height="100%" alignItems="center" justifyContent="center">
                        <RecipeStats minutesNeeded={recipeData ? recipeData.minutesNeeded : NaN} difficulty={recipeData ? recipeData.difficulty : "?"} likes={recipeData ? recipeData.likes : NaN} views={recipeData ? recipeData.views : NaN} />
                    </Grid>
                    <Grid item xs={12} md={7} justifyContent="center" alignItems="center" marginRight="25px">
                        <Box display="flex" flexDirection="column" height="100%" overflow="hidden" >
                            <Box height="50vh">
                                <img src="/ricettabase" alt={recipeData?.title} />
                            </Box>
                            <Box border="2px solid brown" padding="20px" borderRadius="17px" sx={{ backgroundColor: "#FFF7EE", overflowY: "auto" }}>
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