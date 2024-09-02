import { Box, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "../redux/hooks";
import { getUserData } from "../redux/recipeSlice";
import { Experience, UserData } from "../redux/storetypes";
import { calculateChefExperience } from "../utils/helpers";

export const RecipeNamer = () => {

    const [recipeName, setRecipeName] = useState<string>("");

    const userData: UserData | null = useAppSelector(getUserData);

    const experienceLevel = useRef<Experience>({level: "Unexperienced"});

    useEffect(() => {
        if (userData) {
            experienceLevel.current = calculateChefExperience(userData)
        }
    }, [userData]);


    const handleRecipeNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecipeName(() => event.target.value);
    }


    return (
        <Box>
            <TextField id="recipe-name" label="Recipe name" variant="outlined" 
                       value={recipeName} onChange={(event) => handleRecipeNameChange(event as React.ChangeEvent<HTMLInputElement>)}/>
            <Typography>Chef: {userData?.displayName}, {experienceLevel.current.level}</Typography>
        </Box>
    )
}