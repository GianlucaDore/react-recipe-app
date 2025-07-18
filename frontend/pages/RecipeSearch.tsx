import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { RecipeItem } from "../components/RecipesList";
import InfiniteScroll from "react-infinite-scroll-component";
import { colors } from "../utils/theme";
import { Recipe } from "../redux/storetypes";
import { fetchSearchResultsBatch } from "../utils/DEPRECATED_apicalls";

export const RecipeSearch = () => {

    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);

    const [searchParams] = useSearchParams();
    const term = searchParams.get('term');


    const fetchMoreSearchResults = useCallback(async () => {
        const newSearchData = await fetchSearchResultsBatch(term, page);
        setSearchResults((prevState) => [...prevState, ...newSearchData]);
        setPage(prevState => prevState + 1);
        if (newSearchData.length < 15 || newSearchData.length === 0) {
            setHasMore(false);
        }
    },[page, term]);


    useEffect(() => {
        if (term)
            fetchMoreSearchResults();
    }, [fetchMoreSearchResults, term]);
    

    return (
        <>
            <RecipeAppBar />
            <Typography variant="h1">Search results:</Typography>
            {(searchResults && searchResults.length > 0) ? (
                <>
                    <Box>
                        <Typography>Search results:</Typography>
                    </Box>
                    <Grid container width="90vw">
                        <InfiniteScroll
                            height="70vh"
                            dataLength={searchResults.length}
                            next={fetchMoreSearchResults}
                            hasMore={hasMore}
                            loader={<CircularProgress size="2rem" sx={{ color: colors.primary }} />}
                            endMessage={<Typography component="p" textAlign="center" marginTop="30px" fontSize="smaller">No more items to show.</Typography>}
                        >
                            {searchResults.map((recipeSearched) => {
                                return (
                                    <Grid item xs={3} key={recipeSearched.id}>
                                        <RecipeItem recipe={recipeSearched} />
                                    </Grid>
                                )
                             })
                            }
                        </InfiniteScroll>
                    </Grid>
                </>
            ) : (<Typography variant='h2'>No items match your search.</Typography>)
            }
        </>
    );
}