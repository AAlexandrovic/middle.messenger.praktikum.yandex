declare module "*.hbs?raw" {
    const content: string;
    return content;
}

declare module "*.hbs" {
    const content: string;
    return content;
}
