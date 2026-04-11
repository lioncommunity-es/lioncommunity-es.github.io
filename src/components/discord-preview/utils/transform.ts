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
} from "@/types";

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

import type {
  V2TopLevelComponent,
  V2ContainerChild,
  V2Accessory,
} from "@/types/v2";

/**
 * Transforms a V2 component to the API JSON format
 */
function transformV2Component(
  comp: V2TopLevelComponent | V2ContainerChild,
): any {
  if (comp.kind === "text_display") {
    return {
      type: 10,
      content: comp.content,
    };
  }

  if (comp.kind === "separator") {
    return {
      type: 14,
      divider: comp.divider,
      spacing: comp.spacing,
    };
  }

  if (comp.kind === "media_gallery") {
    return {
      type: 12,
      items: comp.items
        .filter((i) => i.url)
        .map((i) => ({
          media: { url: i.url },
          description: i.description || undefined,
          spoiler: i.spoiler || false,
        })),
    };
  }

  if (comp.kind === "action_row") {
    return {
      type: 1,
      components: comp.components.map((btn) => {
        const emoji = btn.emoji
          ? transformEmoji(btn.emoji, btn.animated)
          : undefined;
        const label = btn.label || (emoji ? undefined : "Button");

        if (btn.style === "link") {
          return {
            type: 2,
            label,
            style: ButtonStyle.Link,
            url: btn.url || "https://discord.com",
            disabled: btn.disabled,
            emoji,
          };
        }

        const nonLinkStyleMap: Record<string, ButtonStyle> = {
          primary: ButtonStyle.Primary,
          secondary: ButtonStyle.Secondary,
          success: ButtonStyle.Success,
          danger: ButtonStyle.Danger,
        };

        return {
          type: 2,
          label,
          style: nonLinkStyleMap[btn.style] || ButtonStyle.Primary,
          custom_id: btn.id || `btn_${Math.random().toString(36).substr(2, 9)}`,
          disabled: btn.disabled,
          emoji,
        };
      }),
    };
  }

  if (comp.kind === "section") {
    const accessory = comp.accessory
      ? (function calcAcc(acc: V2Accessory): any {
          if (acc.kind === "thumbnail") {
            return {
              type: 11,
              media: { url: acc.url },
              description: acc.description,
              spoiler: acc.spoiler,
            };
          }
          if (acc.kind === "button_accessory") {
            const emoji = acc.emoji ? transformEmoji(acc.emoji) : undefined;
            const label = acc.label || (emoji ? undefined : "Button");

            if (acc.style === "link") {
              return {
                type: 2,
                label,
                style: ButtonStyle.Link,
                url: acc.url || "https://discord.com",
                disabled: acc.disabled,
                emoji,
              };
            }

            const nonLinkStyleMap: Record<string, ButtonStyle> = {
              primary: ButtonStyle.Primary,
              secondary: ButtonStyle.Secondary,
              success: ButtonStyle.Success,
              danger: ButtonStyle.Danger,
            };

            return {
              type: 2,
              label,
              style: nonLinkStyleMap[acc.style] || ButtonStyle.Primary,
              custom_id:
                acc.id || `btn_${Math.random().toString(36).substr(2, 9)}`,
              disabled: acc.disabled,
              emoji,
            };
          }
          return undefined;
        })(comp.accessory)
      : undefined;

    return {
      type: 9,
      components: comp.texts.filter((t) => t.content).map(transformV2Component),
      accessory,
    };
  }

  if (comp.kind === "container") {
    return {
      type: 17,
      accent_color: comp.accentColor
        ? hexToDecimal(comp.accentColor)
        : undefined,
      spoiler: comp.spoiler || false,
      components: comp.children.map(transformV2Component),
    };
  }

  return {};
}

/**
 * Converts a decimal integer to a hex color string.
 */
function decimalToHex(decimal: number | undefined | null): string {
  if (decimal === undefined || decimal === null || isNaN(decimal)) return "#5865f2"; // Discord blurple default
  return "#" + decimal.toString(16).padStart(6, "0");
}

/**
 * Parses a Discord Message JSON back into an internal DiscordPreviewData object.
 */
