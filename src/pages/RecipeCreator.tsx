import { useEffect, useState } from "react"
import { useAppSelector } from "../redux/hooks";
import { getLoggedUser } from "../redux/recipeSlice";
import { useNavigate } from "react-router";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { IngredientsSelector } from "../components/IngredientsSelector";
import { ToasterData } from "../utils/interfaces";
import { Close } from "@mui/icons-material";
import { RecipeEditor } from "../components/RecipeEditor";
import { publishNewRecipe } from "../utils/apicalls";
import { RecipeDetails } from "../redux/storetypes";

export const RecipeCreator = () => {

    const [recipeCreated, setRecipeCreated] = useState<RecipeDetails | null>(null);

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
        if (!recipeCreated || !recipeCreated.title || !recipeCreated.ingredients || !recipeCreated.chef || !recipeCreated.preparation || !recipeCreated.minutesNeeded || !recipeCreated.difficulty) {
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
                const retValue = await publishNewRecipe(recipeCreated);
                if (retValue) setToaster({
                    open: true,
                    message: `New recipe "${recipeCreated?.title}" published successfully!`,
                    type: "success",
                    transition: "Slide",
                    key: recipeCreated.title 
                })
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
            <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ backgroundColor: "#FCEFDF" }}>
                <RecipeAppBar />
                <Box display="flex">
                    <IngredientsSelector setToaster={setToaster} />
                    <RecipeEditor />

                    <Snackbar 
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        autoHideDuration={4000}
                        open={toaster.open}
                        key={toaster.key}
                        onClose={() => handleCloseToaster()}
                        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}
                    >
                        <Alert severity={toaster.type} variant="filled" sx={{display:"flex", flexDirection:"row", alignItems: "center"}}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography>{toaster.message}</Typography>
                                <Close onClick={() => handleCloseToaster()} sx={{ marginLeft: "2%", cursor: "pointer" }}/>
                            </Box>
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>       
        </>
    )
}