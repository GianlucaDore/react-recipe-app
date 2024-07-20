export interface ToasterData {
    open: boolean;
    message: string;
    type: "success" | "error" | "warning";
    transition: "Slide"| "Grow";
    key: string | null;
}