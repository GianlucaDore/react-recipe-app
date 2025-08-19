import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import InfiniteScroll from 'react-infinite-scroll-component'

import { getLoggedUser } from '../redux/recipeSlice'
import { useGetSelectedUserBatchQuery, useGetSelectedUserRecipeArraysQuery } from '../redux/apiSlice'
import { skipToken } from '@reduxjs/toolkit/query'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { Recipe } from '../redux/storetypes'

import { RecipeItem } from './RecipesList'

import { Box, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { PostAdd } from '@mui/icons-material'

import { colors } from '../utils/theme'
import { showSnackbarError } from '../utils/helpers'


export const UserActivityBox = () => {

    const [tabMode, setTabMode] = useState<'Recipes' | 'Likes'>('Recipes');
    const [recipeItems, setRecipeItems] = useState<Recipe[]>([]);
    const [page, setPage] = useState<number>(0);

    const pageSize = 8;

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

    useEffect(() => {
        const err = errorArrays ?? errorBatch;
        if (err) {
            showSnackbarError(dispatch, err);
        }
    }, [errorArrays, errorBatch])


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
                    selected={tabMode === 'Recipes' && !isLoadingArrays}
                    disabled={isLoadingArrays}
                    sx={{
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px',
                        borderBottomLeftRadius: '0',
                        backgroundColor:
                            tabMode === 'Recipes' && !isLoadingArrays
                                ? "#4E342E" + " !important" : 'inherit',
                        color:
                            tabMode === 'Recipes' && !isLoadingArrays
                                ? 'white' + " !important" : 'inherit',
                    }}
                >
                    <Typography variant="h6">Recipes</Typography>
                </ToggleButton>
                <ToggleButton
                    value="Likes"
                    selected={tabMode === 'Likes' && !isLoadingArrays}
                    disabled={isLoadingArrays}
                    sx={{
                        borderTopLeftRadius: '15px',
                        borderTopRightRadius: '15px',
                        borderBottomRightRadius: '0',
                        backgroundColor:
                            tabMode === 'Likes' && !isLoadingArrays
                                ? colors.likePrimary + " !important" : 'inherit',
                        color:
                            tabMode === 'Likes' && !isLoadingArrays
                                ? 'white' + " !important": 'inherit',
                    }}
                >
                    <Typography variant="h6">Likes</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
            <Box
                id="scrollable_box"
                display="flex" flexDirection="row" flexWrap="wrap" width="100%" height={recipeItems.length > 0 ? "350px" : "245px"}
                padding="15px"            
                borderRadius="15px"
                overflow="auto"
                sx={{ backgroundColor: '#FFF7EE', outline: '2px solid #4e342e', outlineOffset: 0, '&::-webkit-scrollbar-track': { background: 'transparent' } }}
            > 
                {
                    <Grid container width="100%" direction="row" justifyContent={isLoadingArrays || isLoadingBatch ? "center" : "flex-start"}>
                        {isLoadingArrays || isLoadingBatch  ? (
                            <Grid item container xs={12} justifyContent="center" alignItems="center">
                                <CircularProgress size="5rem" sx={{ color: colors.primary }} />
                            </Grid>
                        ) : (
                            <Grid item container xs={12} direction="row" alignItems="center" sx={{ '& > .infinite-scroll-component__outerdiv': { width: '100%' } }}>
                                <InfiniteScroll
                                    scrollableTarget="scrollable_box"
                                    dataLength={recipeItems.length}
                                    next={fetchMoreData}
                                    hasMore={hasMore}
                                    loader={<CircularProgress size="5rem" sx={{ color: colors.primary, marginTop: "10px", marginLeft: "auto", marginRight: "auto" }} />}
                                    endMessage={recipeItems.length > 0 && <Typography textAlign="center" fontSize="0.9rem" marginTop="20px">No more items to show.</Typography>}
                                    style={{ width: "100%", display: "flex", flexDirection: "column", alignContent: "center", overflow: "hidden" }}
                                >
                                    <Grid item container xs={12} rowGap="20px">
                                        {userId === loggedUser?.uid && !isLoadingArrays && tabMode === 'Recipes' && (
                                            <Grid item container xs={12} md={4} xl={3} justifyContent="center" alignItems="center">
                                                <Button 
                                                    onClick={handleAddNewRecipe}
                                                    sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center"}}
                                                >
                                                    <PostAdd />
                                                    <Box marginTop="3px">
                                                        Create new recipe
                                                    </Box>
                                                </Button>
                                            </Grid>)
                                        }
                                        {recipeItems.map((r) => (
                                            <Grid container item xs={12} md={4} xl={3} key={r.id} justifyContent="center" alignItems="center" paddingTop="5px">
                                                <RecipeItem recipe={r} />
                                            </Grid>
                                            ))
                                        }
                                        </Grid>
                                </InfiniteScroll>
                            </Grid>
                        )}
                    </Grid>
                }
            </Box>
        </Box>
    )
}
