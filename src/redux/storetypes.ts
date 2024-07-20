import firebase from "firebase/compat/app";

export type User = firebase.User;

export type UserInfo = Pick<User, 'uid'|'displayName'|'email'|'emailVerified'|'phoneNumber'|'photoURL'>

export interface UserData extends UserInfo {
    likesReceived: number;
    totalViews: number;
    publishedRecipes: number;
    recipes: Array<Recipe>;
}

export interface Recipe {
    id: number;
    title: string;
}

export type Difficulty = ("Easy" | "Medium" | "Hard" | "?");


export interface RecipeDetails extends Recipe {
    ingredients: Array<string>;
    preparation: string;
    chef: string;
    minutesNeeded: number;
    difficulty: Difficulty;
    views: number;
    likes: number;
}

export interface RecipeState {
    loggedUser: UserInfo | null;
    selectedUserData: UserData | null;
    recipesDisplayed: Array<Recipe>;
    recipesPerPage: number;
    numberOfPages: number;
    currentRecipe: RecipeDetails | null;
    searchResults: Array<Recipe> | null;
}

export interface IngredientSuggestion {
    name: string;
}

export interface Ingredient {
    name: string;
    /* description: string */
}