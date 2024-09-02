import { Experience, UserData } from "../redux/storetypes";

export function capitalizeFirstLetterAfterSpace(string: string) : string {
    const pattern = /\b\w+\b/g; 
    const result = string.replace(pattern, function(word){
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });

    return result;
}

export function createImageFileName(recipeTitle: string, extension: string) : string | boolean {
    const recipeTitleUnderscored = recipeTitle.replace(' ', '_');
    if (extension.match('/jpg')) {
        return recipeTitleUnderscored + '.jpg';
    }
    if (extension.match('/jpeg')) {
        return recipeTitleUnderscored + '.jpeg';
    }
    if (extension.match('/png')) {
        return recipeTitleUnderscored + '.png';
    }
    else 
        return false;
}

export function calculateChefExperience(userData: UserData) : Experience {
    const userScore = userData.likesReceived * 10 + userData.totalViews + userData.publishedRecipes * 5; 

    let experience : Experience = { level: "Unexperienced" };

    if (userScore > 1000) experience = { level: "Top" };
    if (userScore <= 1000 && userScore > 750) experience = { level: "Experienced" };
    if (userScore <= 750 && userScore > 250) experience = { level: "Practicing" };
    if (userScore <= 250) experience = { level: "Unexperienced" };

    return experience;
}