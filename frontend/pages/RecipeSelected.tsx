import { FC, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Box, Button, CircularProgress, Fade, Grid, LinearProgress, List, Modal, Typography } from "@mui/material";
import { ExpandMoreRounded, OpenInFull } from "@mui/icons-material";

import { useAppDispatch } from "../redux/hooks";
import { useGetSelectedRecipePageQuery } from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";

import { showSnackbarError } from "../utils/helpers";

import { RecipeAppBar } from "../components/RecipeAppBar";
import { RecipeStats } from "../components/RecipeStats";
import { ChefTitle } from "../components/ChefTitle";
import { Toaster } from "../components/Toaster";

import DOMPurify from "dompurify";
import parse from 'html-react-parser';

import { colors } from "../utils/theme";


export const RecipeSelected: FC<void> = () => {

    const [modalStatus, setModalStatus] = useState<boolean>(false);

    const { recipeId } = useParams();

    const dispatch = useAppDispatch();

    const { data: recipeData, error: errorRecipe, isLoading: isRecipeLoading } = useGetSelectedRecipePageQuery(recipeId ? { recipeId } : skipToken);

    const sanitizedHtml = useMemo(() => {
        if (recipeData) {
            if (recipeData.preparation) {
                return DOMPurify.sanitize(recipeData.preparation);
            }
            else return '';
        }
        else return '';
      }, [recipeData?.preparation]);

    useEffect(() => {
        if (errorRecipe) {
            showSnackbarError(dispatch, errorRecipe);
        }
    }, [errorRecipe, dispatch]);


    const handleOpenIngredientModal = () => {
        setModalStatus(true);
    }

    const handleCloseIngredientModal = () => {
        setModalStatus(false);
    }


    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <RecipeAppBar />
            <Toaster />
            <Grid container spacing={0} width="100%" height="calc(100% - 64px)" direction="row" flexWrap="nowrap" justifyContent="center" alignItems="center" margin="0px" paddingLeft="15px">
                <Grid item width="30%" height="100%" paddingTop="10px" paddingBottom="7px">
                    <Box display="flex" flexDirection="column" justifyContent="flex-start" height="100%">
                        <Box display="flex" flexDirection="row" height="20%">
                            <Typography variant="h2">{recipeData?.title}</Typography>
                        </Box>
                        <Box>
                            <ChefTitle chefData={recipeData?.chef} showFullDetails={true}/>
                        </Box>
                        <Box width="100%" textAlign="center" marginTop="auto" display="flex" flexDirection="column" justifyContent="center" sx={ingredientBoxStyle}>
                            <Typography variant="h5">Ingredients</Typography>
                            {recipeData ? (
                                <List>
                                    {
                                        recipeData.ingredients.map((ingredient: string) => {
                                            return (
                                                <Accordion key={ingredient}>
                                                    <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                                                        {ingredient}
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Typography variant="body1">
                                                            Lorem ipsum dolor sit amet...    
                                                        </Typography>
                                                        <Button onClick={handleOpenIngredientModal}>
                                                            More Info <OpenInFull sx={{ marginLeft: "7px" }}/>
                                                        </Button>
                                                        <Modal
                                                            aria-labelledby="transition-modal-title"
                                                            aria-describedby="transition-modal-description"
                                                            open={modalStatus}
                                                            onClose={handleCloseIngredientModal}
                                                            closeAfterTransition
                                                            slots={{ backdrop: Backdrop }}
                                                            slotProps={{
                                                                backdrop: {
                                                                    timeout: 500,
                                                                    style: {
                                                                        backgroundColor: 'rgba(0, 0, 0, 0.22)'
                                                                    }
                                                                },
                                                            }}
                                                        >
                                                            <Fade in={modalStatus}>
                                                            <Box sx={modalStyle}>
                                                                <Typography id="transition-modal-title" variant="h4" component="h2">
                                                                    { ingredient }
                                                                </Typography>
                                                                <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                                                                    Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                                                                </Typography>
                                                            </Box>
                                                            </Fade>
                                                        </Modal>
                                                    </AccordionDetails>
                                                </Accordion>
                                                )
                                        })
                                    }
                                </List>
                            ) : (<LinearProgress />)}
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={2} height="100%" alignContent="center" alignItems="center" justifyContent="center">
                    <RecipeStats minutesNeeded={recipeData ? recipeData.minutesNeeded : NaN} difficulty={recipeData ? recipeData.difficulty : "?"} views={recipeData ? recipeData.views : NaN} />
                </Grid>
                <Grid item xs={12} md={7} height="100%" justifyContent="center" alignItems="center" paddingLeft="25px" paddingRight="25px" sx={{ backgroundColor: '#3B2F2F'}}>
                    <Box height="100%" display="flex" flexDirection="column" justifyContent="space-around">
                        <Box width="100%" height="50%" display="flex" justifyContent="center">
                            <img height="100%" src={recipeData?.imageURL} alt={recipeData?.title} />
                        </Box>
                        <Box border="2px solid #4e342e" padding="15px 20px" borderRadius="17px" sx={{ backgroundColor: "#FFF7EE", overflowY: "auto" }}>
                            <Typography variant="h5" textAlign="center" marginBottom="5px">Preparation</Typography>
                            {recipeData ? (
                                parse(sanitizedHtml)
                            ) : (<CircularProgress />)}
                        </Box>
                    </Box>
                </Grid>
            </Grid >
        </Box>
    );
}


const ingredientBoxStyle = { 
    maxHeight: '60vh', 
    border: `2px solid ${colors.primary}`, 
    borderRadius: "15px", 
    padding: "15px 0px 15px 0px", 
    backgroundColor: colors.tertiary, 
    overflowY: 'auto',
    '&::-webkit-scrollbar-track': {
        background: colors.secondary,
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: colors.primary,
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        // background: colors.highlight
    },
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 0,
    p: 4,
  };