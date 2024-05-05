import { useEffect } from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Grid, Pagination, Skeleton, Stack, Typography } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getRecipesDisplayed } from "../redux/recipeSlice";

export const RecipesList = () => {

    const dispatch = useAppDispatch();

    const recipesToDisplay = useAppSelector(getRecipesDisplayed);


    return (
        <>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="center">
                    <Card sx={{ width: "90%", height: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <CardActionArea sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            {recipesToDisplay ? (
                                <CardMedia component="img" height="140" image="./recipeplaceholder" alt="recipe placeholder" />
                            ) : (
                                <CircularProgress sx={{ marginTop: "auto" }} />
                            )}
                            <CardContent sx={{ width: "100%", marginTop: "auto", textAlign: "right" }}>
                                {recipesToDisplay ? (
                                    <Typography gutterBottom variant="h5" component="div">
                                        {recipesToDisplay[0].title}
                                    </Typography>
                                ) : (
                                    <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                                )}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="center">
                    <Card sx={{ width: "90%", height: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <CardActionArea sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            {recipesToDisplay ? (
                                <CardMedia component="img" height="140" image="./recipeplaceholder" alt="recipe placeholder" />
                            ) : (
                                <CircularProgress sx={{ marginTop: "auto" }} />
                            )}
                            <CardContent sx={{ width: "100%", marginTop: "auto", textAlign: "right" }}>
                                {recipesToDisplay ? (
                                    <Typography gutterBottom variant="h5" component="div">
                                        {recipesToDisplay[1].title}
                                    </Typography>
                                ) : (
                                    <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                                )}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="center">
                    <Card sx={{ width: "90%", height: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <CardActionArea sx={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            {recipesToDisplay ? (
                                <CardMedia component="img" height="140" image="./recipeplaceholder" alt="recipe placeholder" />
                            ) : (
                                <CircularProgress sx={{ marginTop: "auto" }} />
                            )}
                            <CardContent sx={{ width: "100%", marginTop: "auto", textAlign: "right" }}>
                                {recipesToDisplay ? (
                                    <Typography gutterBottom variant="h5" component="div">
                                        {recipesToDisplay[2].title}
                                    </Typography>
                                ) : (
                                    <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                                )}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Stack spacing={2} marginTop="15px">
                <Pagination count={10} color="primary" />
            </Stack>
        </>
    )
}