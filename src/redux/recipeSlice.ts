import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { RecipeState } from './storetypes';
import { fetchLogout, fetchRecipesBatch, fetchSearchResults, fetchSingleRecipe, fetchTotalNumberOfPagesInHome, fetchUserData } from './thunks';


const initialState: RecipeState = {
    loggedUser: null,
    selectedUserData: null,
    recipesDisplayed: [],
    recipesPerPage: 3,
    numberOfPages: 1,
    currentRecipe: null,
    searchResults: null
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
            .addCase(fetchTotalNumberOfPagesInHome.pending, () => {
                console.log("Promise fetchTotalNumberOfPagesInHome is pending.");
            })
            .addCase(fetchTotalNumberOfPagesInHome.rejected, (_, action) => {
                console.error("Promise fetchTotalNumberOfPagesInHome was rejected with error: ", action.payload);
            })
            .addCase(fetchTotalNumberOfPagesInHome.fulfilled, (state, action) => {
                // console.log("Retrieved total number of pages for Home component (Promise fulfilled).");
                state.numberOfPages = action.payload;
            })
            .addCase(fetchRecipesBatch.pending, () => {
                console.log("Promise fetchRecipesBatch is pending.");
            })
            .addCase(fetchRecipesBatch.rejected, (_, action) => {
                console.error("Promise fetchRecipesBatch was rejected with error: ", action.payload);
            })
            .addCase(fetchRecipesBatch.fulfilled, (state, action) => {
                console.log("Retrieved requested batch of recipes (Promise fulfilled).");
                state.recipesDisplayed = action.payload;
            })
            .addCase(fetchSingleRecipe.pending, () => {
                console.log("Promise fetchSingleRecipe is pending.");
            })
            .addCase(fetchSingleRecipe.rejected, (_, action) => {
                console.error("Promise fetchSingleRecipe was rejected with error: ", action.payload);
            })
            .addCase(fetchSingleRecipe.fulfilled, (state, action) => {
                console.log("Retrieved requested batch of recipes (Promise fulfilled).");
                state.currentRecipe = action.payload;
            })
            .addCase(fetchSearchResults.pending, () => {
                console.log("Promise fetchSearchResults is pending.");
            })
            .addCase(fetchSearchResults.rejected, (_, action) => {
                console.error("Promise fetchSearchResults was rejected with error: ", action.payload);
            })
            .addCase(fetchSearchResults.fulfilled, (state, action) => {
                console.log("Retrieved search results (Promise fulfilled).");
                state.searchResults = action.payload;
            })
            .addCase(fetchUserData.pending, () => {
                console.log("Promise fetchUserData is pending.");
            })
            .addCase(fetchUserData.rejected, (_, action) => {
                console.error("Promise fetchUserData was rejected with error: ", action.payload);
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                console.log("Retrieved user data (Promise fulfilled).");
                state.selectedUserData = action.payload;
            })
            .addCase(fetchLogout.rejected, (_, action) => {
                console.error("An error occurred while logging out: ", action.payload);
            })
            .addCase(fetchLogout.fulfilled, (state, action) => {
                console.log("Logout was successful.");
                state.loggedUser = action.payload;
            })/*
            .addCase(fetchUserRecipes.pending, () => {
                console.log("Promise fetchUserRecipes is pending.");
            })
            .addCase(fetchUserRecipes.rejected, (_, action) => {
                console.error("Promise fetchUserRecipes was rejected with error: ", action.payload);
            })
            .addCase(fetchUserRecipes.fulfilled, (state, action) => {
                console.log("Retrieved user's recipes (Promise fulfilled).");
                state.selectedUserData = action.payload;
            })*/

    }
})

export const getLoggedUser = (state: RootState) => state.recipe.loggedUser;
export const getUserData = (state: RootState) => state.recipe.selectedUserData;
export const getRecipesDisplayed = (state: RootState) => state.recipe.recipesDisplayed;
export const getNumberOfRecipesToDisplayInHome = (state: RootState) => state.recipe.recipesPerPage;
export const getNumberOfPagesInHome = (state: RootState) => state.recipe.numberOfPages;
export const getCurrentRecipe = (state: RootState) => state.recipe.currentRecipe;
export const getSearchResults = (state: RootState) => state.recipe.searchResults;

export const { setUser } = recipeSlice.actions;


export default recipeSlice.reducer;
