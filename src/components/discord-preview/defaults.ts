import {
  type ButtonType,
  type EmbedData,
  type EmbedField,
  type DiscordPreviewData,
  ComponentType,
  type ActionRowData,
  type ButtonData,
} from "@/types";
import type {
  V2TopLevelComponent,
  V2Container,
  V2Section,
  V2TextDisplay,
  V2Separator,
  V2MediaGallery,
  V2ActionRow,
  V2ActionRowButton,
} from "@/types/v2";

export const DEFAULT_DATA: DiscordPreviewData = {
  author: {
    name: "LionBot",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    bot: true,
    verified: true,
  },
  content:
    "# ¡Bienvenido! 🎉\n\n## Comunidad Lion\n-# Somos una comunidad de desarrolladores.\n\nRevisa las reglas y preséntate en ||este mensaje secreto||. [Visita nuestra web](https://lioncommunity.es)",
  embeds: [
    {
      id: crypto.randomUUID(),
      color: "#f97316",
      title: "Información del servidor",
      url: "https://lioncommunity.es",
      description:
        "### Canales importantes\n- `#general` — Conversación general\n- `#proyectos` — Comparte tus proyectos\n- `#ayuda` — Pide ayuda técnica",
      fields: [
        { id: crypto.randomUUID(), name: "Miembros", value: "1,234", inline: true },
        { id: crypto.randomUUID(), name: "Online", value: "456", inline: true },
        { id: crypto.randomUUID(), name: "Nivel", value: "⭐ 3", inline: true },
      ],
      footer: {
        text: "Lion Community",
        iconUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      thumbnail: "",
      image: "",
      authorName: "",
      authorIcon: "",
      authorUrl: "",
      showTimestamp: false,
    },
  ],
  components: [
    {
      type: ComponentType.ActionRow,
      id: crypto.randomUUID(),
      components: [
        {
          type: ComponentType.Button,
          id: crypto.randomUUID(),
          label: "Aceptar reglas",
          style: "primary",
          emoji: "✅",
        },
        {
          type: ComponentType.Button,
          id: crypto.randomUUID(),
          label: "Web",
          style: "secondary",
          emoji: "🌐",
        },
        {
          type: ComponentType.Button,
          id: crypto.randomUUID(),
          label: "GitHub",
          style: "link",
          emoji: "",
          url: "https://github.com",
        },
      ],
    },
  ],
  ephemeral: false,
  edited: false,
};

export function createEmptyEmbed(): EmbedData {
  return {
    id: crypto.randomUUID(),
    color: "#5865f2",
    title: "",
    url: "",
    description: "",
    fields: [] as EmbedField[],
    footer: { text: "", iconUrl: "" },
    thumbnail: "",
    image: "",
    authorName: "",
    authorIcon: "",
    authorUrl: "",
    showTimestamp: false,
  };
}

export function createEmptyActionRow(): ActionRowData {
  return {
    type: ComponentType.ActionRow,
    id: crypto.randomUUID(),
    components: [],
  };
}

export function createEmptyButton(): ButtonData {
  return {
    type: ComponentType.Button,
    id: crypto.randomUUID(),
    label: "Botón",
    style: "primary",
    emoji: "",
  };
}

// ─── V2 factory functions ────────────────────────────────────────────────────

export function createV2TextDisplay(content = ""): V2TextDisplay {
  return { kind: "text_display", id: crypto.randomUUID(), content };
}

export function createV2Separator(): V2Separator {
  return {
    kind: "separator",
    id: crypto.randomUUID(),
    divider: true,
    spacing: 1,
  };
}

export function createV2MediaGallery(): V2MediaGallery {
  return {
    kind: "media_gallery",
    id: crypto.randomUUID(),
    items: [{ url: "", description: "" }],
  };
}

export function createV2ActionRowButton(): V2ActionRowButton {
  return {
    id: crypto.randomUUID(),
    label: "Botón",
    style: "primary",
    emoji: "",
  };
}

export function createV2ActionRow(): V2ActionRow {
  return {
    kind: "action_row",
    id: crypto.randomUUID(),
    components: [createV2ActionRowButton()],
  };
}

export function createV2Section(): V2Section {
  return {
    kind: "section",
    id: crypto.randomUUID(),
    texts: [createV2TextDisplay("Texto de la sección")],
    accessory: { kind: "thumbnail", url: "", description: "" },
  };
}

export function createV2Container(): V2Container {
  return {
    kind: "container",
    id: crypto.randomUUID(),
    accentColor: "#5865f2",
    spoiler: false,
    children: [createV2TextDisplay("Contenido del contenedor")],
  };
}
