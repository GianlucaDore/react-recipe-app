import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { Recipe, UserInfo } from './storetypes';
import { fetchRecipes, fetchRecipesBatch } from './thunks';

interface RecipeState {
    user: UserInfo | null;
    recipesDisplayed: Array<Recipe> | null;
}

const initialState: RecipeState = {
    user: null,
    recipesDisplayed: null
}

export const recipeSlice = createSlice({
    name: 'recipe',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecipes.pending, () => {
                console.log("Promise fetchRecipes is pending.");
            })
            .addCase(fetchRecipes.rejected, (_, action) => {
                console.error("Promise fetchRecipes was rejected with error: ", action.payload);
            })
            .addCase(fetchRecipes.fulfilled, (state, action) => {
                console.log("Retrieved recipes (Promise fulfilled).");
                state.recipesDisplayed = action.payload;
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

    }
})


export const getUser = (state: RootState) => state.recipe.user;
export const getRecipesDisplayed = (state: RootState) => state.recipe.recipesDisplayed;


export const { setUser } = recipeSlice.actions;


export default recipeSlice.reducer;
