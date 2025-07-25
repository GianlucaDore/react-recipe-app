import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { RecipeState } from './storetypes';
import { fetchLogout, fetchRecipeOfTheDay, fetchRecipesBatch, fetchSingleRecipe, fetchTotalNumberOfPagesInHome, fetchUserData } from './thunks';


const initialState: RecipeState = {
    loggedUser: null,
    selectedUserData: null,
    recipesDisplayed: [],
    recipesPerPage: 3,
    numberOfPages: 1,
    currentRecipe: null,
    recipeOfTheDay: null
}

export const recipeSlice = createSlice({
    name: 'recipe',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.loggedUser = action.payload;
        },
        setUserImage: (state, action) => {
            state.selectedUserData!.photoURL = action.payload;
            if (state.selectedUserData!.uid === state.loggedUser?.uid) {
                state.loggedUser.photoURL = action.payload;
            }
        },
        setRecipeLikedBy: (state, action) => {
            state.currentRecipe!.likedBy = action.payload;
        },
        setRecipeLikes: (state, action) => {
            state.currentRecipe!.likes = action.payload;
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
export const getRecipeOfTheDay = (state: RootState) => state.recipe.recipeOfTheDay;
export const getRecipesDisplayed = (state: RootState) => state.recipe.recipesDisplayed;
export const getNumberOfRecipesToDisplayInHome = (state: RootState) => state.recipe.recipesPerPage;
export const getNumberOfPagesInHome = (state: RootState) => state.recipe.numberOfPages;
export const getCurrentRecipe = (state: RootState) => state.recipe.currentRecipe;

export const { setUser, setUserImage, setRecipeLikedBy, setRecipeLikes } = recipeSlice.actions;


export default recipeSlice.reducer;
