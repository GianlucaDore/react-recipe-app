import { Avatar, Box, Button, Card, CardActions, CardHeader, CardMedia, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useAppSelector } from "../redux/hooks";
import { getRecipeOfTheDay } from "../redux/recipeSlice";
import { getAlphabeticalShorthandForNumber, getInitialsForChef } from "../utils/helpers";
import { useMemo } from "react";
import DOMPurify from "dompurify";
import parse from 'html-react-parser';
import { Favorite, Visibility } from "@mui/icons-material";


export const RecipeOfTheDay = () => {

    const navigate = useNavigate();

    const recipeOfTheDay = useAppSelector(getRecipeOfTheDay);

    const sanitizedHtml = useMemo(() => {
        if (recipeOfTheDay?.preparationInBrief) {
          return DOMPurify.sanitize(recipeOfTheDay?.preparationInBrief);
        }
        else return '';
      }, [recipeOfTheDay?.preparationInBrief]);

    const handleReadMoreClick = () => {
        if (recipeOfTheDay)
            navigate(`/recipe/${recipeOfTheDay.id}`);
    }

    const handleRecipeOfTheDayChefClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (recipeOfTheDay && recipeOfTheDay.chefName) {
            navigate(`/user/${recipeOfTheDay.chefName}`);
        }
    }

    /* const handleRecipeOfTheDayCardClick = () => {
        if (recipeOfTheDay && recipeOfTheDay.id) {
            navigate(`/recipe/${recipeOfTheDay.id}`);
        }
    } */


    return (
        <Box display="flex" width="100%" flexDirection={{xs: "column", sm: "column", md: "row" }}>
            <Box width={{sm: "100%", md: "50%"}} display="flex" flexDirection="column" alignItems="center" rowGap="10px">
                <Typography variant="h1" color="white" fontSize={{ xs: "6rem", md: "3.5rem", lg: "4.5rem", xl: "5rem"}}>Recipe of the day</Typography>
                <Typography variant="h3" color="white" fontSize={{ xs: "4rem", md: "2.5rem", lg: "3.5rem", xl: "4rem"}}>{recipeOfTheDay?.title}</Typography>
                <Box>
                    <Typography variant="body2" color="goldenrod">
                        Chef: {recipeOfTheDay?.chefName} - Time: {recipeOfTheDay?.minutesNeeded} mins - Difficulty: {recipeOfTheDay?.difficulty}
                    </Typography>
                </Box>
                <Typography variant="body1" color="#fff5e1" width="75%" textAlign="center">
                    {parse(sanitizedHtml)}...
                </Typography>
                <Button onClick={handleReadMoreClick}>Read more</Button>
            </Box>
            <Box width={{xs: "100%", sm: "75%", md: "50%"}} paddingRight="50px" marginTop={{ sm: "20px" }} marginLeft={{ sm: "auto" }} marginRight={{ sm: "auto"}}>
                <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: "300px" }}>
                    <CardHeader 
                        avatar={<Avatar>{getInitialsForChef(recipeOfTheDay?.chefName)}</Avatar>}
                        title={recipeOfTheDay?.chefName}
                        onClick={handleRecipeOfTheDayChefClick}
                        sx={{ position: 'relative', zIndex: 2 }}
                    />
                    <Box sx={{ height: 'calc(100% - 50px - 50px)' }}>
                        <CardMedia
                            component="img"
                            image={recipeOfTheDay?.imageURL}
                            alt={`Recipe of the day: ${recipeOfTheDay?.title}`}
                            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, objectFit: 'cover' }}
                        />
                    </Box>
                    <CardActions sx={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
                        <Favorite />{recipeOfTheDay?.likes}
                        <Visibility />{getAlphabeticalShorthandForNumber(recipeOfTheDay?.views)}
                    </CardActions>
                </Card>
            </Box>
        </Box>
    );
}