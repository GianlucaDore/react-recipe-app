import firebase from "firebase/compat/app";

export type User = firebase.User;

export type UserInfo = Pick<User, 'uid'|'displayName'|'email'|'emailVerified'|'phoneNumber'|'photoURL'>

export interface UserData extends UserInfo {
    likesReceived: number;
    totalViews: number;
    publishedRecipes: number;
    recipes: Array<Recipe>;
}

export type ChefData = Omit<UserData, "emailVerified" | "phoneNumber" | "recipes"> ;

export interface Recipe {
    id: string;
    title: string;
    imageURL: string;
}

export type Difficulty = ("Easy" | "Medium" | "Hard" | "?");

export interface RecipeDetails extends Recipe {
    ingredients: Array<string>;
    preparation: string;
    chef: ChefData;
    minutesNeeded: number;
    difficulty: Difficulty;
    views: number;
    likes: number;
    likedBy: Array<string>;
}

export type RecipeToSubmit = Omit<RecipeDetails, "id" | "imageURL" | "chef"> & {chefId: string};  

export interface RecipeOfTheDay extends Recipe {
    preparationInBrief: string;
    dateOfFetching: string;
    chefName: string | null;
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
    recipeOfTheDay: RecipeOfTheDay | null;
}

export interface IngredientSuggestion {
    name: string;
}

export interface Ingredient {
    name: string;
    /* description: string */
    /* imageURL: string */
}

export interface Experience {
    level: "N/A" | "Unexperienced" | "Practicing" | "Experienced" | "Master";
}