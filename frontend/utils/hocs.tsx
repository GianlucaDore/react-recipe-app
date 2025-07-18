import { useContext, ComponentType, memo, PropsWithRef } from "react";
import { RecipeCreatedContext } from "../pages/RecipeCreator";
import { RecipeCreatedState } from "./interfaces";

export const withPreparation = <T extends object>(Component: ComponentType<T>) => {
    const MemoizedComponent = memo(Component);

    return (props: Omit<T, "preparation">) => {
        const { preparation } = useContext<RecipeCreatedState>(RecipeCreatedContext);
        
        return <MemoizedComponent {...(props as PropsWithRef<T>)} preparation={preparation} />;
    };
};

export const withImage = <T extends object>(Component: ComponentType<T>) => {
    const MemoizedComponent = memo(Component);

    return (props: Omit<T, "imageURL">) => {
        const { imageURL } = useContext<RecipeCreatedState>(RecipeCreatedContext);
        
        return <MemoizedComponent {...(props as PropsWithRef<T>)} currentImageURL={imageURL} />;
    };
};

export const withIngredients = <T extends object>(Component: ComponentType<T>) => {
    const MemoizedComponent = memo(Component);

    return (props: Omit<T, "ingredients">) => {
        const { ingredients } = useContext<RecipeCreatedState>(RecipeCreatedContext);
        
        return <MemoizedComponent {...(props as PropsWithRef<T>)} ingredients={ingredients} />;
    };
};

export const withDetails = <T extends object>(Component: ComponentType<T>) => {
    const MemoizedComponent = memo(Component);

    return (props: Omit<T, "title" | "difficulty" | "minutesNeeded">) => {
        const { title, difficulty, minutesNeeded } = useContext<RecipeCreatedState>(RecipeCreatedContext);
        
        return <MemoizedComponent {...(props as PropsWithRef<T>)} title={title} difficulty={difficulty} minutesNeeded={minutesNeeded} />;
    };
};