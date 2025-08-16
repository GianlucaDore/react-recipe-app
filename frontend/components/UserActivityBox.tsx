import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { getLoggedUser } from '../redux/recipeSlice'
import { useGetSelectedUserBatchQuery, useGetSelectedUserRecipeArraysQuery } from '../redux/apiSlice'
import { skipToken } from '@reduxjs/toolkit/query'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { Recipe } from '../redux/storetypes'

import { RecipeItem } from './RecipesList'

import { Box, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { PostAdd } from '@mui/icons-material'

import { colors } from '../utils/theme'
import InfiniteScroll from 'react-infinite-scroll-component'


export const UserActivityBox = () => {
    const [tabMode, setTabMode] = useState<'Recipes' | 'Likes'>('Recipes');
    const [recipeItems, setRecipeItems] = useState<Recipe[]>([]);
    const [page, setPage] = useState<number>(0);

    const pageSize = 10;

    const { userId } = useParams();
    
    const { data: dataArrays, error: errorArrays, isLoading: isLoadingArrays } = useGetSelectedUserRecipeArraysQuery(userId ? { userId } : skipToken);
    
    const batchIds = useMemo(() => {
        if (!dataArrays) return [];
        if (tabMode === 'Recipes') return dataArrays.recipes.slice(page*pageSize, page*pageSize+pageSize);
        else return dataArrays.recipesLiked.slice(page*pageSize, page*pageSize+pageSize);
    }, [dataArrays, tabMode, page, pageSize]);
    
    const totalIds = useMemo(() => {
        const created = dataArrays?.recipes ?? [];
        const liked   = dataArrays?.recipesLiked ?? [];
        return tabMode === 'Recipes' ? created : liked;
    }, [dataArrays, tabMode]);
    
    const { data: dataBatch, error: errorBatch, isLoading: isLoadingBatch } = useGetSelectedUserBatchQuery(batchIds.length ? { batchIds } : skipToken);

    const fetchMoreData = useCallback(async () => {
        setPage(prevState => prevState + 1);
    },[page]);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const loggedUser = useAppSelector(getLoggedUser);

    useEffect(() => {
        if (dataBatch) {
            if (page === 0) setRecipeItems(dataBatch);
            else setRecipeItems(prevState => [...prevState, ...dataBatch]);
        }
    }, [dataBatch]);


    const handleAddNewRecipe = () => {
        navigate('/add-recipe');
    }

    const handleTabModeChange = (_: React.MouseEvent<HTMLElement>, eventValue: 'Recipes' | 'Likes' | null) => {
        if (eventValue) {
            setPage(0);
            setRecipeItems([]);
            setTabMode(eventValue);
        }
    };


    const hasMore = !isLoadingArrays && !isLoadingBatch && (recipeItems.length < totalIds.length);

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
                    <Grid container width="100%" direction="row"  justifyContent={isLoadingArrays || isLoadingBatch ? "center" : "flex-start"}>
                        {userId === loggedUser?.uid && !isLoadingArrays && (
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
                        {isLoadingArrays || isLoadingBatch ? (
                            <Grid item container xs={12} justifyContent="center" alignItems="center">
                                <CircularProgress size="5rem" sx={{ color: colors.primary }} />
                            </Grid>
                        ) : (
                            <InfiniteScroll
                                dataLength={recipeItems.length}
                                next={fetchMoreData}
                                hasMore={hasMore}
                                loader={<CircularProgress size="2rem" sx={{ color: colors.primary }} />}
                                endMessage={null}
                            >
                                {
                                    recipeItems.map((r) => (
                                        <Grid item xs={4} key={r.id}>
                                            <RecipeItem recipe={r} />
                                        </Grid>
                                    ))
                                }
                            </InfiniteScroll>
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    )
}
