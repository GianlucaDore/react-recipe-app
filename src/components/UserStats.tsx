import { Favorite, HistoryEdu, Visibility } from "@mui/icons-material";
import { Box, Typography } from "@mui/material"

interface UserStatsProps {
    likesReceived: number,
    totalViews: number,
    publishedRecipes: number
}

export const UserStats = (props: UserStatsProps) => {
    const { likesReceived, totalViews, publishedRecipes } = props;

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Typography 
                width="fit-content"
                padding="7px 15px 5px 15px" 
                variant="h5"
                color="#FFF7EE"
                sx={{
                    backgroundColor: "#4e342e",
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px"
                }}
            >Chef Stats</Typography>
            <Box
                width="fit-content"
                margin="auto"
                sx={{
                    backgroundColor: "#FFF7EE",
                    padding: "20px 10px",
                    border: "2px solid #4e342e",
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "center",
                    columnGap: "10px"
                }}
            >
                <Box
                    width="100px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                        <HistoryEdu />
                        <Typography marginLeft="3px" textAlign="center">{publishedRecipes}</Typography>
                    </Box>
                    <Typography>Recipes</Typography>
                </Box>
                <Box
                    width="100px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                        <Visibility />
                        <Typography marginLeft="3px" textAlign="center">{totalViews}</Typography>
                    </Box>
                    <Typography>Views</Typography>
                </Box>
                <Box
                    width="100px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                        <Favorite />
                        <Typography marginLeft="3px" textAlign="center">{likesReceived}</Typography>
                    </Box>
                    <Typography>Likes</Typography>
                </Box>
            </Box>
        </Box>     
    );
}
