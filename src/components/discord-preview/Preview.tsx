import {
  DiscordMessages,
  DiscordMessage,
  DiscordEmbed,
  DiscordEmbedDescription,
  DiscordEmbedFields,
  DiscordEmbedField,
  DiscordEmbedFooter,
  DiscordActionRow,
  DiscordButton,
} from "@skyra/discord-components-react";
import type { DiscordPreviewData } from "@/types";
import { parseMarkdown, resolveEmoji } from "./utils/markdown";

interface Props {
  data: DiscordPreviewData;
}

/** Safely converts a potential date string to a Date object, fallback to now if invalid */
function getSafeDate(dateStr: string | undefined | null | Date): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date)
    return isNaN(dateStr.getTime()) ? new Date() : dateStr;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

import { V2ComponentRenderer } from "./V2ComponentRenderer";

export default function Preview({ data }: Props) {
  const {
    author,
    content,
    embeds,
    components,
    ephemeral,
    edited,
    timestamp,
    useV2,
    v2Components,
  } = data;

  return (
    <DiscordMessages className="p-5">
      <DiscordMessage
        author={author.name}
        avatar={author.avatar}
        bot={author.bot}
        verified={author.verified}
        roleColor={author.roleColor}
        ephemeral={ephemeral}
        edited={edited}
        timestamp={getSafeDate(timestamp)}
      >
        {useV2 ? (
          <V2ComponentRenderer components={v2Components || []} />
        ) : (
          <>
            {content && <span>{parseMarkdown(content)}</span>}

            {embeds.map((embed) => (
              <DiscordEmbed
                key={embed.id}
                slot="embeds"
                color={embed.color}
                embedTitle={embed.title}
                url={embed.url || undefined}
                authorName={embed.authorName || undefined}
                authorImage={embed.authorIcon || undefined}
                authorUrl={embed.authorUrl || undefined}
                thumbnail={embed.thumbnail || undefined}
                image={embed.image || undefined}
              >
                <DiscordEmbedDescription slot="description">
                  {parseMarkdown(embed.description)}
                </DiscordEmbedDescription>

                {embed.fields.length > 0 && (
                  <DiscordEmbedFields slot="fields">
                    {embed.fields.map((field, fi) => (
                      <DiscordEmbedField
                        key={fi}
                        fieldTitle={field.name}
                        inline={field.inline}
                      >
                        {parseMarkdown(field.value)}
                      </DiscordEmbedField>
                    ))}
                  </DiscordEmbedFields>
                )}

                {(embed.footer.text || embed.showTimestamp) && (
                  <DiscordEmbedFooter
                    slot="footer"
                    footerImage={embed.footer.iconUrl}
                    timestamp={
                      embed.showTimestamp
                        ? getSafeDate(embed.timestamp)
                        : undefined
                    }
                  >
                    {embed.footer.text}
                  </DiscordEmbedFooter>
                )}
              </DiscordEmbed>
            ))}

            {components.length > 0 &&
              components.map((row) => (
                <DiscordActionRow key={row.id} slot="components">
                  {row.components.map((btn) => {
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
              ))}
          </>
        )}
      </DiscordMessage>
    </DiscordMessages>
  );
}
