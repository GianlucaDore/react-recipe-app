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
    const { pageNumber, setPageNumber } = props.pageState;

    const numberOfPages = useAppSelector(getNumberOfPagesInHome);
    const recipesToDisplay = useAppSelector(getRecipesDisplayed);


    const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
        event.preventDefault();
        setPageNumber(page);
    }


    return (
        <>
            <Grid item xs={12} sm={12} md={4}>
                <RecipeItem recipe={recipesToDisplay[0]} />
            </Grid>
            <Grid item xs={12} sm={12} md={4} marginTop={{xs: "15px", sm: "30px", md: "0px"}}>
                <RecipeItem recipe={recipesToDisplay[1]} />
            </Grid>
            <Grid item xs={12} sm={12} md={4} marginTop={{xs: "15px", sm: "30px", md: "0px"}}>
                <RecipeItem recipe={recipesToDisplay[2]} />
            </Grid>
            <Stack spacing={2} marginTop="15px">
                <Pagination count={numberOfPages} page={pageNumber} onChange={handleChange} color="primary" />
            </Stack>
        </>
    )
}


export interface RecipeItemProps {
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
            <Card sx={{ width: "90%", height: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", '&:hover': { transform: "scale(1.05)" } }}>
                <CardActionArea onClick={handleRecipeItemClick} sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    {recipe ? (
                        <CardMedia component="img" image={recipe.imageURL} alt={recipe.title} sx={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }} />
                    ) : (
                        <CircularProgress />
                    )}
                    <CardContent sx={{ width: "100%", position: "absolute", bottom: 0, right: 0, zIndex: 2, marginTop: "auto", textAlign: "right" }}>
                        {recipe ? (
                            <Typography gutterBottom variant="h5" component="div" sx={{ width: 'fit-content', marginLeft: 'auto', backgroundColor: '#4e342e', borderRadius: '15px', color: '#fff5e1', padding: '2px 12px 2px 12px'}}>
                                {recipe.title}
                            </Typography>
                        ) : (
                            <Skeleton variant="text" sx={{ fontSize: '3rem', borderRadius: '15px', marginLeft: 'auto', width: {xs: '100%', sm: '75%', md: '50%', lg: '40%'} }} />
                        )}
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    )
}