import type { DiscordPreviewData, ActionRowData, ButtonData } from "@/types";
import AuthorEditor from "./editors/AuthorEditor";
import ContentEditor from "./editors/ContentEditor";
import EmbedEditor from "./editors/EmbedEditor";
import ButtonEditor from "./editors/ButtonEditor";
import {
  EditorCard,
  SectionHeader,
  DeleteBtn,
  Toggle,
} from "./editors/primitives";
import V2ComponentsEditor from "./editors/V2ComponentsEditor";
import {
  createEmptyEmbed,
  createEmptyButton,
  createEmptyActionRow,
} from "./defaults";
import { SortableList } from "./editors/dnd/SortableList";
import { SortableItem } from "./editors/dnd/SortableItem";
import { DragHandle } from "./editors/dnd/DragHandle";

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
    <div className="space-y-8 pb-20 text-sm">
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

      <EditorCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">
              Modo de Componentes V2
            </h3>
            <p className="mt-1 text-[10px] text-white/30">
              Si activas V2, el contenido, los embeds y action rows V1
              tradicionales serán ignorados.
            </p>
          </div>
          <Toggle
            label={data.useV2 ? "Activado" : "Desactivado"}
            checked={data.useV2 || false}
            onChange={(v) => update({ useV2: v })}
          />
        </div>
      </EditorCard>

      {data.useV2 ? (
        <V2ComponentsEditor
          components={data.v2Components || []}
          onChange={(v2comps) => update({ v2Components: v2comps })}
        />
      ) : (
        <>
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
              <SortableList
                items={data.embeds}
                onReorder={(embeds) => update({ embeds })}
              >
                {data.embeds.map((embed, i) => (
                  <SortableItem key={embed.id} id={embed.id}>
                    <EmbedEditor
                      embed={embed}
                      idx={i}
                      onUpdate={(updated) => {
                        const embeds = [...data.embeds];
                        embeds[i] = updated;
                        update({ embeds });
                      }}
                      onDelete={() =>
                        update({
                          embeds: data.embeds.filter((_, j) => j !== i),
                        })
                      }
                    />
                  </SortableItem>
                ))}
              </SortableList>
              {data.embeds.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 text-xs text-white/20 italic">
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
              <SortableList
                items={data.components}
                onReorder={(components) => update({ components })}
              >
                {data.components.map((row, rowIdx) => (
                  <SortableItem key={row.id} id={row.id} className="group relative rounded-2xl border border-white/5 bg-white/2 p-5 transition-all hover:bg-white/4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DragHandle />
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 text-[10px] font-bold text-orange-400">
                          {rowIdx + 1}
                        </span>
                        <h4 className="text-xs font-bold tracking-wider text-white/50 uppercase">
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
                      <SortableList
                        items={row.components}
                        onReorder={(newButtons) =>
                          updateActionRow(rowIdx, {
                            ...row,
                            components: newButtons,
                          })
                        }
                      >
                        {row.components.map((btn, btnIdx) => (
                          <SortableItem key={btn.id} id={btn.id}>
                            <ButtonEditor
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
                                  components: row.components.filter(
                                    (_, i) => i !== btnIdx,
                                  ),
                                });
                              }}
                            />
                          </SortableItem>
                        ))}
                      </SortableList>
                      {row.components.length === 0 && (
                        <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/5 text-xs text-white/10 italic">
                          Haz clic en &quot;+ Añadir Botón&quot; para empezar
                        </div>
                      )}
                    </div>
                  </SortableItem>
                ))}
              </SortableList>

              {data.components.length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 text-xs text-white/20 italic">
                  Usa Action Rows para organizar tus botones (Máx 5 filas)
                </div>
              )}
            </div>
          </EditorCard>
        </>
      )}
    </div>
  );
}
