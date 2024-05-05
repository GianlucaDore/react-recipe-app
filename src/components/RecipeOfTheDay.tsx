import { Card, CardContent, CardHeader, CardMedia, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export const RecipeOfTheDay = () => {

    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate("/");
    }

    return (
        <>
            <Card onClick={handleCardClick} sx={{ maxWidth: 1500, height: 350 }}>
                <CardHeader>Recipe of the day</CardHeader>
                <CardMedia component="img" height="140" image="./recipeplaceholder" alt="recipe placeholder" />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        This recipe is a modern interpretation of an old-fashioned Italian tradition...
                    </Typography>
                </CardContent>
            </Card>
        </>
    )
}