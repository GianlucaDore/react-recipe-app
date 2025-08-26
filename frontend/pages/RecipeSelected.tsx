import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSingleRecipe, fetchTotalNumberOfPagesInHome } from "../redux/thunks";
import { getCurrentRecipe } from "../redux/recipeSlice";
import { RecipeAppBar } from "../components/RecipeAppBar";
import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Box, Button, CircularProgress, Fade, Grid, LinearProgress, List, Modal, SxProps, Typography } from "@mui/material";
import { RecipeStats } from "../components/RecipeStats";
import DOMPurify from "dompurify";
import parse from 'html-react-parser';
import { ExpandMoreRounded, OpenInFull } from "@mui/icons-material";
import { colors } from "../utils/theme";
import { ChefTitle } from "../components/ChefTitle";
import { showSnackbarError } from "../utils/helpers";
import { Toaster } from "../components/Toaster";


export const RecipeSelected = () => {

    const [modalStatus, setModalStatus] = useState<boolean>(false);

    const { recipeId } = useParams();

    const dispatch = useAppDispatch();

    const recipeData = useAppSelector(getCurrentRecipe);

    const sanitizedHtml = useMemo(() => {
        if (recipeData?.preparation) {
          return DOMPurify.sanitize(recipeData.preparation);
        }
        else return '';
      }, [recipeData?.preparation]);


    useEffect(() => {
        const fetchSingleRecipeFunction = async () => {
            if (recipeId === undefined) {
                showSnackbarError(dispatch, "Invalid recipe ID provided.");
                return;
            }
            try {
                await dispatch(fetchSingleRecipe(recipeId)).unwrap();
                await dispatch(fetchTotalNumberOfPagesInHome()).unwrap();
            } catch (error) {
                showSnackbarError(dispatch, error);
            }
        };
        fetchSingleRecipeFunction();

    }, [dispatch, recipeId]);


    const handleOpenIngredientModal = () => {
        setModalStatus(true);
    }

    const handleCloseIngredientModal = () => {
        setModalStatus(false);
    }


    return (
        <Box display="flex" flexDirection="column" sx={{ height: {xs: '100%', lg: "100vh"}}} >
            <RecipeAppBar />
            <Toaster />
            <Grid container spacing={0} sx={gridContainer}>
                <Grid item sx={gridItemTitle}>
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
                <Grid item xs={12} md={2} sx={gridItemStats}>
                    <RecipeStats minutesNeeded={recipeData ? recipeData.minutesNeeded : NaN} difficulty={recipeData ? recipeData.difficulty : "?"} views={recipeData ? recipeData.views : NaN} />
                </Grid>
                <Grid item xs={12} md={7} sx={gridItemPreparation}>
                    <Box height="100%" display="flex" flexDirection="column" justifyContent="space-around">
                        <Box sx={boxContainerImage}>
                            <img src={recipeData?.imageURL} alt={recipeData?.title} style={recipeImageStyle}/>
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


const ingredientBoxStyle: SxProps = { 
    maxHeight: '60vh', 
    border: `2px solid ${colors.primary}`, 
    borderRadius: "15px", 
    padding: "15px 0px 15px 0px", 
    backgroundColor: colors.tertiary, 
    overflowY: 'auto',
    '&::-webkit-scrollbar-track': {
        background: colors.secondary, // Background of the scrollbar track
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: colors.primary, // Color of the scrollbar thumb
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        // background: colors.highlight, // Color on hover
    },
}

const modalStyle: SxProps = {
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
  
const gridContainer: SxProps = {
    width: "100%",
    height: "calc(100% - 64px)",
    flexDirection: { xs: "column", lg: "row" },
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
    margin: "0px",
    paddingLeft: { xs: "0px", lg: "15px" }
}

const gridItemTitle: SxProps = {
    order: { xs: 2, lg: 1 },
    width: { xs: "92%", lg: "30%" },
    height: "100%",
    paddingTop: "10px", 
    paddingBottom: "7px"
}

const gridItemStats: SxProps = {
    order: { xs: 1, lg: 2 },
    height: "100%", 
    alignContent: "center", 
    alignItems: "center", 
    justifyContent: "center"
}

const gridItemPreparation: SxProps = {
    order: 3,
    height: "100%",
    justifyContent: "center", 
    alignItems: "center",
    paddingLeft: "25px",
    paddingRight: "25px",
    backgroundColor: '#3B2F2F'
}

const boxContainerImage: SxProps = {
    width: "100%",
    height: "50%",
    display: "flex",
    justifyContent: "center"
}

const recipeImageStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    border: "1px transparent",
    borderRadius: "25px"
}