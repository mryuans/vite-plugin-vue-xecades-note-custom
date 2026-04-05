// Conventions for /docs

/**
 * Front matter interface for markdown files.
 */
export interface MarkdownFrontMatter {
    /** Article title */
    title: string;

    /** Display title */
    displayTitle?: string;

    /** Whether to show comments */
    comment?: boolean;

    /** Whether to show timestamp, i.e. Creation & Modification time */
    timestamp?: boolean;

    /** Specify an overarching layout (e.g., 'home' for Hero layout) */
    layout?: string;
}

/**
 * Unparsed nav node.
 */
export type RawNavNode = Record<string, RawNavNode[] | string>;

/**
 * Unparsed YAML configurations.
 */
export interface RawConfig {
    /** Navigation data. */
    nav: RawNavNode[];

    /** Category icons. */
    icon: Record<string, string>;
}
