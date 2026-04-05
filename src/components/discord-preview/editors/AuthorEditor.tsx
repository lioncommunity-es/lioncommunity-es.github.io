import type { AuthorData } from "../types";
import { EditorCard, SectionHeader, Label, Input, Toggle } from "./primitives";

interface Props {
  author: AuthorData;
  onChange: (author: AuthorData) => void;
}

export default function AuthorEditor({ author, onChange }: Props) {
  const update = (patch: Partial<AuthorData>) =>
    onChange({ ...author, ...patch });

  return (
    <EditorCard>
      <SectionHeader title="Autor" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre</Label>
          <Input
            value={author.name}
            onChange={(v) => update({ name: v })}
            placeholder="Nombre del bot"
          />
        </div>
        <div>
          <Label>Avatar URL</Label>
          <Input
            value={author.avatar}
            onChange={(v) => update({ avatar: v })}
            placeholder="URL del avatar"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Toggle
          label="Bot"
          checked={author.bot}
          onChange={(v) => update({ bot: v })}
        />
        <Toggle
          label="Verificado"
          checked={author.verified}
          onChange={(v) => update({ verified: v })}
        />
      </div>
      <div>
        <Label>Color del rol</Label>
        <Input
          value={author.roleColor || ""}
          onChange={(v) => update({ roleColor: v })}
          placeholder="#f97316"
        />
      </div>
    </EditorCard>
  );
}
