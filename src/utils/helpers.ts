import { ChefData, Experience } from "../redux/storetypes";

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