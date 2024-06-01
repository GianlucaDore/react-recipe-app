import firebase from "firebase/compat/app";

export type User = firebase.User | null;

export interface UserInfo {
    displayName: string;
    email: string;
    emailVerified: boolean;
    lastSignInTime?: string;
    phoneNumber: string;
    photoURL: string;
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
    user: UserInfo | null;
    recipesDisplayed: Array<Recipe>;
    recipesPerPage: number;
    numberOfPages: number;
    currentRecipe: RecipeDetails | null;
    searchResults: Array<Recipe> | null;
}