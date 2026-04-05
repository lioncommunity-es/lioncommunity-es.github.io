import { EditorCard, SectionHeader, Textarea, Toggle } from "./primitives";

interface Props {
  content: string;
  ephemeral: boolean;
  edited: boolean;
  onContentChange: (v: string) => void;
  onEphemeralChange: (v: boolean) => void;
  onEditedChange: (v: boolean) => void;
}

export default function ContentEditor({
  content,
  ephemeral,
  edited,
  onContentChange,
  onEphemeralChange,
  onEditedChange,
}: Props) {
  return (
    <EditorCard>
      <SectionHeader title="Mensaje" />
      <Textarea
        value={content}
        onChange={onContentChange}
        placeholder="Soporta **negrita**, *cursiva*, `código`, <@mención>, <#canal>"
        rows={4}
      />
      <div className="flex flex-wrap gap-4">
        <Toggle
          label="Efímero"
          checked={ephemeral}
          onChange={onEphemeralChange}
        />
        <Toggle label="Editado" checked={edited} onChange={onEditedChange} />
      </div>
    </EditorCard>
  );
}