export function fromDiscordJSON(payload: any): DiscordPreviewData {
  const result: DiscordPreviewData = {
    content: payload.content || "",
    embeds: [],
    components: [],
    ephemeral: !!(payload.flags && (payload.flags & 64)),
    edited: false,
    author: {
      name: payload.username || "LionBot",
      avatar: payload.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png",
      bot: true,
      verified: true,
    },
  };

  const isV2 = !!(payload.flags && (payload.flags & 32768));
  result.useV2 = isV2;
  result.flags = payload.flags;

  if (payload.embeds && Array.isArray(payload.embeds)) {
    result.embeds = payload.embeds.map((e: any) => ({
      id: crypto.randomUUID(),
      title: e.title || "",
      description: e.description || "",
      url: e.url || "",
      color: e.color !== undefined ? decimalToHex(e.color) : "#5865f2",
      footer: {
        text: e.footer?.text || "",
        iconUrl: e.footer?.icon_url || "",
      },
      image: e.image?.url || "",
      thumbnail: e.thumbnail?.url || "",
      authorName: e.author?.name || "",
      authorIcon: e.author?.icon_url || "",
      authorUrl: e.author?.url || "",
      showTimestamp: !!e.timestamp,
      timestamp: e.timestamp,
      fields: Array.isArray(e.fields)
        ? e.fields.map((f: any) => ({
            id: crypto.randomUUID(),
            name: f.name || "",
            value: f.value || "",
            inline: !!f.inline,
          }))
        : [],
    }));
  }

  const styleFromInt = (styleInt: number) => {
    switch (styleInt) {
      case 2: return "secondary";
      case 3: return "success";
      case 4: return "danger";
      case 5: return "link";
      case 1:
      default: return "primary";
    }
  };

  if (!isV2 && payload.components && Array.isArray(payload.components)) {
    result.components = payload.components
      .filter((row: any) => row.type === 1)
      .map((row: any) => ({
        type: 1,
        id: crypto.randomUUID(),
        components: Array.isArray(row.components)
          ? row.components
              .filter((c: any) => c.type === 2)
              .map((c: any) => ({
                type: 2,
                id: c.custom_id || crypto.randomUUID(),
                label: c.label || "",
                style: styleFromInt(c.style),
                url: c.url || "",
                disabled: !!c.disabled,
                emoji: c.emoji?.id || c.emoji?.name || "",
                animated: !!c.emoji?.animated,
              }))
          : [],
      }));
  }

  if (isV2 && payload.components && Array.isArray(payload.components)) {
    result.v2Components = payload.components.map((c: any) => {
      if (c.type === 10)
        return { kind: "text_display", id: crypto.randomUUID(), content: c.content || "" };
      if (c.type === 1)
        return {
          kind: "action_row",
          id: crypto.randomUUID(),
          components: Array.isArray(c.components)
            ? c.components.map((btn: any) => ({
                id: btn.custom_id || crypto.randomUUID(),
                label: btn.label || "",
                style: styleFromInt(btn.style),
                url: btn.url || "",
                disabled: !!btn.disabled,
                emoji: btn.emoji?.id || btn.emoji?.name || "",
                animated: !!btn.emoji?.animated,
              }))
            : [],
        };
      if (c.type === 14)
        return {
          kind: "separator",
          id: crypto.randomUUID(),
          divider: !!c.divider,
          spacing: c.spacing || 1,
        };
      if (c.type === 12)
        return {
          kind: "media_gallery",
          id: crypto.randomUUID(),
          items: Array.isArray(c.items)
            ? c.items.map((i: any) => ({
                url: i.media?.url || "",
                description: i.description,
                spoiler: i.spoiler,
              }))
            : [],
        };

      if (c.type === 9) {
        const texts = Array.isArray(c.components)
          ? c.components
              .filter((t: any) => t.type === 10)
              .map((t: any) => ({
                kind: "text_display",
                id: crypto.randomUUID(),
                content: t.content || "",
              }))
          : [];
        let accessory: any = null;
        if (c.accessory) {
          if (c.accessory.type === 11)
            accessory = {
              kind: "thumbnail",
              url: c.accessory.media?.url || "",
              description: c.accessory.description,
              spoiler: c.accessory.spoiler,
            };
          if (c.accessory.type === 2)
            accessory = {
              kind: "button_accessory",
              id: c.accessory.custom_id || crypto.randomUUID(),
              label: c.accessory.label || "",
              style: styleFromInt(c.accessory.style),
              url: c.accessory.url,
              disabled: !!c.accessory.disabled,
              emoji: c.accessory.emoji?.id || c.accessory.emoji?.name || "",
            };
        }
        return { kind: "section", id: crypto.randomUUID(), texts, accessory };
      }

      if (c.type === 17)
        return {
          kind: "container",
          id: crypto.randomUUID(),
          accentColor: c.accent_color !== undefined ? decimalToHex(c.accent_color) : undefined,
          spoiler: !!c.spoiler,
          children: Array.isArray(c.components)
            ? c.components
                .map((child: any) => {
                  if (child.type === 10)
                    return { kind: "text_display", id: crypto.randomUUID(), content: child.content || "" };
                  if (child.type === 14)
                    return { kind: "separator", id: crypto.randomUUID(), divider: !!child.divider, spacing: child.spacing || 1 };
                  if (child.type === 1)
                    return {
                      kind: "action_row",
                      id: crypto.randomUUID(),
                      components: Array.isArray(child.components)
                        ? child.components.map((btn: any) => ({
                            id: btn.custom_id || crypto.randomUUID(),
                            label: btn.label || "",
                            style: styleFromInt(btn.style),
                            url: btn.url || "",
                            disabled: !!btn.disabled,
                            emoji: btn.emoji?.id || btn.emoji?.name || "",
                            animated: !!btn.emoji?.animated,
                          }))
                        : [],
                    };
                  if (child.type === 12)
                    return {
                      kind: "media_gallery",
                      id: crypto.randomUUID(),
                      items: Array.isArray(child.items)
                        ? child.items.map((i: any) => ({
                            url: i.media?.url || "",
                            description: i.description,
                            spoiler: i.spoiler,
                          }))
                        : [],
                    };
                  return null;
                })
                .filter(Boolean)
            : [],
        };

      return { kind: "text_display", id: crypto.randomUUID(), content: "" };
    });
  }

  return result;
}

/**
 * Main transformation function to generate a valid Discord Message JSON.
 */
export function toDiscordJSON(
  data: DiscordPreviewData,
): RESTPostAPIChannelMessageJSONBody {
  const payload: RESTPostAPIChannelMessageJSONBody = {};

  if (data.useV2) {
    if (data.v2Components && data.v2Components.length > 0) {
      payload.components = data.v2Components.map(transformV2Component) as any;
    }
    payload.flags = (data.flags || 0) | 32768; // 32768 is IS_COMPONENTS_V2
  } else {
    // V1 Logic
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
  }

  // Webhook integration mappings
  if (data.author) {
    if (data.author.name) (payload as any).username = data.author.name;
    if (data.author.avatar) (payload as any).avatar_url = data.author.avatar;
  }

  return payload;
}
