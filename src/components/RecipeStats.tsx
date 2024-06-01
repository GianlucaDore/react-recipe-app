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
                <Box width="100%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <AccessAlarm />
                    <Typography>{minutesNeeded} min</Typography>
                </Box>
                <Box width="100%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <Psychology />
                    <Typography>{difficulty}</Typography>
                </Box>
                <Box width="100%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <Favorite />
                    <Typography>{likes}</Typography>
                </Box>
                <Box width="100%" padding="20px" border="2px solid brown" borderRadius="13px" sx={{ backgroundColor: "#FFF7EE" }}>
                    <Visibility />
                    <Typography>{views}</Typography>
                </Box>
            </Stack >
        </>
    )
}