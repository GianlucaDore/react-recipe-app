import { createContext, useEffect, useReducer } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getLoggedUser } from "../redux/recipeSlice";
import { useNavigate } from "react-router";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Box, Button } from "@mui/material";
import { IngredientsSelectorMemoized } from "../components/IngredientsSelector";
import { RecipeCreatedAction, RecipeCreatedState } from "../utils/interfaces";
import { RecipeEditorMemoized } from "../components/RecipeEditor";
import { usePublishRecipeMutation } from "../redux/apiSlice";
import { RecipeImageMemoized } from "../components/RecipeImage";
import { Difficulty, RecipeToSubmit, UserInfo } from "../redux/storetypes";
import { RecipeNamerMemoized } from "../components/RecipeNamer";
import { showSnackbarError, showSnackbarSuccess } from "../utils/helpers";


function recipeCreatedReducer(state: RecipeCreatedState, action: RecipeCreatedAction): RecipeCreatedState {
    switch (action.type) {
        case 'insert-ingredient': {
            if (state.ingredients[0] === '?') {
                return {...state, ingredients: [...state.ingredients.slice(1)]};
            }
            else return {...state, ingredients: [action.payload as string, ...state.ingredients]};
        }
        case 'add-empty-ingredient': {
            if (state.ingredients[0] !== '?') {
                return {...state, ingredients: ['?', ...state.ingredients]};
            }
            else return {...state};
        }
        case 'edit-title': 
            return {...state, title: action.payload as string};
        case 'edit-minutes-needed':
            return {...state, minutesNeeded: action.payload as number};
        case 'edit-difficulty': 
            return {...state, difficulty: action.payload as Difficulty};
        case 'edit-preparation':
            return {...state, preparation: action.payload as string};
        case 'edit-image':
            return {...state, image: action.payload as File};
        default:
            throw Error('Unknown action for recipeCreatedReducer.');
    }
}

const initialState: RecipeCreatedState = {
    title: "",
    ingredients: [],
    preparation: "",
    minutesNeeded: 0,
    difficulty: "Easy",
    image: null,
    imageURL: ''
};

export const RecipeCreatedContext = createContext<RecipeCreatedState>(initialState);


export const RecipeCreator = () => {

    const [recipeCreated, recipeCreatedDispatch] = useReducer(recipeCreatedReducer, initialState);

    const dispatch = useAppDispatch();

    const loggedUser: UserInfo | null = useAppSelector(getLoggedUser);

    const navigate = useNavigate();

    const [publishRecipe] = usePublishRecipeMutation();

    useEffect(() => {
        if (!loggedUser) {
            alert("You must sign in before.");
            navigate('/sign-in');
        }
    }, [loggedUser, navigate]);


    const handleSubmitRecipe = async () => {
        if (!recipeCreated || !recipeCreated.title || !recipeCreated.ingredients || !recipeCreated.preparation || !recipeCreated.minutesNeeded || !recipeCreated.difficulty) {
            const error = new Error("Can't submit a recipe with missing arguments. Please provide all the fields needed");
            showSnackbarError(dispatch, error);
        }
        else {
            try {
                if (recipeCreated.image) {
                    const recipeCreatedWithDetails: RecipeToSubmit = fabricateRecipeToSubmit(recipeCreated, loggedUser);
                    const retValue = await publishRecipe({ recipe: recipeCreatedWithDetails, image: recipeCreated.image });
                    if (retValue) {
                        showSnackbarSuccess(dispatch, `New recipe "${recipeCreated?.title}" published successfully!`);
                    }
                }
            }
            catch (error) {
                console.error("Error while publishing a new recipe in the database: ", error);
                showSnackbarError(dispatch, error);
            }
        }
    }
        
    
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <RecipeAppBar />
            <RecipeCreatedContext.Provider value={recipeCreated}>
                <Box display="flex" flexDirection="row" width="100%" justifyContent="space-evenly">
                    <Box flexDirection="column" height="100%" width="50%">
                        <IngredientsSelectorMemoized dispatcher={recipeCreatedDispatch}/>
                        <RecipeNamerMemoized dispatcher={recipeCreatedDispatch} />
                    </Box>
                    <Box display="flex" flexDirection="column" height="100%" alignItems="center">
                        <RecipeImageMemoized dispatcher={recipeCreatedDispatch} currentImageURL={recipeCreated.imageURL}/>
                        <RecipeEditorMemoized dispatcher={recipeCreatedDispatch} />
                        <Button onClick={handleSubmitRecipe}>Submit</Button>
                    </Box>
                </Box>
            </RecipeCreatedContext.Provider>
        </Box>       
    )
}


function fabricateRecipeToSubmit(recipeCreated: RecipeCreatedState, loggedUser: UserInfo | null): RecipeToSubmit {
    const recipeCreatedWithDetails: RecipeToSubmit = {
        ...recipeCreated,
        chefId: loggedUser!.uid,
        views: 0,
        likes: 0,
        likedBy: []
    }
    return recipeCreatedWithDetails;
}