import { Dispatch, Fragment, useCallback, useEffect, useState } from "react";
import { usePublishIngredientMutation, useGetIngredientSuggestionsQuery } from "../redux/apiSlice";
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Modal, TextField, Typography } from "@mui/material";
import { Add, Close, ExpandMore, Publish } from "@mui/icons-material";
import { RecipeCreatedAction, ToasterData } from "../utils/interfaces";
import { withIngredients } from "../utils/hocs";

interface IngredientsSelectorProps {
    setToaster: React.Dispatch<React.SetStateAction<ToasterData>>;
    ingredients: Array<string>;
    dispatcher: Dispatch<RecipeCreatedAction>;
}

const IngredientsSelector = (props: IngredientsSelectorProps) => {
    const { setToaster, ingredients, dispatcher } = props;

    // const [ingredientList, setIngredientList] = useState<Array<string>>([]);
    const [expandedAccordion, setExpandedAccordion] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [ingredientSuggestions, setIngredientSuggestions] = useState<Array<string>>([]);
    const [modalStatus, setModalStatus] = useState<boolean>(false);
    const [ingredientNameInModal, setIngredientNameInModal] = useState<string>("");

    const { data: suggestions } = useGetIngredientSuggestionsQuery(searchTerm);
    const [publishIngredient] = usePublishIngredientMutation();

    const getIngredientSuggestions = useCallback(() => {
        if (suggestions)
            setIngredientSuggestions(() => Array.from(suggestions.map(s => s.name)) as Array<string>);
        else
            setIngredientSuggestions([]);
    }, [searchTerm]);


    useEffect(() => {
        const timeoutID = setTimeout(getIngredientSuggestions,
            250
        );

        return (() => clearTimeout(timeoutID));
    }, [searchTerm, getIngredientSuggestions]);


    const handleAccordionChange = (i: string) => () => {
        setExpandedAccordion(() => {
            return (expandedAccordion === i ? "" : i)
        })
    }

    const handleModal = (statusDesired: boolean) => {
        if (statusDesired) {
            setIngredientNameInModal(searchTerm);
        }
        setModalStatus(statusDesired);   
    }

    const handleInputChangeInModal = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIngredientNameInModal(event.target.value);
    }

    const handlePublishIngredient = async () => {
        try {
            const retValue = await publishIngredient(ingredientNameInModal);
            if (retValue) setToaster({
                open: true,
                message: `New ingredient "${ingredientNameInModal}" published successfully!`,
                type: "success",
                transition: "Slide",
                key: ingredientNameInModal
            });
        }
        catch (error) {
            console.error("Error while publishing new ingredient in the database: ", error);
            setToaster({
                open: true,
                message: (error as Error).message,
                type: "error",
                transition: "Slide",
                key: ingredientNameInModal
            });
        }
        handleModal(false);
    }

    const onAddNewAccordion = () => {
        dispatcher({
            type: 'add-empty-ingredient',
            payload: '?'
        });
    }
    
    const onAddNewIngredient = (ingredient: string) => {
        if (ingredient !== "?") {
            dispatcher({
                type: 'insert-ingredient',
                payload: ingredient
            } as RecipeCreatedAction);
        }
    }


    return (
        <div>
            <Button onClick={onAddNewAccordion}>
                <Add />
            </Button>
                {ingredients.map((i: string) => {
                    if (i === "?") {
                        return (
                            <Fragment key={i}>
                                <Box display="flex" flexDirection="row" flexWrap="nowrap" alignItems="center">
                                    <Autocomplete id="new_ingredient"
                                        filterOptions={(x) => x}
                                        filterSelectedOptions
                                        isOptionEqualToValue={(option) => ingredientSuggestions.includes(option)}
                                        options={ingredientSuggestions}
                                        inputValue={searchTerm}
                                        onInputChange={(_, newSearchTerm: string) => {setSearchTerm(newSearchTerm)}}
                                        onChange={(_, newValue: string | null) => { if (newValue !== null) onAddNewIngredient(newValue)}}
                                        renderInput={(params) => <TextField {...params} label="Search ingredient..." />}
                                        clearOnBlur={false}
                                        sx={{ width: "500px" }}
                                    />
                                    <Publish 
                                        sx={{ display: searchTerm.length === 0 ? "none" : "", cursor: "pointer"}}
                                        onClick={() => handleModal(true)} 
                                    />
                                </Box> 
                                <Modal 
                                    open={modalStatus} 
                                    onClose={() => handleModal(false)} 
                                    aria-labelledby="modal-title" 
                                    aria-describedby="modal-description"
                                >
                                    <Box style={{ position: "absolute", top: "50%", left: "50%", transform: 'translate(-50%, -50%)', width: "40vw", border: "2px solid #000"}}
                                        display="flex" flexDirection="column" justifyContent="center" alignItems="center" rowGap="30px"
                                        bgcolor="antiquewhite" p={3} >
                                        <Typography id="modal-title" variant="h6" component="h2">
                                            Insert new ingredient in the database
                                        </Typography>
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" rowGap="15px">
                                            <Typography id="modal-description">
                                                Inserting new ingredient in the database:
                                            </Typography>
                                            <TextField required id="new-ingredient" label="Ingredient name" 
                                                        variant="outlined"
                                                        value={ingredientNameInModal} 
                                                        onChange={handleInputChangeInModal}
                                                        fullWidth={true}
                                            />
                                            <Box width="100%" marginTop="15px" display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center" columnGap="5px">
                                                <Button variant="contained" color="success" endIcon={<Publish />}
                                                        onClick={() => handlePublishIngredient()}
                                                >
                                                    Publish
                                                </Button>
                                                <Button 
                                                    variant="contained" color="error" endIcon={<Close />}
                                                    onClick={() => handleModal(false)}
                                                >
                                                    Close
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Modal>
                            </Fragment>                                     
                        )
                    }
                    else {
                        return (
                            <Accordion key={i} expanded={expandedAccordion === i} onChange={handleAccordionChange(i)}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    {i}
                                </AccordionSummary>
                                <AccordionDetails>
                                        <Typography>Lorem ipsum dolor sit amet</Typography>
                                    </AccordionDetails>
                            </Accordion>
                        )
                    }
                })}
        </div>
    );
}

export const IngredientsSelectorMemoized = withIngredients(IngredientsSelector);