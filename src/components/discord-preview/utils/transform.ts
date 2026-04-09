import {
  ButtonStyle,
  ComponentType as DiscordComponentType,
  type RESTPostAPIChannelMessageJSONBody,
  type APIEmbed,
  type APIActionRowComponent,
  type APIButtonComponent,
} from "discord-api-types/v10";
import type {
  DiscordPreviewData,
  EmbedData,
  ActionRowData,
  ButtonData,
} from "../types";

/**
 * Converts a hex color string to a Discord-compatible decimal integer.
 */
function hexToDecimal(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

/**
 * Detects if an emoji string is a snowflake ID or a unicode name.
 * Also handles the animated property.
 */
function transformEmoji(emoji: string, animated?: boolean) {
  if (!emoji) return undefined;

  const isId = /^\d+$/.test(emoji);
  return {
    id: isId ? emoji : undefined,
    name: isId ? undefined : emoji,
    animated: animated || undefined,
  };
}

/**
 * Transforms an internal EmbedData object into a Discord API compatible embed.
 */
function transformEmbed(embed: EmbedData): APIEmbed {
  const result: APIEmbed = {};

  if (embed.title) result.title = embed.title;
  if (embed.description) result.description = embed.description;
  if (embed.url) result.url = embed.url;
  if (embed.color) result.color = hexToDecimal(embed.color);

  // Author
  if (embed.authorName) {
    result.author = {
      name: embed.authorName,
      icon_url: embed.authorIcon || undefined,
      url: embed.authorUrl || undefined,
    };
  }

  // Footer
  if (embed.footer?.text) {
    result.footer = {
      text: embed.footer.text,
      icon_url: embed.footer.iconUrl || undefined,
    };
  }

  // Images
  if (embed.image) result.image = { url: embed.image };
  if (embed.thumbnail) result.thumbnail = { url: embed.thumbnail };

  // Fields (Max 25)
  if (embed.fields && embed.fields.length > 0) {
    result.fields = embed.fields.slice(0, 25).map((f) => ({
      name: f.name || "\u200b",
      value: f.value || "\u200b",
      inline: f.inline,
    }));
  }

  // Timestamp - Must be ISO 8601
  if (embed.showTimestamp) {
    result.timestamp = new Date().toISOString();
  } else if (embed.timestamp) {
    try {
      const d = new Date(embed.timestamp);
      if (!isNaN(d.getTime())) {
        result.timestamp = d.toISOString();
      }
    } catch {
      // ignore invalid dates
    }
  }

  return result;
}

/**
 * Transforms an internal ActionRowData into a Discord API compatible component.
 */
function transformComponent(comp: ActionRowData): APIActionRowComponent<any> {
  return {
    type: DiscordComponentType.ActionRow,
    components: comp.components.map((btn: ButtonData): APIButtonComponent => {
      const emoji = transformEmoji(btn.emoji, btn.animated);
      const label = btn.label || (emoji ? undefined : "Button"); // Discord requires label or emoji

      if (btn.style === "link") {
        return {
          type: DiscordComponentType.Button,
          label,
          style: ButtonStyle.Link,
          url: btn.url || "https://discord.com",
          disabled: btn.disabled,
          emoji,
        };
      }

      const nonLinkStyleMap: Record<
        string,
        | ButtonStyle.Primary
        | ButtonStyle.Secondary
        | ButtonStyle.Success
        | ButtonStyle.Danger
      > = {
        primary: ButtonStyle.Primary,
        secondary: ButtonStyle.Secondary,
        success: ButtonStyle.Success,
        danger: ButtonStyle.Danger,
      };

      return {
        type: DiscordComponentType.Button,
        label,
        style: nonLinkStyleMap[btn.style] || ButtonStyle.Primary,
        custom_id: btn.id || `btn_${Math.random().toString(36).substr(2, 9)}`,
        disabled: btn.disabled,
        emoji,
      };
    }),
  };
}

/**
 * Main transformation function to generate a valid Discord Message JSON.
 */
export function toDiscordJSON(
  data: DiscordPreviewData,
): RESTPostAPIChannelMessageJSONBody {
  const payload: RESTPostAPIChannelMessageJSONBody = {};

  if (data.content) {
    payload.content = data.content;
  }

  if (data.embeds && data.embeds.length > 0) {
    payload.embeds = data.embeds.map(transformEmbed);
  }

  if (data.components && data.components.length > 0) {
    payload.components = data.components.map(transformComponent);
  }

  if (data.flags) {
    payload.flags = data.flags;
  }

  return payload;
}
