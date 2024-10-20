import { Avatar, Card, CardContent, CardHeader, CardMedia, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useAppSelector } from "../redux/hooks";
import { getRecipeOfTheDay } from "../redux/recipeSlice";
import { getInitialsForChef } from "../utils/helpers";

export const RecipeOfTheDay = () => {

    const navigate = useNavigate();

    const recipeOfTheDay = useAppSelector(getRecipeOfTheDay);

    const handleCardClick = () => {
        if (recipeOfTheDay)
            navigate(`/recipe/${recipeOfTheDay.id}`);
    }

    return (
        <>
            <Card onClick={handleCardClick} sx={{ maxWidth: 1500, height: 350 }}>
                <CardHeader 
                    avatar={<Avatar>{getInitialsForChef(recipeOfTheDay?.chef)}</Avatar>}
                    title={recipeOfTheDay?.title} 
                />
                <CardMedia component="img" height="1s40" image="./recipeplaceholder" alt="recipe placeholder" />
                <CardContent>
                    <Typography gutterBottom variant="body1" component="div">
                        {recipeOfTheDay?.preparationInBrief}
                    </Typography>
                </CardContent>
            </Card>
        </>
    )
}