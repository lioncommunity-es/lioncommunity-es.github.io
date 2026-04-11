import type {
  V2TopLevelComponent,
  V2ContainerChild,
  V2Accessory,
  V2ActionRow,
  V2Container,
  V2MediaGallery,
  V2Section,
  V2Separator,
  V2TextDisplay,
} from "@/types/v2";
import { parseMarkdown, resolveEmoji } from "./utils/markdown";
import { DiscordButton, DiscordActionRow } from "@skyra/discord-components-react";

interface Props {
  components: V2TopLevelComponent[];
}

function TextDisplayRenderer({ data }: { data: V2TextDisplay }) {
  return (
    <div className="font-[gg_sans,var(--discord-font,sans-serif)] text-[0.9375rem] leading-5.5 wrap-break-word whitespace-pre-wrap text-white">
      {parseMarkdown(data.content)}
    </div>
  );
}

function SeparatorRenderer({ data }: { data: V2Separator }) {
  const marginY = data.spacing === 1 ? "my-2" : "my-4";
  return (
    <div className={`${marginY} flex items-center`}>
      {data.divider && <div className="h-px w-full bg-white/10" />}
    </div>
  );
}

function MediaGalleryRenderer({ data }: { data: V2MediaGallery }) {
  if (data.items.length === 0) return null;
  const count = data.items.length;
  const items = data.items;

  const getSrc = (url?: string) => {
    if (!url) return "";
    return url.startsWith("attachment://") ? "https://via.placeholder.com/400?text=Attachment" : url;
  };

  const getFallback = () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-white/20">Empty</div>
  );

  const Img = ({ item }: { item: typeof items[0] }) => (
    item.url ? (
      <img src={getSrc(item.url)} alt={item.description || "Image"} className="h-full w-full object-cover" />
    ) : getFallback()
  );

  if (count === 1) {
    return (
      <div className="mt-2 max-w-[500px] overflow-hidden rounded-[8px] bg-[#2b2d31]">
        {items[0].url ? (
           <img src={getSrc(items[0].url)} alt={items[0].description} className="max-h-[350px] min-h-[150px] w-auto max-w-full object-cover" />
        ) : getFallback()}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-2 grid h-[250px] max-w-[500px] grid-cols-2 gap-1 overflow-hidden rounded-[8px]">
        <div className="bg-[#2b2d31]"><Img item={items[0]} /></div>
        <div className="bg-[#2b2d31]"><Img item={items[1]} /></div>
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-2 grid h-[300px] max-w-[500px] grid-cols-2 gap-1 overflow-hidden rounded-[8px]">
        <div className="h-full bg-[#2b2d31]"><Img item={items[0]} /></div>
        <div className="grid grid-rows-2 gap-1 h-full">
          <div className="bg-[#2b2d31]"><Img item={items[1]} /></div>
          <div className="bg-[#2b2d31]"><Img item={items[2]} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 grid h-[300px] max-w-[500px] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[8px]">
      {items.slice(0, 4).map((item, i) => (
        <div key={i} className="relative bg-[#2b2d31]">
          <Img item={item} />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xl font-bold text-white">
              +{count - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AccessoryRenderer({ data }: { data: V2Accessory }) {
  if (data.kind === "button_accessory") {
    const emojiData = resolveEmoji(data.emoji);
    return (
      <div className="shrink-0">
        <DiscordActionRow>
          <DiscordButton
            type={
              data.style === "link"
                ? "secondary"
                : data.style === "danger"
                  ? "destructive"
                  : data.style
            }
            url={data.style === "link" ? data.url : undefined}
            disabled={data.disabled}
            emoji={emojiData.url}
            emojiName={emojiData.name}
          >
            {data.label}
          </DiscordButton>
        </DiscordActionRow>
      </div>
    );
  }

  if (data.kind === "thumbnail") {
    return (
      <div className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded bg-[#2b2d31]">
        {data.url ? (
          <img
            src={
              data.url.startsWith("attachment://")
                ? "https://via.placeholder.com/80?text=Att"
                : data.url
            }
            alt={data.description || "Thumbnail"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-white/20">
            Empty
          </div>
        )}
      </div>
    );
  }

  return null;
}

function SectionRenderer({ data }: { data: V2Section }) {
  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {data.texts.map((txt) => (
          <TextDisplayRenderer key={txt.id} data={txt} />
        ))}
      </div>
      {data.accessory && <AccessoryRenderer data={data.accessory} />}
    </div>
  );
}

function ActionRowRenderer({ data }: { data: V2ActionRow }) {
  return (
    <DiscordActionRow className="mt-2 flex flex-wrap gap-2">
      {data.components.map((btn) => {
        const emojiData = resolveEmoji(btn.emoji);
        return (
          <DiscordButton
            key={btn.id}
            type={
              btn.style === "link"
                ? "secondary"
                : btn.style === "danger"
                  ? "destructive"
                  : btn.style
            }
            url={btn.style === "link" ? btn.url : undefined}
            disabled={btn.disabled}
            emoji={emojiData.url}
            emojiName={emojiData.name}
          >
            {btn.label}
          </DiscordButton>
        );
      })}
    </DiscordActionRow>
  );
}

function ContainerRenderer({ data }: { data: V2Container }) {
  return (
    <div className="relative mt-2 max-w-[500px] overflow-hidden rounded-[8px] border border-white/10 bg-[#2b2d31] p-3 pl-4">
      {data.accentColor && (
        <div
          className="absolute top-0 bottom-0 left-0 w-1"
          style={{ backgroundColor: data.accentColor }}
        />
      )}
      <div className="flex flex-col gap-1">
        {data.children.map((child) => (
          <V2ComponentSwitch key={child.id} data={child} />
        ))}
      </div>
    </div>
  );
}

function V2ComponentSwitch({
  data,
}: {
  data: V2TopLevelComponent | V2ContainerChild;
}) {
  switch (data.kind) {
    case "text_display":
      return <TextDisplayRenderer data={data} />;
    case "separator":
      return <SeparatorRenderer data={data} />;
    case "media_gallery":
      return <MediaGalleryRenderer data={data} />;
    case "section":
      return <SectionRenderer data={data} />;
    case "action_row":
      return <ActionRowRenderer data={data} />;
    case "container":
      // A container can technically be a top-level component
      return <ContainerRenderer data={data} />;
    default:
      return null;
  }
}

export function V2ComponentRenderer({ components }: Props) {
  if (!components || components.length === 0) return null;

  return (
    <div className="mt-1 flex w-full flex-col gap-2">
      {components.map((comp) => (
        <V2ComponentSwitch key={comp.id} data={comp} />
      ))}
    </div>
  );
}
