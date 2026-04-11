import {
  EditorCard,
  SectionHeader,
  DeleteBtn,
  Input,
  Textarea,
  Toggle,
} from "./primitives";
import type {
  V2TopLevelComponent,
  V2ContainerChild,
  V2TextDisplay,
  V2Separator,
  V2MediaGallery,
  V2Section,
  V2ActionRow,
  V2Container,
  V2ActionRowButton,
  V2ButtonAccessory,
} from "@/types/v2";
import {
  createV2TextDisplay,
  createV2Separator,
  createV2MediaGallery,
  createV2Section,
  createV2ActionRow,
  createV2Container,
  createV2ActionRowButton,
} from "../defaults";

// Need types from primitives for dropdown
import { type ButtonType } from "@/types";
import { BUTTON_TYPES } from "./ButtonEditor";
import { SortableList } from "./dnd/SortableList";
import { SortableItem } from "./dnd/SortableItem";
import { DragHandle } from "./dnd/DragHandle";
import { extractSingleEmoji } from "../utils/markdown";

type V2Component = V2TopLevelComponent | V2ContainerChild;

interface Props {
  components: V2TopLevelComponent[];
  onChange: (comps: V2TopLevelComponent[]) => void;
}

export default function V2ComponentsEditor({ components, onChange }: Props) {
  const addComponent = (type: string) => {
    let newItem: V2TopLevelComponent;
    if (type === "container") newItem = createV2Container();
    else if (type === "section") newItem = createV2Section();
    else if (type === "text_display") newItem = createV2TextDisplay();
    else if (type === "separator") newItem = createV2Separator();
    else if (type === "media_gallery") newItem = createV2MediaGallery();
    else if (type === "action_row") newItem = createV2ActionRow();
    else return;

    onChange([...(components || []), newItem]);
  };

  const updateChild = (idx: number, child: V2TopLevelComponent) => {
    const newComps = [...components];
    newComps[idx] = child;
    onChange(newComps);
  };

  const removeChild = (idx: number) => {
    onChange(components.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <EditorCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">
            Componentes V2
          </h3>
          <select
            onChange={(e) => {
              if (e.target.value) addComponent(e.target.value);
              e.target.value = "";
            }}
            className="rounded-lg bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold text-orange-400 outline-none hover:bg-orange-500/20"
          >
            <option value="">+ Añadir...</option>
            <option value="container">Container</option>
            <option value="section">Section</option>
            <option value="text_display">Text Display</option>
            <option value="separator">Separator</option>
            <option value="media_gallery">Media Gallery</option>
            <option value="action_row">Action Row</option>
          </select>
        </div>

        <div className="space-y-4">
          <SortableList
            items={components || []}
            onReorder={onChange}
          >
            {(components || []).map((comp, i) => (
              <SortableItem key={comp.id} id={comp.id}>
                <V2ComponentWrapper
                  comp={comp}
                  onUpdate={(updated) =>
                    updateChild(i, updated as V2TopLevelComponent)
                  }
                  onRemove={() => removeChild(i)}
                />
              </SortableItem>
            ))}
          </SortableList>
          {(!components || components.length === 0) && (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/20 italic">
              Selecciona añade un componente V2 para empezar
            </div>
          )}
        </div>
      </EditorCard>
    </div>
  );
}

// ----------------------------------------------------
// Wrapper
// ----------------------------------------------------
function V2ComponentWrapper({
  comp,
  onUpdate,
  onRemove,
}: {
  comp: V2Component;
  onUpdate: (c: V2Component) => void;
  onRemove: () => void;
}) {
  const bg = comp.kind === "container" ? "bg-white/5" : "bg-white/2";

  return (
    <div className={`relative rounded-xl border border-white/10 p-4 ${bg}`}>
      <div className="absolute top-3 right-3">
        <DeleteBtn onClick={onRemove} />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <DragHandle />
        <span className="text-[10px] font-bold tracking-wider text-orange-500/80 uppercase">
          {comp.kind.replace(/_/g, " ")}
        </span>
      </div>

      {comp.kind === "text_display" && (
        <TextDisplayEditor data={comp} onChange={onUpdate} />
      )}
      {comp.kind === "separator" && (
        <SeparatorEditor data={comp} onChange={onUpdate} />
      )}
      {comp.kind === "media_gallery" && (
        <MediaGalleryEditor data={comp} onChange={onUpdate} />
      )}
      {comp.kind === "action_row" && (
        <ActionRowEditor data={comp} onChange={onUpdate} />
      )}
      {comp.kind === "section" && (
        <SectionEditor data={comp} onChange={onUpdate} />
      )}
      {comp.kind === "container" && (
        <ContainerEditor data={comp} onChange={onUpdate} />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Sub-Editors
// ----------------------------------------------------

function TextDisplayEditor({
  data,
  onChange,
}: {
  data: V2TextDisplay;
  onChange: (c: V2TextDisplay) => void;
}) {
  return (
    <Textarea
      value={data.content}
      onChange={(v) => onChange({ ...data, content: v })}
      placeholder="Escribe en markdown..."
    />
  );
}

function SeparatorEditor({
  data,
  onChange,
}: {
  data: V2Separator;
  onChange: (c: V2Separator) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <Toggle
        label="Mostrar línea divisoria"
        checked={data.divider}
        onChange={(v) => onChange({ ...data, divider: v })}
      />
      <div className="flex overflow-hidden rounded-lg border border-white/10">
        <button
          className={`px-3 py-1 text-xs ${data.spacing === 1 ? "bg-orange-500/20 text-orange-400" : "text-white/40 hover:bg-white/5"}`}
          onClick={() => onChange({ ...data, spacing: 1 })}
        >
          Normal
        </button>
        <button
          className={`px-3 py-1 text-xs ${data.spacing === 2 ? "bg-orange-500/20 text-orange-400" : "text-white/40 hover:bg-white/5"}`}
          onClick={() => onChange({ ...data, spacing: 2 })}
        >
          Grande
        </button>
      </div>
    </div>
  );
}

function MediaGalleryEditor({
  data,
  onChange,
}: {
  data: V2MediaGallery;
  onChange: (c: V2MediaGallery) => void;
}) {
  const updateItem = (idx: number, url: string, desc: string) => {
    const items = [...data.items];
    items[idx] = { ...items[idx], url, description: desc };
    onChange({ ...data, items });
  };

  const addItem = () => {
    if (data.items.length >= 10) return;
    onChange({ ...data, items: [...data.items, { url: "", description: "" }] });
  };

  const removeItem = (idx: number) => {
    const items = data.items.filter((_, i) => i !== idx);
    onChange({ ...data, items });
  };

  return (
    <div className="space-y-3">
      {data.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={item.url}
              onChange={(v) => updateItem(i, v, item.description || "")}
              placeholder="URL de la imagen o attachment://name.jpg"
            />
          </div>
          <div className="flex-1">
            <Input
              value={item.description || ""}
              onChange={(v) => updateItem(i, item.url, v)}
              placeholder="Texto alternativo"
            />
          </div>
          <DeleteBtn onClick={() => removeItem(i)} />
        </div>
      ))}
      {data.items.length < 10 && (
        <button
          onClick={addItem}
          className="text-xs text-orange-400 hover:underline"
        >
          + Añadir imagen
        </button>
      )}
    </div>
  );
}

function ActionRowEditor({
  data,
  onChange,
}: {
  data: V2ActionRow;
  onChange: (c: V2ActionRow) => void;
}) {
  const updateButton = (idx: number, btn: V2ActionRowButton) => {
    const c = [...data.components];
    c[idx] = btn;
    onChange({ ...data, components: c });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() =>
          onChange({
            ...data,
            components: [...data.components, createV2ActionRowButton()],
          })
        }
        className="text-xs text-orange-400 hover:underline"
      >
        + Añadir Botón
      </button>
      <div className="space-y-2">
        <SortableList
          items={data.components}
          onReorder={(newBtns) => onChange({ ...data, components: newBtns })}
        >
          {data.components.map((btn, i) => (
            <SortableItem key={btn.id} id={btn.id}>
              <div className="flex flex-col gap-2 rounded bg-black/20 p-2">
                <div className="flex items-center gap-2">
                  <DragHandle />
                  <Input
                    value={btn.label}
                    onChange={(v) => updateButton(i, { ...btn, label: v })}
                    placeholder="Label"
                  />
                  <Input
                    value={btn.emoji || ""}
                    onChange={(v) =>
                      updateButton(i, { ...btn, emoji: extractSingleEmoji(v) })
                    }
                    placeholder="Emoji"
                  />
                  <select
                    value={btn.style}
                    onChange={(e) =>
                      updateButton(i, {
                        ...btn,
                        style: e.target.value as ButtonType,
                      })
                    }
                    className="rounded border border-white/10 bg-[#1e1f22] px-2 py-1 text-[10px] text-white/80 outline-none hover:border-orange-500/30"
                  >
                    {BUTTON_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label.split(" (")[0]}
                      </option>
                    ))}
                  </select>
                  <DeleteBtn
                    onClick={() => {
                      const c = data.components.filter((_, j) => j !== i);
                      onChange({ ...data, components: c });
                    }}
                  />
                </div>
                {btn.style === "link" && (
                  <div className="pl-6">
                    <Input
                      value={btn.url || ""}
                      onChange={(v) => updateButton(i, { ...btn, url: v })}
                      placeholder="URL del enlace (https://...)"
                    />
                  </div>
                )}
              </div>
            </SortableItem>
          ))}
        </SortableList>
      </div>
    </div>
  );
}

