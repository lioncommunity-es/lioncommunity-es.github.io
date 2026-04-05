import type { EmbedData, EmbedField } from "../types";
import { Label, Input, Textarea, SectionHeader, DeleteBtn } from "./primitives";

/* ── Field Editor ─────────────────────────────────── */

function FieldEditor({
  field,
  onUpdate,
  onDelete,
}: {
  field: EmbedField;
  onUpdate: (f: EmbedField) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        <Input
          value={field.name}
          onChange={(v) => onUpdate({ ...field, name: v })}
          placeholder="Nombre"
        />
        <Input
          value={field.value}
          onChange={(v) => onUpdate({ ...field, value: v })}
          placeholder="Valor"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-1 pt-2">
        <input
          type="checkbox"
          checked={field.inline ?? false}
          onChange={(e) => onUpdate({ ...field, inline: e.target.checked })}
          className="h-3 w-3 rounded accent-orange-500"
        />
        <span className="text-[10px] text-white/30">Inline</span>
      </label>
      <div className="pt-1.5">
        <DeleteBtn onClick={onDelete} />
      </div>
    </div>
  );
}

/* ── Embed Editor ─────────────────────────────────── */

interface Props {
  embed: EmbedData;
  idx: number;
  onUpdate: (e: EmbedData) => void;
  onDelete: () => void;
}

export default function EmbedEditor({ embed, idx, onUpdate, onDelete }: Props) {
  const updateField = (fi: number, f: EmbedField) => {
    const fields = [...embed.fields];
    fields[fi] = f;
    onUpdate({ ...embed, fields });
  };

  const deleteField = (fi: number) => {
    onUpdate({ ...embed, fields: embed.fields.filter((_, i) => i !== fi) });
  };

  const addField = () => {
    onUpdate({
      ...embed,
      fields: [...embed.fields, { name: "", value: "", inline: false }],
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/5 bg-white/2 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/40">
          Embed {idx + 1}
        </span>
        <DeleteBtn onClick={onDelete} />
      </div>

      {/* Color + Title */}
      <div className="flex gap-2">
        <div className="shrink-0">
          <Label>Color</Label>
          <input
            type="color"
            value={embed.color}
            onChange={(e) => onUpdate({ ...embed, color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
          />
        </div>
        <div className="flex-1">
          <Label>Título</Label>
          <Input
            value={embed.title}
            onChange={(v) => onUpdate({ ...embed, title: v })}
            placeholder="Título del embed"
          />
        </div>
      </div>

      <div>
        <Label>URL del título</Label>
        <Input
          value={embed.url}
          onChange={(v) => onUpdate({ ...embed, url: v })}
          placeholder="https://..."
        />
      </div>

      {/* Author */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Autor</Label>
          <Input
            value={embed.authorName}
            onChange={(v) => onUpdate({ ...embed, authorName: v })}
            placeholder="Nombre"
          />
        </div>
        <div>
          <Label>Icono autor</Label>
          <Input
            value={embed.authorIcon}
            onChange={(v) => onUpdate({ ...embed, authorIcon: v })}
            placeholder="URL"
          />
        </div>
        <div>
          <Label>URL autor</Label>
          <Input
            value={embed.authorUrl}
            onChange={(v) => onUpdate({ ...embed, authorUrl: v })}
            placeholder="URL"
          />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={embed.description}
          onChange={(v) => onUpdate({ ...embed, description: v })}
          placeholder="Soporta **negrita**, *cursiva*, `código`, <@mención>, <#canal>"
          rows={4}
        />
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Thumbnail</Label>
          <Input
            value={embed.thumbnail}
            onChange={(v) => onUpdate({ ...embed, thumbnail: v })}
            placeholder="URL de imagen"
          />
        </div>
        <div>
          <Label>Imagen</Label>
          <Input
            value={embed.image}
            onChange={(v) => onUpdate({ ...embed, image: v })}
            placeholder="URL de imagen"
          />
        </div>
      </div>

      {/* Footer & Timestamp */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label>Footer</Label>
          <Input
            value={embed.footer.text}
            onChange={(v) =>
              onUpdate({ ...embed, footer: { ...embed.footer, text: v } })
            }
            placeholder="Texto del footer"
          />
        </div>
        <div className="mb-2">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/5 bg-white/3 px-2 py-1.5 transition-colors hover:bg-white/5">
            <input
              type="checkbox"
              checked={embed.showTimestamp ?? false}
              onChange={(e) =>
                onUpdate({ ...embed, showTimestamp: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded accent-orange-500"
            />
            <span className="text-[10px] font-medium text-white/40">
              Timestamp
            </span>
          </label>
        </div>
      </div>

      {/* Fields */}
      <div>
        <SectionHeader title="Campos" onAdd={addField} addLabel="Campo" />
        <div className="space-y-2">
          {embed.fields.map((f, fi) => (
            <FieldEditor
              key={fi}
              field={f}
              onUpdate={(updated) => updateField(fi, updated)}
              onDelete={() => deleteField(fi)}
            />
          ))}
          {embed.fields.length === 0 && (
            <p className="text-[11px] italic text-white/20">Sin campos</p>
          )}
        </div>
      </div>
    </div>
  );
}
