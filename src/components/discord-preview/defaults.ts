import {
  type ButtonType,
  type EmbedData,
  type EmbedField,
  type DiscordPreviewData,
  ComponentType,
  type ActionRowData,
  type ButtonData,
} from "./types";

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
        { name: "Miembros", value: "1,234", inline: true },
        { name: "Online", value: "456", inline: true },
        { name: "Nivel", value: "⭐ 3", inline: true },
      ],
      footer: { text: "Lion Community • Hoy a las 13:00" },
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
    footer: { text: "" },
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
