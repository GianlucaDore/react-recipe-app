import { Box, Grid, Typography } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { getUserData } from "../redux/recipeSlice";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchUserData } from "../redux/thunks";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { UserStats } from "../components/UserStats";
import { RecipeItem } from "../components/RecipesList";
import AddBoxIcon from '@mui/icons-material/AddBox';

export const UserProfile = () => {

    const { userId } = useParams();

    const dispatch = useAppDispatch();

    const userData = useAppSelector(getUserData);

    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserData(userId));
        }
    }, [dispatch, userId]);

    const handleAddNewRecipe = () => {
        navigate("/add-recipe");
    }

    return (
        <>
            <RecipeAppBar />
            {userData ? (
                <>
                    <Box>
                        <Box flexDirection="column" flexWrap="nowrap" alignItems="center">
                            <img src="/profilepic" alt="Profile picture" />
                            <Typography variant="h2">{userData.displayName}</Typography>
                            <Typography variant="h3">{userData.email}</Typography>
                        </Box>
                        <Box flexDirection="row" flexWrap="nowrap">
                            <UserStats likesReceived={userData.likesReceived} totalViews={userData.totalViews} publishedRecipes={userData.publishedRecipes} />
                        </Box>
                        <Box flexDirection="column" alignItems="center">
                            <AddBoxIcon onClick={handleAddNewRecipe}>Create a new recipe</AddBoxIcon>
                            <Grid container spacing={2}>
                                {userData.recipes.map((recipe) => { return (
                                    <Grid item xs={4}>
                                        <RecipeItem recipe={recipe} />
                                    </Grid>
                                )})}
                            </Grid>
                        </Box>         
                    </Box>  
                </>
            ) : (null)}
        </>)
}