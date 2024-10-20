import { Box, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Grid, Pagination, Skeleton, Stack, Typography } from "@mui/material";
import { useAppSelector } from "../redux/hooks";
import { getNumberOfPagesInHome, getRecipesDisplayed } from "../redux/recipeSlice";
import { Recipe } from "../redux/storetypes";
import { useNavigate } from "react-router";

interface RecipesListPropsObject {
    pageNumber: number;
    setPageNumber: React.Dispatch<React.SetStateAction<number>>;
}
interface RecipesListProps {
    pageState: RecipesListPropsObject;
}

export const RecipesList = (props: RecipesListProps) => {
    const { pageNumber, setPageNumber
    } = props.pageState;

    const numberOfPages = useAppSelector(getNumberOfPagesInHome);
    const recipesToDisplay = useAppSelector(getRecipesDisplayed);


    const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
        event.preventDefault();
        setPageNumber(page);
    }


    return (
        <>
            <Grid item xs={4}>
                <RecipeItem recipe={recipesToDisplay[0]} />
            </Grid>
            <Grid item xs={4}>
                <RecipeItem recipe={recipesToDisplay[1]} />
            </Grid>
            <Grid item xs={4}>
                <RecipeItem recipe={recipesToDisplay[2]} />
            </Grid>
            <Stack spacing={2} marginTop="15px">
                <Pagination count={numberOfPages} page={pageNumber} onChange={handleChange} color="primary" />
            </Stack>
        </>
    )
}


interface RecipeItemProps {
    recipe: Recipe
}

export const RecipeItem = (props: RecipeItemProps) => {
    const { recipe } = props;

    const navigate = useNavigate();

    const handleRecipeItemClick = () => {
        navigate(`/recipe/${recipe.id}`);
    }

    return (
        <Box display="flex" justifyContent="center">
            <Card sx={{ width: "90%", height: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <CardActionArea onClick={handleRecipeItemClick} sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    {recipe ? (
                        <CardMedia component="img" height="140" image="./recipeplaceholder" alt="recipe placeholder" />
                    ) : (
                        <CircularProgress sx={{ marginTop: "auto" }} />
                    )}
                    <CardContent sx={{ width: "100%", marginTop: "auto", textAlign: "right" }}>
                        {recipe ? (
                            <Typography gutterBottom variant="h5" component="div">
                                {recipe.title}
                            </Typography>
                        ) : (
                            <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                        )}
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    )
}