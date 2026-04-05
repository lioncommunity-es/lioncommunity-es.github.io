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
  DiscordBold,
  DiscordItalic,
  DiscordCode,
  DiscordMention,
  DiscordHeader,
  DiscordSubscript,
  DiscordSpoiler,
  DiscordLink,
  DiscordUnderlined,
  DiscordUnorderedList,
  DiscordListItem,
} from "@skyra/discord-components-react";
import type { DiscordPreviewData } from "./types";

interface Props {
  data: DiscordPreviewData;
}

/** Parses inline markdown elements (bold, italic, etc) while handling escaping */
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  // Updated regex to use capturing group for potential backslash
  // Group 1: potential escape char \
  const regex =
    /(\\)?(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|~~(.+?)~~|`(.+?)`|<@(\w+)>|<#(\w+)>|<@&(\w+)>|\[(.+?)\]\((.+?)\)|\|\|(.+?)\|\|)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // If it was escaped, add the literal string (skipping the backslash) and continue
    if (match[1] === "\\") {
      parts.push(text.slice(lastIndex, match.index));
      parts.push(match[2]); // The "markdown" string without the \
      lastIndex = match.index + match[0].length;
      continue;
    }

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Match groups are shifted by 1 because of the escape group
    if (match[3]) {
      // ***bold italic***
      parts.push(
        <DiscordBold key={match.index}>
          <DiscordItalic>{match[3]}</DiscordItalic>
        </DiscordBold>,
      );
    } else if (match[4]) {
      // **bold**
      parts.push(<DiscordBold key={match.index}>{match[4]}</DiscordBold>);
    } else if (match[5]) {
      // *italic*
      parts.push(<DiscordItalic key={match.index}>{match[5]}</DiscordItalic>);
    } else if (match[6]) {
      // __underline__
      parts.push(
        <DiscordUnderlined key={match.index}>{match[6]}</DiscordUnderlined>,
      );
    } else if (match[7]) {
      // ~~strikethrough~~
      parts.push(
        <span key={match.index} style={{ textDecoration: "line-through" }}>
          {match[7]}
        </span>,
      );
    } else if (match[8]) {
      // `code`
      parts.push(<DiscordCode key={match.index}>{match[8]}</DiscordCode>);
    } else if (match[9]) {
      // <@id>
      parts.push(<DiscordMention key={match.index}>{match[9]}</DiscordMention>);
    } else if (match[10]) {
      // <#id>
      parts.push(
        <DiscordMention key={match.index} type="channel">
          {match[10]}
        </DiscordMention>,
      );
    } else if (match[11]) {
      // <@&id>
      parts.push(
        <DiscordMention key={match.index} type="role">
          {match[11]}
        </DiscordMention>,
      );
    } else if (match[12] && match[13]) {
      // [label](url)
      parts.push(
        <DiscordLink
          key={match.index}
          href={match[13]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[12]}
        </DiscordLink>,
      );
    } else if (match[14]) {
      // ||spoiler||
      parts.push(<DiscordSpoiler key={match.index}>{match[14]}</DiscordSpoiler>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/** Converts simple Discord markdown to React elements */
function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");

  const isBlockLine = (ln: string) => {
    if (!ln) return false;
    // Escaped starts are NOT blocks (they render as inline text)
    if (ln.startsWith("\\#") || ln.startsWith("\\-") || ln.startsWith("\\*"))
      return false;
    return (
      ln.startsWith("# ") ||
      ln.startsWith("## ") ||
      ln.startsWith("### ") ||
      ln.startsWith("-# ") ||
      ln.startsWith("- ") ||
      ln.startsWith("* ")
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for escaped line-starts
    if (
      line.startsWith("\\#") ||
      line.startsWith("\\-") ||
      line.startsWith("\\*")
    ) {
      parts.push(parseInline(line.slice(1)));
      // If next is also non-block, add br
      if (i < lines.length - 1 && !isBlockLine(lines[i + 1])) {
        parts.push(<br key={`br-${i}`} />);
      }
      continue;
    }

    // List item grouping
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        listItems.push(
          <DiscordListItem key={`li-${i}`}>
            {parseInline(lines[i].slice(2))}
          </DiscordListItem>,
        );
        i++;
      }
      i--; // adjust for loop increment
      parts.push(
        <DiscordUnorderedList key={`ul-${i}`}>
          {listItems}
        </DiscordUnorderedList>,
      );
      continue;
    }

    // Block elements
    if (line.startsWith("### ")) {
      parts.push(
        <DiscordHeader key={`h3-${i}`} level={3}>
          {parseInline(line.slice(4))}
        </DiscordHeader>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      parts.push(
        <DiscordHeader key={`h2-${i}`} level={2}>
          {parseInline(line.slice(3))}
        </DiscordHeader>,
      );
      continue;
    }
    if (line.startsWith("# ")) {
      parts.push(
        <DiscordHeader key={`h1-${i}`} level={1}>
          {parseInline(line.slice(2))}
        </DiscordHeader>,
      );
      continue;
    }
    if (line.startsWith("-# ")) {
      parts.push(
        <DiscordSubscript key={`sub-${i}`}>
          {parseInline(line.slice(3))}
        </DiscordSubscript>,
      );
      continue;
    }

    // Normal line
    parts.push(parseInline(line));
    // Only add <br /> if next line exists AND neither are blocks
    if (i < lines.length - 1 && !isBlockLine(lines[i + 1])) {
      parts.push(<br key={`br-${i}`} />);
    }
  }

  return parts;
}

export default function Preview({ data }: Props) {
  const { author, content, embeds, components, ephemeral, edited, timestamp } =
    data;

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
        timestamp={timestamp}
      >
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

            {embed.footer.text && (
              <DiscordEmbedFooter
                slot="footer"
                footerImage={embed.footer.iconUrl}
              >
                {embed.footer.text}
              </DiscordEmbedFooter>
            )}
          </DiscordEmbed>
        ))}

        {components.length > 0 &&
          components.map((row) => (
            <DiscordActionRow key={row.id} slot="components">
              {row.components.map((btn) => (
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
                  emoji={btn.emoji || undefined}
                  emojiName={btn.emoji || undefined}
                >
                  {btn.label}
                </DiscordButton>
              ))}
            </DiscordActionRow>
          ))}
      </DiscordMessage>
    </DiscordMessages>
  );
}
