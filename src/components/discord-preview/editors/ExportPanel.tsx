import type { DiscordPreviewData } from "../types";
import { EditorCard, SectionHeader } from "./primitives";

interface Props {
  data: DiscordPreviewData;
}

export default function ExportPanel({ data }: Props) {
  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("JSON copiado al portapapeles");
  };

  const copyAPIPayload = () => {
    const apiPayload = {
      content: data.content || undefined,
      embeds: data.embeds.map((e) => ({
        color: parseInt(e.color.replace("#", ""), 16),
        title: e.title || undefined,
        url: e.url || undefined,
        description: e.description || undefined,
        author: e.authorName
          ? {
              name: e.authorName,
              icon_url: e.authorIcon || undefined,
              url: e.authorUrl || undefined,
            }
          : undefined,
        thumbnail: e.thumbnail ? { url: e.thumbnail } : undefined,
        image: e.image ? { url: e.image } : undefined,
        fields: e.fields.length
          ? e.fields.map((f) => ({
              name: f.name,
              value: f.value,
              inline: f.inline,
            }))
          : undefined,
        footer: e.footer.text
          ? {
              text: e.footer.text,
              icon_url: e.footer.iconUrl || undefined,
            }
          : undefined,
      })),
      components: data.components.length
        ? data.components.map((row) => ({
            type: 1, // Action Row
            components: row.components.map((b) => ({
              type: 2, // Button
              style:
                b.style === "primary"
                  ? 1
                  : b.style === "secondary"
                    ? 2
                    : b.style === "success"
                      ? 3
                      : b.style === "danger"
                        ? 4
                        : 5, // 5 = Link
              label: b.label,
              emoji: b.emoji ? { name: b.emoji } : undefined,
              url: b.style === "link" ? b.url : undefined,
              disabled: b.disabled || undefined,
            })),
          }))
        : undefined,
    };
    navigator.clipboard.writeText(JSON.stringify(apiPayload, null, 2));
    alert("API Payload copiado al portapapeles");
  };

  return (
    <EditorCard>
      <SectionHeader title="Exportar" />
      <div className="flex gap-3">
        <button
          onClick={copyJSON}
          className="flex-1 rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-95"
        >
          Copiar JSON Interno
        </button>
        <button
          onClick={copyAPIPayload}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white/50 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 active:scale-95"
        >
          Copiar API Payload
        </button>
      </div>
      <p className="mt-3 text-[10px] text-center text-white/20 italic">
        El API Payload está listo para ser enviado a Discord directamente.
      </p>
    </EditorCard>
  );
}
