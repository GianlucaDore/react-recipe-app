import { setMessageSnackbar, setOpenSnackbar, setSeveritySnackbar } from "../redux/snackbarSlice";
import { AppDispatch } from "../redux/store";
import { ChefData, Experience } from "../redux/storetypes";

export function capitalizeFirstLetterAfterSpace(string: string) : string {
    const pattern = /\b\w+\b/g; 
    const result = string.replace(pattern, function(word){
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });

    return result;
}

export function createImageFileName(title: string, extension: string) : string | boolean {
    const titleUnderscored = title.replace(' ', '_');
    if (extension.match('/jpg')) {
        return titleUnderscored + '.jpg';
    }
    if (extension.match('/jpeg')) {
        return titleUnderscored + '.jpeg';
    }
    if (extension.match('/png')) {
        return titleUnderscored + '.png';
    }
    else 
        return false;
}

export function calculateChefExperience(chefData: ChefData | undefined) : Experience {
    let experience : Experience = { level: "N/A" };
    
    if (chefData) {
        const userScore = chefData.likesReceived * 10 + chefData.totalViews + chefData.publishedRecipes * 5; 

        if (userScore > 1000) experience = { level: "Master" };
        if (userScore <= 1000 && userScore > 750) experience = { level: "Experienced" };
        if (userScore <= 750 && userScore > 250) experience = { level: "Practicing" };
        if (userScore <= 250) experience = { level: "Unexperienced" };
    }

    return experience;
}

export function getInitialsForChef(chefName: string | null | undefined) : string {
    if (chefName === undefined || chefName === null || chefName === '' || chefName === 'Unknown') {
        return '?';
    }
    const initials = chefName.split(' ')
                        .map((nameSubstring) => nameSubstring.charAt(0).toUpperCase())
                        .join('');
    return initials;
}

export function getAlphabeticalShorthandForNumber(value: number | undefined): string {
    if (value === undefined) {
        return 'N/A';
    }
    if (value > 999) {
        let shorthand;
        if (value > 999999) {
            shorthand = Math.round(value / 1000000 * 10)/10;
            return (shorthand.toString() + 'M');
        }
        if (value > 99999) {
            shorthand = Math.round(value / 1000);
            return (shorthand.toString() + 'k');
        }
        else {
            shorthand = Math.round(value / 1000 * 10)/10;
            return (shorthand.toString() + 'k');
        }
    }
    else {
        return value.toString();
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    else if (typeof error === "string") {
        return error;
    }
    else if (typeof error === "object" && error !== null 
            && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    else return "Errore sconosciuto";
}

export function showSnackbarError(dispatch: AppDispatch, error: unknown) {
  const message: string = getErrorMessage(error);
  dispatch(setMessageSnackbar(message));
  dispatch(setSeveritySnackbar("error"));
  dispatch(setOpenSnackbar());
}

export function showSnackbarSuccess(dispatch: AppDispatch, success: string) {
    dispatch(setMessageSnackbar(success));
    dispatch(setSeveritySnackbar("success"));
    dispatch(setOpenSnackbar());
}