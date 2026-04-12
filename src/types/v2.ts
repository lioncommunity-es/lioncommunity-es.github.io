/** Discord Components V2 type definitions */

export type V2ComponentType =
  | "container"
  | "section"
  | "separator"
  | "text_display"
  | "media_gallery"
  | "action_row";

// ─── Leaf types ──────────────────────────────────────────────────────────────

export interface V2TextDisplay {
  kind: "text_display";
  id: string;
  content: string;
}

export interface V2Separator {
  kind: "separator";
  id: string;
  divider: boolean;
  spacing: 1 | 2; // 1 = small, 2 = large
}

export interface V2MediaGalleryItem {
  url: string;
  description?: string;
  spoiler?: boolean;
}

export interface V2MediaGallery {
  kind: "media_gallery";
  id: string;
  items: V2MediaGalleryItem[]; // 1–10
}

export interface V2ThumbnailAccessory {
  kind: "thumbnail";
  url: string;
  description?: string;
  spoiler?: boolean;
}

export interface V2ButtonAccessory {
  kind: "button_accessory";
  id: string;
  label: string;
  style: "primary" | "secondary" | "success" | "danger" | "link";
  emoji?: string;
  url?: string;
  disabled?: boolean;
}

export type V2Accessory = V2ThumbnailAccessory | V2ButtonAccessory;

// ─── Composite types ─────────────────────────────────────────────────────────

/** V1 ActionRow embedded inside V2 (buttons only) */
export interface V2ActionRow {
  kind: "action_row";
  id: string;
  components: V2ActionRowButton[];
}

export interface V2ActionRowButton {
  id: string;
  label: string;
  style: "primary" | "secondary" | "success" | "danger" | "link";
  emoji?: string;
  animated?: boolean;
  url?: string;
  disabled?: boolean;
}

export interface V2Section {
  kind: "section";
  id: string;
  /** Up to 3 TextDisplay components on the left */
  texts: V2TextDisplay[];
  /** One accessory on the right */
  accessory: V2Accessory;
}

/** MessageComponent allowed inside a container */
export type V2ContainerChild =
  | V2TextDisplay
  | V2Separator
  | V2MediaGallery
  | V2Section
  | V2ActionRow;

export interface V2Container {
  kind: "container";
  id: string;
  accentColor?: string; // hex string e.g. "#5865f2"
  spoiler?: boolean;
  children: V2ContainerChild[];
}

/** Top-level V2 component (what lives directly in the message components array) */
export type V2TopLevelComponent =
  | V2Container
  | V2TextDisplay
  | V2Separator
  | V2MediaGallery
  | V2Section
  | V2ActionRow;
