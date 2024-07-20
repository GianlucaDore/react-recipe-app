import { Favorite, HistoryEdu, Visibility } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material"

interface UserStatsProps {
    likesReceived: number,
    totalViews: number,
    publishedRecipes: number
}

export const UserStats = (props: UserStatsProps) => {
    const { likesReceived, totalViews, publishedRecipes } = props;

    return (
        <>
            <Box width="fit-content" margin="auto" sx={{padding: "20px 10px", border: "2px solid black", borderRadius: "15%"}}>
                <Stack width="fit-content" flexDirection="row" justifyContent="center" columnGap="10px">
                    <Box flexDirection="column" alignItems="center">
                        <Box flexDirection="row" justifyContent="center">
                            <Typography>{publishedRecipes}</Typography>
                            <HistoryEdu />
                        </Box>
                        <Box>Recipes</Box>
                    </Box>
                    <Box flexDirection="column" alignItems="center">
                        <Box flexDirection="row" justifyContent="center">
                            <Typography>{totalViews}</Typography>
                            <Visibility />
                        </Box>
                        <Box>Views</Box>
                    </Box>
                    <Box flexDirection="column" alignItems="center">
                        <Box flexDirection="row" justifyContent="center">
                            <Typography>{likesReceived}</Typography>
                            <Favorite />
                        </Box>
                        <Box>Likes</Box>
                    </Box>
                </Stack>
            </Box>
        </>
    );
}