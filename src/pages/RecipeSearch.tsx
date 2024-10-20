import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSearchResults } from "../redux/thunks";
import { getSearchResults } from "../redux/recipeSlice";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Box, Grid, Typography } from "@mui/material";
import { RecipeItem } from "../components/RecipesList";

export const RecipeSearch = () => {

    const [searchParams] = useSearchParams();
    const term = searchParams.get('term');

    const dispatch = useAppDispatch();

    const searchResults = useAppSelector(getSearchResults);

    useEffect(() => {
        if (term)
            dispatch(fetchSearchResults(term));
    }, [dispatch, term]);

    return (
        <>
            <RecipeAppBar />
            <Typography variant="h1">Search results:</Typography>
            {searchResults ? (
                <>
                    <Box>
                        <Typography>Search results:</Typography>
                    </Box>
                    <Grid container>
                        {
                            searchResults.map((recipeSearched) => {
                                return (
                                    <Grid item xs={3}>
                                        <RecipeItem recipe={recipeSearched} />
                                    </Grid>
                                )
                            })
                        }
                    </Grid>
                </>
            ) : (
                <>
                    <Typography variant='h2'>No items match your search.</Typography>
                </>
            )
            }
        </>)

}