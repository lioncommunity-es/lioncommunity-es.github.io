import React from "react";
import {
  DiscordBold,
  DiscordItalic,
  DiscordCode,
  DiscordMention,
  DiscordHeader,
  DiscordSpoiler,
  DiscordLink,
  DiscordUnderlined,
  DiscordUnorderedList,
  DiscordListItem,
} from "@skyra/discord-components-react";

/** Parses inline markdown elements (bold, italic, etc) while handling escaping */
export function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  const regex =
    /(\\)?(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|~~(.+?)~~|`(.+?)`|<@(\w+)>|<#(\w+)>|<@&(\w+)>|\[(.+?)\]\((.+?)\)|\|\|(.+?)\|\|)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1] === "\\") {
      parts.push(text.slice(lastIndex, match.index));
      parts.push(match[2]);
      lastIndex = match.index + match[0].length;
      continue;
    }

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[3]) {
      parts.push(
        <DiscordBold key={match.index}>
          <DiscordItalic>{match[3]}</DiscordItalic>
        </DiscordBold>,
      );
    } else if (match[4]) {
      parts.push(<DiscordBold key={match.index}>{match[4]}</DiscordBold>);
    } else if (match[5]) {
      parts.push(<DiscordItalic key={match.index}>{match[5]}</DiscordItalic>);
    } else if (match[6]) {
      parts.push(
        <DiscordUnderlined key={match.index}>{match[6]}</DiscordUnderlined>,
      );
    } else if (match[7]) {
      parts.push(
        <span key={match.index} style={{ textDecoration: "line-through" }}>
          {match[7]}
        </span>,
      );
    } else if (match[8]) {
      parts.push(<DiscordCode key={match.index}>{match[8]}</DiscordCode>);
    } else if (match[9]) {
      parts.push(<DiscordMention key={match.index}>{match[9]}</DiscordMention>);
    } else if (match[10]) {
      parts.push(
        <DiscordMention key={match.index} type="channel">
          {match[10]}
        </DiscordMention>,
      );
    } else if (match[11]) {
      parts.push(
        <DiscordMention key={match.index} type="role">
          {match[11]}
        </DiscordMention>,
      );
    } else if (match[12] && match[13]) {
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
export function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");

  const isBlockLine = (ln: string) => {
    if (!ln) return false;
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

    if (
      line.startsWith("\\#") ||
      line.startsWith("\\-") ||
      line.startsWith("\\*")
    ) {
      parts.push(parseInline(line.slice(1)));
      if (i < lines.length - 1 && !isBlockLine(lines[i + 1])) {
        parts.push(<br key={`br-${i}`} />);
      }
      continue;
    }

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
      i--;
      parts.push(
        <DiscordUnorderedList key={`ul-${i}`}>
          {listItems}
        </DiscordUnorderedList>,
      );
      continue;
    }

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
        <span
          key={`sub-${i}`}
          className="mt-0.5 block text-[12px] font-medium leading-[16px] text-white/50"
        >
          {parseInline(line.slice(3))}
        </span>,
      );
      continue;
    }

    parts.push(parseInline(line));
    if (i < lines.length - 1 && !isBlockLine(lines[i + 1])) {
      parts.push(<br key={`br-${i}`} />);
    }
  }

  return parts;
}

/** Resolves an emoji string to a URL if it's a snowflake ID */
export function resolveEmoji(emoji: string | undefined) {
  if (!emoji) return { url: undefined, name: undefined };
  const isId = /^\d+$/.test(emoji);
  return {
    url: isId ? `https://cdn.discordapp.com/emojis/${emoji}.png` : emoji,
    name: isId ? undefined : emoji,
  };
}

interface IntlSegment {
  segment: string;
  index: number;
  input: string;
}

interface IntlSegmenter {
  new (
    locale?: string,
    options?: { granularity: "grapheme" | "word" | "sentence" },
  ): {
    segment(input: string): Iterable<IntlSegment>;
  };
}

/**
 * Extracts the first emoji (grapheme) or the full numeric ID from a string.
 */
export function extractSingleEmoji(text: string): string {
  if (!text) return "";
  // If it's a numeric ID, allow the whole thing
  if (/^\d+$/.test(text)) return text;

  // Use Intl.Segmenter for robust grapheme extraction (skin tones, flags, etc)
  const Segmenter = (Intl as any).Segmenter as IntlSegmenter | undefined;
  if (typeof Intl !== "undefined" && Segmenter) {
    const segmenter = new Segmenter(undefined, {
      granularity: "grapheme",
    });
    const segments = segmenter.segment(text);
    const first = Array.from(segments)[0];
    return first ? first.segment : "";
  }

  // Fallback for environments without Segmenter
  return Array.from(text)[0] || "";
}
