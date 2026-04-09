import type { RESTPostAPIChannelMessageJSONBody, APIEmbed } from "discord-api-types/v10";
export type { V2TopLevelComponent, V2Container, V2Section, V2TextDisplay, V2Separator, V2MediaGallery, V2MediaGalleryItem, V2ActionRow, V2ActionRowButton, V2Accessory, V2ThumbnailAccessory, V2ButtonAccessory, V2ContainerChild } from "./v2";

export type ButtonType = "primary" | "secondary" | "success" | "danger" | "link";

export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
}

export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedData {
  id: string;
  color: string;
  title: string;
  url: string;
  description: string;
  fields: EmbedField[];
  footer: { text: string; iconUrl?: string };
  thumbnail: string;
  image: string;
  authorName: string;
  authorIcon: string;
  authorUrl: string;
  showTimestamp?: boolean;
  timestamp?: string;
}

export interface ButtonData {
  type: ComponentType.Button;
  id: string;
  label: string;
  style: ButtonType;
  emoji: string;
  animated?: boolean;
  url?: string;
  disabled?: boolean;
}

export interface ActionRowData {
  type: ComponentType.ActionRow;
  id: string;
  components: ButtonData[];
}

export type MessageComponent = ActionRowData;

export interface AuthorData {
  name: string;
  avatar: string;
  bot: boolean;
  verified: boolean;
  roleColor?: string;
}

export interface DiscordPreviewData {
  author: AuthorData;
  content: string;
  embeds: EmbedData[];
  components: MessageComponent[];
  ephemeral: boolean;
  edited: boolean;
  timestamp?: string;
  flags?: number;
  /** When true, use V2 components and set IS_COMPONENTS_V2 flag */
  useV2?: boolean;
  /** V2 top-level components (replaces content/embeds when useV2 is true) */
  v2Components?: import("./v2").V2TopLevelComponent[];
}

// Export the official types for use in other components
export type DiscordMessagePayload = RESTPostAPIChannelMessageJSONBody;
export type DiscordApiEmbed = APIEmbed;
