import { Box, Stack, Typography } from "@mui/material";
import { Difficulty } from "../redux/storetypes";
import { AccessAlarm, Favorite, Psychology, Visibility } from "@mui/icons-material";

interface RecipeStatsProps {
    minutesNeeded: number;
    difficulty: Difficulty;
    views: number;
    likes: number;
}

export const RecipeStats = (props: RecipeStatsProps) => {
    const { minutesNeeded, difficulty, likes, views } = props;
    return (
        <>
            <Stack textAlign="center" justifyContent="center" alignItems="center" spacing={{ xs: 1, sm: 2, md: 4 }} direction={{ xs: 'row', sm: 'row', md: 'column' }}>
                <Box width="50%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <AccessAlarm />
                    <Typography>Preparation:<br/><b>{minutesNeeded} min</b></Typography>
                </Box>
                <Box width="50%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <Psychology />
                    <Typography>Difficulty:<br/><b>{difficulty}</b></Typography>
                </Box>
                <Box width="50%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <Favorite />
                    <Typography>Likes:<br/><b>{likes}</b></Typography>
                </Box>
                <Box width="50%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <Visibility />
                    <Typography>Views:<br/><b>{views}</b></Typography>
                </Box>
            </Stack >
        </>
    )
}