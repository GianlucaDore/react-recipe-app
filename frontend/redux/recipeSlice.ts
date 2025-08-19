import { createSlice } from '@reduxjs/toolkit'

import { fetchLogout, fetchRecipeOfTheDay, fetchRecipesBatch, fetchTotalNumberOfPagesInHome } from './thunks';
import { RecipeState } from './storetypes';
import { RootState } from './store';


const initialState: RecipeState = {
    loggedUser: null,
    recipesDisplayed: [],
    recipesPerPage: 3,
    numberOfPages: 1,
    recipeOfTheDay: null
}

export const recipeSlice = createSlice({
    name: 'recipe',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.loggedUser = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecipeOfTheDay.pending, () => {
                console.log("Promise fetchRecipeOfTheDay is pending.");
            })
            .addCase(fetchRecipeOfTheDay.rejected, (_, action) => {
                console.error("Promise fetchRecipeOfTheDay was rejected with error: ", action.payload);
            })
            .addCase(fetchRecipeOfTheDay.fulfilled, (state, action) => {
                state.recipeOfTheDay = action.payload;
            })
            .addCase(fetchTotalNumberOfPagesInHome.pending, () => {
                console.log("Promise fetchTotalNumberOfPagesInHome is pending.");
            })
            .addCase(fetchTotalNumberOfPagesInHome.rejected, (_, action) => {
                console.error("Promise fetchTotalNumberOfPagesInHome was rejected with error: ", action.payload);
            })
            .addCase(fetchTotalNumberOfPagesInHome.fulfilled, (state, action) => {
                state.numberOfPages = action.payload;
            })
            .addCase(fetchRecipesBatch.pending, (state) => {
                console.log("Promise fetchRecipesBatch is pending.");
                state.recipesDisplayed = [];
            })
            .addCase(fetchRecipesBatch.rejected, (_, action) => {
                console.error("Promise fetchRecipesBatch was rejected with error: ", action.payload);
            })
            .addCase(fetchRecipesBatch.fulfilled, (state, action) => {
                console.log("Retrieved requested batch of recipes (Promise fulfilled).");
                state.recipesDisplayed = action.payload;
            })
            .addCase(fetchLogout.rejected, (_, action) => {
                console.error("An error occurred while logging out: ", action.payload);
            })
            .addCase(fetchLogout.fulfilled, (state, action) => {
                console.log("Logout was successful.");
                state.loggedUser = action.payload;
            })
    }
})


export const getLoggedUser = (state: RootState): typeof state.recipe.loggedUser => state.recipe.loggedUser;
export const getRecipeOfTheDay = (state: RootState): typeof state.recipe.recipeOfTheDay => state.recipe.recipeOfTheDay;
export const getRecipesDisplayed = (state: RootState): typeof state.recipe.recipesDisplayed => state.recipe.recipesDisplayed;
export const getNumberOfRecipesToDisplayInHome = (state: RootState): typeof state.recipe.recipesPerPage => state.recipe.recipesPerPage;
export const getNumberOfPagesInHome = (state: RootState): typeof state.recipe.numberOfPages => state.recipe.numberOfPages;

export const { setUser } = recipeSlice.actions;


export default recipeSlice.reducer;
