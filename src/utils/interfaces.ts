import { RecipeDetails } from "../redux/storetypes";

export interface ToasterData {
    open: boolean;
    message: string;
    type: "success" | "error" | "warning";
    transition: "Slide"| "Grow";
    key: string | null;
}

export interface RecipeCreatedState extends Omit<RecipeDetails, "id" |"views" | "likes" | "chef" | "likedBy" > {
    image: File | null;
}

export interface RecipeCreatedAction {
    type: string;
    payload: Array<string> | string | number | File | null; 
}