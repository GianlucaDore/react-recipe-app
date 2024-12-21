import { Box, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { RecipeItem } from './RecipesList'
import { useAppSelector } from '../redux/hooks'
import { getLoggedUser, getUserData } from '../redux/recipeSlice'
import { retrieveRecipeItems } from '../utils/apicalls'
import { Recipe } from '../redux/storetypes'
import { colors } from '../utils/theme'
import { PostAdd } from '@mui/icons-material'

export const UserActivityBox = () => {
    const [tabMode, setTabMode] = useState<string>('Recipes')
    const [recipeItems, setRecipeItems] = useState<Recipe[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const navigate = useNavigate()

    const userData = useAppSelector(getUserData)
    const loggedUser = useAppSelector(getLoggedUser)

    const fetchRecipeItems = useCallback(async (type: string, userId: string) => {
        setLoading(true);
        try {
            const recipeItemsFetched = await retrieveRecipeItems(type, userId);
            setRecipeItems(recipeItemsFetched);
        } catch (error) {
            console.error('Error fetching chef data: ', error);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        if (userData?.uid) {
            fetchRecipeItems(tabMode, userData.uid);
        }
    }, [tabMode, userData?.uid, fetchRecipeItems]);


    const handleAddNewRecipe = () => {
        navigate('/add-recipe')
    }

    const handleTabModeChange = async (_: React.MouseEvent<HTMLElement>, eventValue: string | null) => {
        if (eventValue) {
            setTabMode(eventValue);
            if (userData?.uid) {
                await fetchRecipeItems(eventValue, userData.uid);
            }
        }
    };


    return (
        <Box alignSelf="center" width="90%">
            <ToggleButtonGroup
                exclusive
                value={tabMode}
                onChange={handleTabModeChange}
                aria-label="Select mode"
                sx={{ marginLeft: '15px' }}
            >
                <ToggleButton
                    value="Recipes"
                    selected={tabMode === 'Recipes'}
                    sx={{
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px',
                        borderBottomLeftRadius: '0',
                        backgroundColor:
                            tabMode === 'Recipes' ? "#4E342E" + " !important" : 'inherit',
                        color:
                            tabMode === 'Recipes'
                                ? 'white' + " !important" : 'inherit',
                    }}
                >
                    <Typography variant="h6">Recipes</Typography>
                </ToggleButton>
                <ToggleButton
                    value="Likes"
                    selected={tabMode === 'Likes'}
                    sx={{
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px',
                        borderBottomRightRadius: '0',
                        backgroundColor:
                            tabMode === 'Likes' ? colors.likePrimary + " !important" : 'inherit',
                        color:
                            tabMode === 'Likes'
                                ? 'white' + " !important": 'inherit',
                    }}
                >
                    <Typography variant="h6">Likes</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
            <Box
                display="flex" flexDirection="row" flexWrap="wrap" width="100%" minHeight="200px"
                padding="15px"
                border="2px solid #4e342e"
                borderRadius="15px"
                sx={{ backgroundColor: '#FFF7EE' }}
            >
                {tabMode === 'Recipes' && (
                    <Grid container width="100%" direction="row"  justifyContent={loading ? "center" : "flex-start"}>
                        {userData && userData?.uid === loggedUser?.uid && (
                                <Grid item container xs={4} justifyContent="center" alignItems="center">
                                    <Button 
                                        onClick={handleAddNewRecipe}
                                        sx={{display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center"}}
                                    >
                                        <PostAdd />
                                        <Box marginTop="3px">
                                            Create new recipe
                                        </Box>
                                    </Button>
                                </Grid>
                        )}
                        {loading ? (
                            <>
                                <Grid item container xs={4} justifyContent="center" alignItems="center">
                                    <CircularProgress size="5rem" sx={{ color: colors.primary }} />
                                </Grid>
                                <Grid item container xs={4} />
                            </>
                        ) : (
                            recipeItems.map((r) => (
                                <Grid item xs={4} key={r.id}>
                                    <RecipeItem recipe={r} />
                                </Grid>
                            ))
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    )
}
