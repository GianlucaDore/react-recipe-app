import { Avatar, Box, Button, Grid, Typography } from "@mui/material"
import { ChefData, Experience } from "../redux/storetypes"
import { useEffect, useState } from "react";
import { calculateChefExperience } from "../utils/helpers";
import { Favorite, OpenInNew, Visibility } from "@mui/icons-material";
import defaultChef from '../assets/default_chef.jpeg';
import { useNavigate } from "react-router";

export interface ChefTitleProps {
    chefData: ChefData | undefined;
    showFullDetails: boolean;
}

export const ChefTitle = (props: ChefTitleProps) => {
    const { chefData, showFullDetails } = props;

    const [experience, setExperience] = useState<Experience>({ level: "Unexperienced" });

    const navigate = useNavigate();

    useEffect(() => {
        setExperience(calculateChefExperience(chefData));
    }, [chefData]);


    const handleGoToUserProfile = () => {
        if (chefData && chefData.uid) {
            navigate(`/user/${chefData?.uid}`);
        }
        else {
            // navigate(`/notfound`);
        }
    }


    if (showFullDetails) {
        return (
            <Box position="relative" width="100%" display="flex" flexDirection="column" alignItems="center" sx={getStyleByExperienceLevel(experience.level)}>
                <Typography width="fit-content" padding="5px 15px 5px 15px" marginBottom="10px" variant="h5" color="#FFF7EE" fontFamily="bangers, sans-serif" sx={{ border: "1px solid white", borderRadius: "15px" }}>
                    {experience.level === "N/A" ? experience.level : (experience.level + " Chef")}
                </Typography>
                <Box width="100%" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Avatar
                        src={(chefData?.photoURL) ? chefData.photoURL : defaultChef} 
                        alt={(chefData?.displayName) ? chefData.displayName : "Generic chef"}
                        sx={{ width: 35, height: 35 }}
                    />
                
                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                            <Typography variant="h5">{chefData?.displayName}</Typography>
                            <Typography variant="h6">{chefData?.email}</Typography>
                        </Box>

                    <Grid container width="fit-content" direction="row" spacing={2}>
                        <Grid item container direction="column" xs={8} justifyContent="space-evenly">
                            <Favorite />
                            <Visibility />
                        </Grid>
                        <Grid item container width="fit-content" direction="column" xs={4} justifyContent="space-evenly" alignContent="flex-start" paddingLeft="3px !important">
                            <Typography component="p">{chefData?.likesReceived}</Typography>
                            <Typography component="p">{chefData?.totalViews}</Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box position="absolute" top="0" right="0">
                    <Button onClick={handleGoToUserProfile}>
                        <OpenInNew />
                    </Button>
                </Box>
            </Box>
            
        )
    }
    else {
        return (
            <Box sx={getStyleByExperienceLevel(experience.level)}>
                <Typography>{experience.level === "N/A" ? experience.level : (experience.level + " Chef")}</Typography>
            </Box>
        )
    }
}

const masterStyle = {
    border: "1px solid black",
    borderRadius: "15px",
    padding: "5px 15px 5px 15px",
    backgroundColor: 'black',
    color: 'white'
}

const experiencedStyle = {
    border: "1px solid #1b7ced",
    borderRadius: "15px",
    padding: "5px 15px 5px 15px",
    backgroundColor: '#1b7ced',
    color: 'white'
}

const practicingStyle = {
    border: "1px solid #ab2330",
    borderRadius: "15px",
    padding: "5px 15px 5px 15px",
    backgroundColor: '#ab2330',
    color: 'white'
}

const unexperiencedStyle = {
    border: "1px solid #3B2F2F",
    borderRadius: "15px",
    padding: "5px 15px 5px 15px",
    backgroundColor: '#3B2F2F',
    color: 'white'
}

const naStyle = {
    border: "1px solid #A9A9A9",
    borderRadius: "15px",
    padding: "5px 15px 5px 15px",
    backgroundColor: '#A9A9A9',
    color: 'white'
}

const getStyleByExperienceLevel = (level: string | undefined) => {
    if (level) {
        switch (level) {
            case "Master":
                return masterStyle;
            case "Experienced":
                return experiencedStyle;
            case "Practicing":
                return practicingStyle;
            case "Unexperienced":
                return unexperiencedStyle;
            case "N/A":
                return naStyle;
        }
    }
    else return naStyle;
}
