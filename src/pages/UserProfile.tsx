import { Avatar, Box, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { getUserData } from "../redux/recipeSlice";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchUserData } from "../redux/thunks";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { UserStats } from "../components/UserStats";
import { RecipeItem } from "../components/RecipesList";
import AddBoxIcon from '@mui/icons-material/AddBox';
import defaultChef from '../assets/default_chef.jpeg';

export const UserProfile = () => {

    const [tabMode, setTabMode] = useState<string>("recipes");

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

    const handleTabModeChange = (_: React.MouseEvent<HTMLElement>, eventValue: string | null) => {
        if (eventValue) {
            setTabMode(eventValue);
        }
    }

    return (
        <>
            <RecipeAppBar />
            {userData && (
                <Box width="100%" marginTop="30px" display="flex" flexDirection="column" justifyContent="center" rowGap="50px">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar 
                            src={(userData.photoURL) ? userData.photoURL : defaultChef} 
                            alt={(userData.displayName) ? userData.displayName : "Generic chef"}
                            sx={{ width: 120, height: 120 }}
                        />
                        <Typography variant="h3">{userData.displayName}</Typography>
                        <Typography variant="h6">{userData.email}</Typography>
                    </Box>
                    <Box>
                        <UserStats 
                            likesReceived={userData.likesReceived} 
                            totalViews={userData.totalViews} 
                            publishedRecipes={userData.publishedRecipes} 
                        />
                    </Box>
                    <Box alignSelf="center" width="90%">
                        <ToggleButtonGroup
                            exclusive 
                            value={tabMode}
                            onChange={handleTabModeChange} 
                            aria-label="Select mode"
                            sx={{ marginLeft: "15px" }}
                        >
                            <ToggleButton 
                                value="recipes" 
                                selected={tabMode === "recipes"}
                                sx={{ 
                                    borderTopLeftRadius: "15px", 
                                    borderTopRightRadius: "15px", 
                                    borderBottomLeftRadius: "0",
                                    backgroundColor: tabMode === "recipes" ? 'primary.main' : 'inherit',
                                    color: tabMode === "recipes" ? 'primary.contrastText' : 'inherit'
                                }}
                            >
                                <Typography variant="h6">Recipes</Typography>
                            </ToggleButton>
                            <ToggleButton 
                                value="likes" 
                                selected={tabMode === "likes"}
                                sx={{ 
                                    borderTopLeftRadius: "15px", 
                                    borderTopRightRadius: "15px", 
                                    borderBottomRightRadius: "0",
                                    backgroundColor: tabMode === "likes" ? 'secondary.main' : 'inherit',
                                    color: tabMode === "likes" ? 'secondary.contrastText' : 'inherit'
                                }}
                            >
                                <Typography variant="h6">Likes</Typography>
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Box border="2px solid #4e342e" borderRadius="15px" sx={{ backgroundColor: "#FFF7EE" }}>
                            <Grid container spacing={2}>
                                {tabMode === "recipes" && (
                                    <>
                                        {userData.uid === userId && (
                                            <Grid item xs={12}>
                                                <AddBoxIcon onClick={handleAddNewRecipe}>
                                                    Create a new recipe
                                                </AddBoxIcon>
                                            </Grid>
                                        )}
                                        {userData.recipes.map((recipe) => (
                                            <Grid item xs={4} key={recipe.id}>
                                                <RecipeItem recipe={recipe} />
                                            </Grid>
                                        ))}
                                    </>
                                )}
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    );
}