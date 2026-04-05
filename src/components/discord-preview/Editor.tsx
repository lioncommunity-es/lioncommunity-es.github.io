import type { DiscordPreviewData, ActionRowData, ButtonData } from "./types";
import AuthorEditor from "./editors/AuthorEditor";
import ContentEditor from "./editors/ContentEditor";
import EmbedEditor from "./editors/EmbedEditor";
import ButtonEditor from "./editors/ButtonEditor";
import ExportPanel from "./editors/ExportPanel";
import { EditorCard, SectionHeader, DeleteBtn } from "./editors/primitives";
import {
  createEmptyEmbed,
  createEmptyButton,
  createEmptyActionRow,
} from "./defaults";

interface Props {
  data: DiscordPreviewData;
  onChange: (data: DiscordPreviewData) => void;
}

export default function Editor({ data, onChange }: Props) {
  const update = (patch: Partial<DiscordPreviewData>) => {
    onChange({ ...data, ...patch });
  };

  const addActionRow = () => {
    if (data.components.length >= 5) return;
    update({ components: [...data.components, createEmptyActionRow()] });
  };

  const updateActionRow = (idx: number, row: ActionRowData) => {
    const components = [...data.components];
    components[idx] = row;
    update({ components });
  };

  const deleteActionRow = (idx: number) => {
    update({ components: data.components.filter((_, i) => i !== idx) });
  };

  const addButtonToRow = (rowIdx: number) => {
    const row = data.components[rowIdx];
    if (row.components.length >= 5) return;
    updateActionRow(rowIdx, {
      ...row,
      components: [...row.components, createEmptyButton()],
    });
  };

  return (
    <div className="space-y-8 text-sm pb-20">
      <AuthorEditor
        author={data.author}
        onChange={(author) => update({ author })}
      />

      <ContentEditor
        content={data.content}
        ephemeral={data.ephemeral}
        edited={data.edited}
        onContentChange={(content) => update({ content })}
        onEphemeralChange={(ephemeral) => update({ ephemeral })}
        onEditedChange={(edited) => update({ edited })}
      />

      {/* Embeds */}
      <EditorCard>
        <SectionHeader
          title="Embeds"
          onAdd={() =>
            update({ embeds: [...data.embeds, createEmptyEmbed()] })
          }
          addLabel="Añadir Embed"
          count={data.embeds.length}
          max={10}
        />
        <div className="space-y-4">
          {data.embeds.map((embed, i) => (
            <EmbedEditor
              key={embed.id}
              embed={embed}
              idx={i}
              onUpdate={(updated) => {
                const embeds = [...data.embeds];
                embeds[i] = updated;
                update({ embeds });
              }}
              onDelete={() =>
                update({ embeds: data.embeds.filter((_, j) => j !== i) })
              }
            />
          ))}
          {data.embeds.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 text-xs italic text-white/20">
              No hay embeds añadidos
            </div>
          )}
        </div>
      </EditorCard>

      {/* Components (Action Rows) */}
      <EditorCard>
        <SectionHeader
          title="Componentes (Action Rows)"
          onAdd={data.components.length < 5 ? addActionRow : undefined}
          addLabel="Añadir Fila de Botones"
          count={data.components.length}
          max={5}
        />
        <div className="space-y-6">
          {data.components.map((row, rowIdx) => (
            <div
              key={row.id}
              className="group relative rounded-2xl border border-white/5 bg-white/2 p-5 transition-all hover:bg-white/4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 text-[10px] font-bold text-orange-400">
                    {rowIdx + 1}
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Fila de Acción
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {row.components.length < 5 && (
                    <button
                      onClick={() => addButtonToRow(rowIdx)}
                      className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/50 transition-colors hover:bg-orange-500/20 hover:text-orange-400"
                    >
                      + Añadir Botón
                    </button>
                  )}
                  <DeleteBtn onClick={() => deleteActionRow(rowIdx)} />
                </div>
              </div>

              <div className="space-y-3">
                {row.components.map((btn, btnIdx) => (
                  <ButtonEditor
                    key={btn.id}
                    btn={btn}
                    onUpdate={(updated) => {
                      const newComponents = [...row.components];
                      newComponents[btnIdx] = updated;
                      updateActionRow(rowIdx, {
                        ...row,
                        components: newComponents,
                      });
                    }}
                    onDelete={() => {
                      updateActionRow(rowIdx, {
                        ...row,
                        components: row.components.filter((_, i) => i !== btnIdx),
                      });
                    }}
                  />
                ))}
                {row.components.length === 0 && (
                  <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/5 text-xs italic text-white/10">
                    Haz clic en "+ Añadir Botón" para empezar
                  </div>
                )}
              </div>
            </div>
          ))}

          {data.components.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 text-xs italic text-white/20">
              Usa Action Rows para organizar tus botones (Máx 5 filas)
            </div>
          )}
        </div>
      </EditorCard>

      <ExportPanel data={data} />
    </div>
  );
}
