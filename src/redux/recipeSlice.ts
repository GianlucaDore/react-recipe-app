import { createSlice } from '@reduxjs/toolkit'
// import { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface RecipeState {
    value: number
}

const initialState: RecipeState = {
    value: 0,
}

export const recipeSlice = createSlice({
    name: 'recipe',
    initialState,
    reducers: {},
})

export const {} = recipeSlice.actions

export const getState = (state: RootState) => state.recipe.value

export default recipeSlice.reducer
