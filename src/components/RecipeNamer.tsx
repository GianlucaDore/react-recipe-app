import { Box, MenuItem, TextField, Typography } from "@mui/material"
import { useEffect, useRef } from "react"
import { useAppSelector } from "../redux/hooks";
import { getUserData } from "../redux/recipeSlice";
import { Experience, UserData } from "../redux/storetypes";
import { calculateChefExperience } from "../utils/helpers";
import { withDetails } from "../utils/hocs";
import { Difficulty } from "../redux/storetypes";
import { RecipeCreatedAction } from "../utils/interfaces";

interface RecipeNamerProps {
    title: string;
    difficulty: Difficulty;
    minutesNeeded: number;
    dispatcher: React.Dispatch<RecipeCreatedAction>;
}

const difficultyValues = ["Easy", "Medium", "Hard"];

const RecipeNamer = (props: RecipeNamerProps) => {
    const { dispatcher, title, difficulty, minutesNeeded } = props;

    const userData: UserData | null = useAppSelector(getUserData);

    const experienceLevel = useRef<Experience>({level: "Unexperienced"});

    useEffect(() => {
        if (userData) {
            experienceLevel.current = calculateChefExperience(userData)
        }
    }, [userData]);


    const handleRecipeNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher({
            type: 'edit-title',
            payload: event.target.value
        } as RecipeCreatedAction);
    }

    const handleMinutesNeededChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher({
            type: 'edit-minutes-needed',
            payload: event.target.value
        } as RecipeCreatedAction);
    }


    return (
        <Box>
            <TextField id="recipe-title" label="Recipe title" variant="outlined" 
                       value={title} onChange={handleRecipeNameChange} />
            <TextField id="minutes-needed" label="Minutes needed" variant="outlined"
                        value={minutesNeeded} onChange={handleMinutesNeededChange} /> 
            <TextField id="recipe-difficulty" label="Difficulty" variant="outlined"
                        defaultValue={difficulty} select>
                {difficultyValues.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField> 
            <Typography>Chef: {userData?.displayName}, {experienceLevel.current.level}</Typography>
        </Box>
    )
}

export const RecipeNamerMemoized = withDetails(RecipeNamer);