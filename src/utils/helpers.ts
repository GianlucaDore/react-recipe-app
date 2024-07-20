export function capitalizeFirstLetterAfterSpace(string: string) : string {
    const pattern = /\b\w+\b/g; 
    const result = string.replace(pattern, function(word){
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });

    return result;
}