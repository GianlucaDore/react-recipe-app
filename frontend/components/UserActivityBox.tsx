import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { getLoggedUser, getUserData } from '../redux/recipeSlice'
import { useGetRecipeItemsQuery, useGetSelectedUserBatchQuery, useGetSelectedUserRecipeArraysQuery } from '../redux/apiSlice'
import { skipToken } from '@reduxjs/toolkit/query'
import { useAppSelector } from '../redux/hooks'
import { Recipe } from '../redux/storetypes'

import { RecipeItem } from './RecipesList'

import { Box, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { PostAdd } from '@mui/icons-material'

import { colors } from '../utils/theme'


export const UserActivityBox = () => {
    const [tabMode, setTabMode] = useState<'Recipes' | 'Likes'>('Recipes');
    const [recipeItems, setRecipeItems] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);

    const pageSize = 10;

    const { userId } = useParams();
    
    const { data: dataArrays, error: errorArrays, isLoading: isLoadingArrays } = useGetSelectedUserRecipeArraysQuery(userId ? { userId } : skipToken);
    
    const batchIds = useMemo(() => {
        if (!dataArrays) return [];
        if (tabMode === 'Recipes') return dataArrays.recipes.slice(page*pageSize, page*pageSize+pageSize);
        else return dataArrays.recipesLiked.slice(page*pageSize, page*pageSize+pageSize);
    }, [dataArrays, tabMode, page]);
    
    const { data: dataBatch, error: errorbatch, isLoading: isLoadingBatch } = useGetSelectedUserBatchQuery(batchIds.length ? { batchIds } : skipToken);

    const navigate = useNavigate();

    const userData = useAppSelector(getUserData);
    const loggedUser = useAppSelector(getLoggedUser);

    const { data: recipeItemsFetched, isLoading } = useGetRecipeItemsQuery(
        userData?.uid ? { type: tabMode, chefId: userData.uid } : skipToken
    );

    useEffect(() => {
        setLoading(isLoading);
        setRecipeItems(recipeItemsFetched ?? []);
    }, [isLoading, recipeItemsFetched]);


    const handleAddNewRecipe = () => {
        navigate('/add-recipe')
    }

    const handleTabModeChange = (_: React.MouseEvent<HTMLElement>, eventValue: 'Recipes' | 'Likes' | null) => {
        if (eventValue) {
            setTabMode(eventValue);
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
                display="flex" flexDirection="row" flexWrap="wrap" width="100%" minHeight="234px"
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
