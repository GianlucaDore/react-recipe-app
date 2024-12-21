import { createContext, useEffect, useReducer, useState } from "react"
import { useAppSelector } from "../redux/hooks";
import { getLoggedUser } from "../redux/recipeSlice";
import { useNavigate } from "react-router";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { IngredientsSelectorMemoized } from "../components/IngredientsSelector";
import { RecipeCreatedAction, RecipeCreatedState, ToasterData } from "../utils/interfaces";
import { Close } from "@mui/icons-material";
import { RecipeEditorMemoized } from "../components/RecipeEditor";
import { publishNewRecipe } from "../utils/apicalls";
import { RecipeImageMemoized } from "../components/RecipeImage";
import { Difficulty, RecipeToSubmit } from "../redux/storetypes";
import { RecipeNamerMemoized } from "../components/RecipeNamer";


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

    const [toaster, setToaster] = useState<ToasterData>({
        open: false,
        message: "",
        type: "success",
        transition: "Slide",
        key: null
    });

    const loggedUser = useAppSelector(getLoggedUser);

    const navigate = useNavigate();

    useEffect(() => {
        if (!loggedUser) {
            alert("You must sign in before.");
            navigate('/sign-in');
        }
    }, [loggedUser, navigate]);

    const handleCloseToaster = () => {
        setToaster((prevState) => { return { ...prevState, open: false} });
    }

    const handleSubmitRecipe = async () => {
        if (!recipeCreated || !recipeCreated.title || !recipeCreated.ingredients || !recipeCreated.preparation || !recipeCreated.minutesNeeded || !recipeCreated.difficulty) {
            setToaster({
                open: true,
                message: "Can't submit a recipe with missing arguments. Please provide all the fields needed.",
                type: "error",
                transition: "Slide",
                key: "Error"
            })
        }
        else {
            try {
                if (recipeCreated.image) {
                    const recipeCreatedWithDetails: RecipeToSubmit = {
                        ...recipeCreated,
                        chefId: loggedUser!.uid,
                        views: 0,
                        likes: 0,
                        likedBy: []
                    }
                    const retValue = await publishNewRecipe(recipeCreatedWithDetails, recipeCreated.image);
                    if (retValue) setToaster({
                        open: true,
                        message: `New recipe "${recipeCreated?.title}" published successfully!`,
                        type: "success",
                        transition: "Slide",
                        key: recipeCreated.title 
                    })
                }
            }
            catch (error) {
                console.error("Error while publishing a new recipe in the database: ", error);
                setToaster({
                    open: true,
                    message: (error as Error).message,
                    type: "error",
                    transition: "Slide",
                    key: "Error"
                });
            }
        }
    }
        
    
    return (
        <>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <RecipeAppBar />
                <RecipeCreatedContext.Provider value={recipeCreated}>
                    <Box display="flex" flexDirection="row" width="100%" justifyContent="space-evenly">
                        <Box flexDirection="column" height="100%" width="50%">
                            <IngredientsSelectorMemoized setToaster={setToaster} dispatcher={recipeCreatedDispatch}/>
                            <RecipeNamerMemoized dispatcher={recipeCreatedDispatch} />
                        </Box>
                        <Box display="flex" flexDirection="column" height="100%" alignItems="center">
                            <RecipeImageMemoized dispatcher={recipeCreatedDispatch} currentImageURL={recipeCreated.imageURL}/>
                            <RecipeEditorMemoized dispatcher={recipeCreatedDispatch} />
                            <Button onClick={handleSubmitRecipe}>Submit</Button>
                        </Box>
                        <Snackbar 
                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                            autoHideDuration={4000}
                            open={toaster.open}
                            key={toaster.key}
                            onClose={handleCloseToaster}
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}
                        >
                            <Alert severity={toaster.type} variant="filled" sx={{display:"flex", flexDirection:"row", alignItems: "center"}}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography>{toaster.message}</Typography>
                                    <Close onClick={handleCloseToaster} sx={{ marginLeft: "2%", cursor: "pointer" }}/>
                                </Box>
                            </Alert>
                        </Snackbar>
                    </Box>
                </RecipeCreatedContext.Provider>
            </Box>       
        </>
    )
}