function SectionEditor({
  data,
  onChange,
}: {
  data: V2Section;
  onChange: (c: V2Section) => void;
}) {
  const updateText = (idx: number, content: string) => {
    const texts = [...data.texts];
    texts[idx] = { ...texts[idx], content };
    onChange({ ...data, texts });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-[10px] text-white/40">
          Textos ({data.texts.length}/3)
        </label>
        <div className="space-y-2">
          {data.texts.map((txt, i) => (
            <div key={txt.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={txt.content}
                  onChange={(v) => updateText(i, v)}
                  placeholder="Markdown text..."
                />
              </div>
              <DeleteBtn
                onClick={() => {
                  onChange({
                    ...data,
                    texts: data.texts.filter((_, j) => j !== i),
                  });
                }}
              />
            </div>
          ))}
          {data.texts.length < 3 && (
            <button
              onClick={() =>
                onChange({
                  ...data,
                  texts: [...data.texts, createV2TextDisplay()],
                })
              }
              className="text-xs text-orange-400"
            >
              + Añadir texto
            </button>
          )}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] text-white/40">
          Accesorio
        </label>
        <div className="mb-2 flex gap-2">
          <Toggle
            label="Sin Accesorio"
            checked={!data.accessory}
            onChange={() => onChange({ ...data, accessory: null })}
          />
          <Toggle
            label="Botón"
            checked={data.accessory?.kind === "button_accessory"}
            onChange={() =>
              onChange({
                ...data,
                accessory: {
                  kind: "button_accessory",
                  id: crypto.randomUUID(),
                  label: "Botón",
                  style: "primary",
                },
              })
            }
          />
          <Toggle
            label="Thumbnail"
            checked={data.accessory?.kind === "thumbnail"}
            onChange={() =>
              onChange({ ...data, accessory: { kind: "thumbnail", url: "" } })
            }
          />
        </div>
        {data.accessory?.kind === "thumbnail" && (
          <Input
            value={data.accessory.url}
            onChange={(v) =>
              onChange({
                ...data,
                accessory: {
                  kind: "thumbnail",
                  url: v,
                  description:
                    data.accessory?.kind === "thumbnail"
                      ? data.accessory.description
                      : undefined,
                },
              })
            }
            placeholder="URL del thumbnail"
          />
        )}
        {data.accessory?.kind === "button_accessory" && (
          <div className="space-y-2 rounded bg-black/20 p-2">
            <div className="flex items-center gap-2">
              <Input
                value={data.accessory.label}
                onChange={(v) =>
                  onChange({
                    ...data,
                    accessory: {
                      ...(data.accessory as V2ButtonAccessory),
                      label: v,
                    },
                  })
                }
                placeholder="Label"
              />
              <Input
                value={data.accessory.emoji || ""}
                onChange={(v) =>
                  onChange({
                    ...data,
                    accessory: {
                      ...(data.accessory as V2ButtonAccessory),
                      emoji: extractSingleEmoji(v),
                    },
                  })
                }
                placeholder="Emoji"
              />
              <select
                value={data.accessory.style}
                onChange={(e) =>
                  onChange({
                    ...data,
                    accessory: {
                      ...(data.accessory as V2ButtonAccessory),
                      style: e.target.value as any,
                    },
                  })
                }
                className="rounded border border-white/10 bg-[#1e1f22] px-2 py-1 text-[10px] text-white/80 outline-none hover:border-orange-500/30"
              >
                {BUTTON_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label.split(" (")[0]}
                  </option>
                ))}
              </select>
            </div>
            {data.accessory.style === "link" && (
              <Input
                value={data.accessory.url || ""}
                onChange={(v) =>
                  onChange({
                    ...data,
                    accessory: {
                      ...(data.accessory as V2ButtonAccessory),
                      url: v,
                    },
                  })
                }
                placeholder="URL del enlace (https://...)"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ContainerEditor({
  data,
  onChange,
}: {
  data: V2Container;
  onChange: (c: V2Container) => void;
}) {
  const addChild = (type: string) => {
    let newItem: V2ContainerChild;
    if (type === "section") newItem = createV2Section();
    else if (type === "text_display") newItem = createV2TextDisplay();
    else if (type === "separator") newItem = createV2Separator();
    else if (type === "media_gallery") newItem = createV2MediaGallery();
    else if (type === "action_row") newItem = createV2ActionRow();
    else return;

    onChange({ ...data, children: [...data.children, newItem] });
  };

  const updateChild = (idx: number, child: V2ContainerChild) => {
    const children = [...data.children];
    children[idx] = child;
    onChange({ ...data, children });
  };

  const removeChild = (idx: number) => {
    onChange({ ...data, children: data.children.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4 border-l-2 border-orange-500/20 py-2 pl-4">
      <div>
        <label className="mb-1 block text-[10px] text-white/40">
          Color de acento (HEX)
        </label>
        <Input
          value={data.accentColor || ""}
          onChange={(v) => onChange({ ...data, accentColor: v })}
          placeholder="#ffffff"
        />
      </div>

      <div className="pt-2">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-[10px] text-white/40">Contenido</label>
          <select
            onChange={(e) => {
              if (e.target.value) addChild(e.target.value);
              e.target.value = "";
            }}
            className="rounded-lg bg-orange-500/10 px-2 py-1 text-[10px] font-bold text-orange-400 outline-none hover:bg-orange-500/20"
          >
            <option value="">+ Añadir al contenedor...</option>
            <option value="section">Section</option>
            <option value="text_display">Text Display</option>
            <option value="separator">Separator</option>
            <option value="media_gallery">Media Gallery</option>
            <option value="action_row">Action Row</option>
          </select>
        </div>
        <div className="space-y-2">
          <SortableList
            items={data.children}
            onReorder={(children) => onChange({ ...data, children })}
          >
            {data.children.map((child, i) => (
              <SortableItem key={child.id} id={child.id}>
                <V2ComponentWrapper
                  comp={child}
                  onUpdate={(c) => updateChild(i, c as V2ContainerChild)}
                  onRemove={() => removeChild(i)}
                />
              </SortableItem>
            ))}
          </SortableList>
          {data.children.length === 0 && (
            <span className="text-xs text-white/20">Contenedor vacío</span>
          )}
        </div>
      </div>
    </div>
  );
}
