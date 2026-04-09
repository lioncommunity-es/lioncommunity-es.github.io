# Discord Message Building Reference

> Based on the official Discord API documentation: <https://docs.discord.com/developers/resources/message>
> and the Components v2 reference: <https://docs.discord.com/developers/components/reference>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Fields You Set vs Fields Discord Sets](#2-fields-you-set-vs-fields-discord-sets)
3. [Create Message — Sendable Parameters](#3-create-message--sendable-parameters)
4. [Embeds](#4-embeds)
5. [Components V1 (Legacy)](#5-components-v1-legacy)
6. [Components V2 (Modern)](#6-components-v2-modern)
   - [Layout Components](#61-layout-components)
   - [Content Components](#62-content-components)
   - [Interactive Components](#63-interactive-components)
7. [Allowed Mentions](#7-allowed-mentions)
8. [Message References (Replies & Forwards)](#8-message-references-replies--forwards)
9. [Attachments & File Uploads](#9-attachments--file-uploads)
10. [Polls](#10-polls)
11. [Message Flags](#11-message-flags)
12. [Limits Cheat Sheet](#12-limits-cheat-sheet)
13. [TypeScript Type Definitions](#13-typescript-type-definitions)
14. [JSON Examples](#14-json-examples)

---

## 1. Overview

A Discord **message** is the fundamental unit of communication in a channel. When you **send** a message via the API (`POST /channels/{channel.id}/messages`), you only provide a small subset of fields — Discord fills in the rest automatically (IDs, timestamps, author info, etc.).

There are two messaging paradigms:

| Mode                                                  | When to use                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **Classic** (no special flag)                         | `content` + `embeds` + legacy `components` (Action Rows)                |
| **Components V2** (`IS_COMPONENTS_V2` flag `1 << 15`) | Only `components[]` — content, embeds, stickers, and polls are disabled |

---

## 2. Fields You Set vs Fields Discord Sets

### ✅ Fields YOU provide (writable on Create/Edit)

| Field               | Type              | Notes                                                                                    |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `content`           | string            | Plain text, up to 2000 chars                                                             |
| `tts`               | boolean           | Text-to-speech; requires `SEND_TTS_MESSAGES` permission                                  |
| `embeds`            | Embed[]           | Up to 10 rich embeds                                                                     |
| `allowed_mentions`  | AllowedMentions   | Controls who gets pinged                                                                 |
| `message_reference` | MessageReference  | Reply or forward target                                                                  |
| `components`        | Component[]       | Buttons, selects, V2 layout components                                                   |
| `sticker_ids`       | snowflake[]       | Up to 3 sticker IDs                                                                      |
| `files[n]`          | binary            | Multipart file uploads                                                                   |
| `attachments`       | Attachment[]      | Partial objects with description/filename                                                |
| `flags`             | integer           | Only `SUPPRESS_EMBEDS`, `SUPPRESS_NOTIFICATIONS`, `IS_VOICE_MESSAGE`, `IS_COMPONENTS_V2` |
| `nonce`             | string \| number  | Client-side deduplication token (up to 25 chars)                                         |
| `enforce_nonce`     | boolean           | If true, prevents duplicate sends with same nonce                                        |
| `poll`              | PollCreateRequest | A poll object (incompatible with `IS_COMPONENTS_V2`)                                     |

### 🤖 Fields Discord sets automatically (read-only)

| Field                    | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `id`                     | Unique snowflake ID of the message                      |
| `channel_id`             | Channel the message was sent in                         |
| `author`                 | User object of the sender                               |
| `timestamp`              | ISO8601 send timestamp                                  |
| `edited_timestamp`       | ISO8601 last-edit timestamp (null if never edited)      |
| `mention_everyone`       | Whether `@everyone` / `@here` was used                  |
| `mentions`               | Array of mentioned User objects                         |
| `mention_roles`          | Array of mentioned Role IDs                             |
| `mention_channels`       | Cross-post channel mentions (crossposted messages only) |
| `pinned`                 | Whether the message is pinned                           |
| `type`                   | Message type integer (0 = DEFAULT, 19 = REPLY, etc.)    |
| `webhook_id`             | Set if sent by a webhook                                |
| `application_id`         | Set if sent via an interaction or app webhook           |
| `reactions`              | Reaction objects added by users                         |
| `thread`                 | Thread started from this message                        |
| `position`               | Approximate position in a thread                        |
| `interaction_metadata`   | Populated when message is an interaction response       |
| `referenced_message`     | Full message object for replied-to message              |
| `message_snapshots`      | Snapshot data for forwarded messages                    |
| `call`                   | Call metadata for DM voice calls                        |
| `role_subscription_data` | Role subscription purchase info                         |

---

## 3. Create Message — Sendable Parameters

```
POST /channels/{channel.id}/messages
Content-Type: application/json
```

At least one of the following must be present: `content`, `embeds`, `sticker_ids`, `components`, `files[n]`, or `poll`.
When forwarding (`message_reference.type = 1`), only `message_reference` is required.

> **Note:** When `IS_COMPONENTS_V2` flag is set, only `components` is allowed. Providing `content`, `embeds`, `sticker_ids`, `files[n]`, or `poll` will return a `400 BAD REQUEST`.

---

## 4. Embeds

Embeds are rich content cards. You can send up to **10 embeds per message**. Each embed can be customized with a title, description, fields, images, author, footer, and more.

### Embed limits

| Field                       | Limit                                  |
| --------------------------- | -------------------------------------- |
| `title`                     | 256 characters                         |
| `description`               | 4096 characters                        |
| `fields`                    | Max 25 field objects                   |
| `field.name`                | 256 characters                         |
| `field.value`               | 1024 characters                        |
| `footer.text`               | 2048 characters                        |
| `author.name`               | 256 characters                         |
| Combined total (all embeds) | 6000 characters across all text fields |

### Writable embed fields

| Field         | Type           | Description                                                                      |
| ------------- | -------------- | -------------------------------------------------------------------------------- |
| `title`       | string         | Title of the embed                                                               |
| `description` | string         | Main body text (supports markdown)                                               |
| `url`         | string         | Makes the title a hyperlink                                                      |
| `timestamp`   | ISO8601        | Displayed at the bottom next to the footer                                       |
| `color`       | integer        | Left-border color as a decimal RGB integer (e.g., `0xFF0000` = red = `16711680`) |
| `footer`      | EmbedFooter    | Footer text and optional icon                                                    |
| `image`       | EmbedImage     | Large image at the bottom of the embed                                           |
| `thumbnail`   | EmbedThumbnail | Small image in the top-right corner                                              |
| `author`      | EmbedAuthor    | Author name/icon/URL shown at the top                                            |
| `fields`      | EmbedField[]   | Up to 25 name/value pairs, optionally inline                                     |

### Fields Discord ignores or sets on embeds

| Field              | Note                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `type`             | Always `"rich"` for webhook/bot embeds; cannot be set              |
| `video`            | Set by Discord for video links; cannot be set manually             |
| `provider`         | Set by Discord for linked providers; cannot be set manually        |
| `proxy_url`        | Auto-generated by Discord for all image/thumbnail/author icon URLs |
| `height` / `width` | Auto-calculated by Discord; ignored if sent                        |

---

## 5. Components V1 (Legacy)

Without the `IS_COMPONENTS_V2` flag, you use **Action Rows** as the only top-level layout component. Up to 5 Action Rows, 25 total components.

### Action Row (type: 1)

A horizontal row containing up to 5 Buttons **or** 1 Select Menu (cannot mix).

### Button (type: 2)

| Field       | Type         | Required | Description                                                     |
| ----------- | ------------ | -------- | --------------------------------------------------------------- |
| `type`      | integer      | ✅       | `2`                                                             |
| `style`     | integer      | ✅       | 1=Primary, 2=Secondary, 3=Success, 4=Danger, 5=Link, 6=Premium  |
| `label`     | string       | ✅\*     | Button text (max 80 chars). \*Not required if emoji is provided |
| `emoji`     | PartialEmoji | ❌       | Icon shown on button                                            |
| `custom_id` | string       | ✅\*     | Required for non-Link/non-Premium buttons (max 100 chars)       |
| `url`       | string       | ✅\*     | Required for Link style (style 5)                               |
| `sku_id`    | snowflake    | ✅\*     | Required for Premium style (style 6)                            |
| `disabled`  | boolean      | ❌       | Defaults to false                                               |

### String Select (type: 3)

| Field         | Type           | Required | Description                        |
| ------------- | -------------- | -------- | ---------------------------------- |
| `custom_id`   | string         | ✅       | Identifier returned in interaction |
| `options`     | SelectOption[] | ✅       | Up to 25 options                   |
| `placeholder` | string         | ❌       | Hint text (max 150 chars)          |
| `min_values`  | integer        | ❌       | 0–25 (default 1)                   |
| `max_values`  | integer        | ❌       | 1–25 (default 1)                   |
| `disabled`    | boolean        | ❌       | Defaults to false                  |

---

## 6. Components V2 (Modern)

Activated by setting the `IS_COMPONENTS_V2` flag (`1 << 15` = `32768`) in `flags`.

**Key differences from V1:**

- `content`, `embeds`, `stickers`, `poll` fields are **disabled**
- Up to **40 components** total per message
- Full hierarchy: Containers, Sections, Separators, Text Displays, Media Galleries, Files
- **Cannot be undone** — once a message is sent with this flag, it cannot be removed

### 6.1 Layout Components

#### Action Row (type: 1)

Same as V1. Contains up to 5 Buttons or 1 Select Menu. Also valid inside a Container.

---

#### Section (type: 9)

Side-by-side text with an accessory (button or thumbnail). Message-only.

| Field        | Type                | Required | Description                             |
| ------------ | ------------------- | -------- | --------------------------------------- |
| `type`       | integer             | ✅       | `9`                                     |
| `id`         | integer             | ❌       | Auto-assigned if omitted                |
| `components` | Component[]         | ✅       | Text Display components (the text side) |
| `accessory`  | Button \| Thumbnail | ✅       | Component shown on the right side       |

---

#### Container (type: 17)

A visually grouped box that can contain any message component. Supports background styling. Message-only.

| Field          | Type        | Required | Description                            |
| -------------- | ----------- | -------- | -------------------------------------- |
| `type`         | integer     | ✅       | `17`                                   |
| `id`           | integer     | ❌       | Auto-assigned if omitted               |
| `components`   | Component[] | ✅       | Any message components (recursive)     |
| `accent_color` | integer     | ❌       | Left-border accent color (decimal RGB) |
| `spoiler`      | boolean     | ❌       | Hides content behind a spoiler overlay |

---

#### Separator (type: 14)

Adds visual spacing between components. Message-only.

| Field     | Type    | Required | Description                                    |
| --------- | ------- | -------- | ---------------------------------------------- |
| `type`    | integer | ✅       | `14`                                           |
| `id`      | integer | ❌       | Auto-assigned if omitted                       |
| `divider` | boolean | ❌       | Whether to show a visible line (default false) |
| `spacing` | integer | ❌       | Spacing size: 1 = small, 2 = large             |

---

#### Label (type: 18)

Associates a label and optional description with a single interactive component. **Modal-only.**

| Field         | Type      | Required | Description                                               |
| ------------- | --------- | -------- | --------------------------------------------------------- |
| `type`        | integer   | ✅       | `18`                                                      |
| `id`          | integer   | ❌       | Auto-assigned if omitted                                  |
| `label`       | string    | ✅       | Label shown above the input                               |
| `description` | string    | ❌       | Helper text below the label                               |
| `component`   | Component | ✅       | One interactive component (TextInput, Select, FileUpload) |

---

### 6.2 Content Components

#### Text Display (type: 10)

Renders markdown text. Replaces the `content` field in V2 messages. Usable in messages and modals.

| Field     | Type    | Required | Description              |
| --------- | ------- | -------- | ------------------------ |
| `type`    | integer | ✅       | `10`                     |
| `id`      | integer | ❌       | Auto-assigned if omitted |
| `content` | string  | ✅       | Markdown-formatted text  |

---

#### Thumbnail (type: 11)

A small image, typically used as a section accessory. Message-only.

| Field         | Type              | Required | Description                                       |
| ------------- | ----------------- | -------- | ------------------------------------------------- |
| `type`        | integer           | ✅       | `11`                                              |
| `id`          | integer           | ❌       | Auto-assigned if omitted                          |
| `media`       | UnfurledMediaItem | ✅       | Object with `url` (http/https or `attachment://`) |
| `description` | string            | ❌       | Alt text / accessibility description              |
| `spoiler`     | boolean           | ❌       | Hides behind spoiler overlay                      |

---

#### Media Gallery (type: 12)

A collection of images and/or videos. Message-only.

| Field   | Type               | Required | Description                          |
| ------- | ------------------ | -------- | ------------------------------------ |
| `type`  | integer            | ✅       | `12`                                 |
| `id`    | integer            | ❌       | Auto-assigned if omitted             |
| `items` | MediaGalleryItem[] | ✅       | Array of media items (min 1, max 10) |

**MediaGalleryItem fields:**

| Field         | Type              | Required | Description                                                |
| ------------- | ----------------- | -------- | ---------------------------------------------------------- |
| `media`       | UnfurledMediaItem | ✅       | `{ url: string }` — supports http/https or `attachment://` |
| `description` | string            | ❌       | Alt text                                                   |
| `spoiler`     | boolean           | ❌       | Spoiler overlay                                            |

---

#### File (type: 13)

Displays a non-image attachment inline. Must reference a file in the message's `attachments`. Message-only.

| Field     | Type              | Required | Description                            |
| --------- | ----------------- | -------- | -------------------------------------- |
| `type`    | integer           | ✅       | `13`                                   |
| `id`      | integer           | ❌       | Auto-assigned if omitted               |
| `file`    | UnfurledMediaItem | ✅       | `{ url: "attachment://filename.ext" }` |
| `spoiler` | boolean           | ❌       | Spoiler overlay                        |

---

### 6.3 Interactive Components

All interactive components require a `custom_id` (max 100 chars, unique per message) that is returned in the interaction payload when a user interacts.

#### Button (type: 2)

Same as V1, but can also be used as a Section `accessory` in V2.

---

#### String Select (type: 3)

| Field         | Type           | Required | Description                      |
| ------------- | -------------- | -------- | -------------------------------- |
| `type`        | integer        | ✅       | `3`                              |
| `custom_id`   | string         | ✅       | Interaction identifier           |
| `options`     | SelectOption[] | ✅       | Up to 25 options                 |
| `placeholder` | string         | ❌       | Hint text (max 150 chars)        |
| `min_values`  | integer        | ❌       | Default 1, range 0–25            |
| `max_values`  | integer        | ❌       | Default 1, range 1–25            |
| `disabled`    | boolean        | ❌       | Messages only; ignored in modals |
| `required`    | boolean        | ❌       | Modals only; ignored in messages |

**SelectOption fields:**

| Field         | Type         | Required | Description                               |
| ------------- | ------------ | -------- | ----------------------------------------- |
| `label`       | string       | ✅       | Display text (max 100 chars)              |
| `value`       | string       | ✅       | Value sent in interaction (max 100 chars) |
| `description` | string       | ❌       | Secondary text (max 100 chars)            |
| `emoji`       | PartialEmoji | ❌       | Emoji icon                                |
| `default`     | boolean      | ❌       | Pre-selected (default false)              |

---

#### Text Input (type: 4)

Free-form text field. **Modal-only.** Must be inside a Label component.

| Field         | Type    | Required | Description                                         |
| ------------- | ------- | -------- | --------------------------------------------------- |
| `type`        | integer | ✅       | `4`                                                 |
| `custom_id`   | string  | ✅       | Interaction identifier                              |
| `style`       | integer | ✅       | 1 = Short (single-line), 2 = Paragraph (multi-line) |
| `label`       | string  | ✅       | Label shown above the field (max 45 chars)          |
| `min_length`  | integer | ❌       | Minimum character count (0–4000)                    |
| `max_length`  | integer | ❌       | Maximum character count (1–4000)                    |
| `required`    | boolean | ❌       | Defaults to true                                    |
| `value`       | string  | ❌       | Pre-filled value (max 4000 chars)                   |
| `placeholder` | string  | ❌       | Placeholder text (max 100 chars)                    |

---

#### User Select (type: 5)

| Field            | Type           | Required | Description               |
| ---------------- | -------------- | -------- | ------------------------- |
| `type`           | integer        | ✅       | `5`                       |
| `custom_id`      | string         | ✅       | Interaction identifier    |
| `placeholder`    | string         | ❌       | Hint text (max 150 chars) |
| `default_values` | DefaultValue[] | ❌       | Pre-selected user IDs     |
| `min_values`     | integer        | ❌       | Default 1                 |
| `max_values`     | integer        | ❌       | Default 1                 |
| `disabled`       | boolean        | ❌       | Messages only             |
| `required`       | boolean        | ❌       | Modals only               |

---

#### Role Select (type: 6)

Same structure as User Select (type 5) but selects roles.

---

#### Mentionable Select (type: 7)

Same structure as User Select (type 5) but selects both users and roles.

---

#### Channel Select (type: 8)

Same as User Select with one extra field:

| Field           | Type      | Required | Description                                        |
| --------------- | --------- | -------- | -------------------------------------------------- |
| `channel_types` | integer[] | ❌       | Filter by channel type (e.g., `[0]` for text-only) |

---

#### File Upload (type: 19)

Allows users to attach files through a modal form. **Modal-only.** Must be inside a Label.

| Field       | Type     | Required | Description                                                  |
| ----------- | -------- | -------- | ------------------------------------------------------------ |
| `type`      | integer  | ✅       | `19`                                                         |
| `custom_id` | string   | ✅       | Interaction identifier                                       |
| `accept`    | string[] | ❌       | Accepted MIME types (e.g., `["image/*", "application/pdf"]`) |
| `required`  | boolean  | ❌       | Defaults to true                                             |
| `min_files` | integer  | ❌       | Minimum number of files (0–10)                               |
| `max_files` | integer  | ❌       | Maximum number of files (1–10)                               |

---

## 7. Allowed Mentions

Controls which `@mentions` in `content` actually trigger notifications.

| Field          | Type        | Description                                                                                          |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `parse`        | string[]    | Parse types: `"roles"`, `"users"`, `"everyone"`. **Mutually exclusive with `roles`/`users` arrays.** |
| `roles`        | snowflake[] | Specific role IDs to ping (max 100)                                                                  |
| `users`        | snowflake[] | Specific user IDs to ping (max 100)                                                                  |
| `replied_user` | boolean     | Whether to ping the author of a replied-to message (default false)                                   |

**Default behavior:**

- Regular messages: all types parsed (`parse: ["roles", "users", "everyone"]`)
- Interactions & webhooks: only users parsed (`parse: ["users"]`)

---

## 8. Message References (Replies & Forwards)

| Field                | Type      | Required             | Description                                           |
| -------------------- | --------- | -------------------- | ----------------------------------------------------- |
| `type`               | integer   | ❌                   | `0` = DEFAULT (reply), `1` = FORWARD. Defaults to `0` |
| `message_id`         | snowflake | ✅ for reply/forward | ID of the target message                              |
| `channel_id`         | snowflake | ✅ for forward       | Channel of the target message                         |
| `guild_id`           | snowflake | ❌                   | Guild of the target message                           |
| `fail_if_not_exists` | boolean   | ❌                   | If true, errors when target is missing (default true) |

> For **forwards** (`type: 1`), both `message_id` and `channel_id` are required, and the requesting user must have `VIEW_CHANNEL` on the source channel. Forwards only work on `DEFAULT`, `REPLY`, `CHAT_INPUT_COMMAND`, and `CONTEXT_MENU_COMMAND` message types. Polls, calls, and activities cannot be forwarded.

---

## 9. Attachments & File Uploads

Files are uploaded via `multipart/form-data`. Each file is a field named `files[0]`, `files[1]`, etc.

The `attachments` array allows you to associate metadata with uploaded files:

| Field         | Type              | Description                                                                |
| ------------- | ----------------- | -------------------------------------------------------------------------- |
| `id`          | snowflake / index | Required. For new uploads, use the `files[n]` index as a snowflake-like id |
| `filename`    | string            | Name of the file                                                           |
| `description` | string            | Alt text / description (max 1024 chars)                                    |

In V2 messages, you reference uploaded files in components via `attachment://filename.ext`.

**Max request size:** 25 MiB total.

---

## 10. Polls

Polls are attached to a message via the `poll` field. They are incompatible with `IS_COMPONENTS_V2`.

| Field               | Type         | Required | Description                                  |
| ------------------- | ------------ | -------- | -------------------------------------------- |
| `question`          | PollMedia    | ✅       | Object with `text` field (the poll question) |
| `answers`           | PollAnswer[] | ✅       | Array of answer options                      |
| `duration`          | integer      | ✅       | Hours the poll runs (max 168 = 7 days)       |
| `allow_multiselect` | boolean      | ❌       | Whether users can pick multiple answers      |
| `layout_type`       | integer      | ❌       | `1` = DEFAULT                                |

---

## 11. Message Flags

Flags are a **bitfield** (combine with `|`). Only the following can be set on `Create Message`:

| Flag                     | Value               | Description                        |
| ------------------------ | ------------------- | ---------------------------------- |
| `SUPPRESS_EMBEDS`        | `1 << 2` = `4`      | Don't render link preview embeds   |
| `SUPPRESS_NOTIFICATIONS` | `1 << 12` = `4096`  | No push notifications (badge only) |
| `IS_VOICE_MESSAGE`       | `1 << 13` = `8192`  | Marks as a voice message           |
| `IS_COMPONENTS_V2`       | `1 << 15` = `32768` | Enables the V2 components system   |

Flags set automatically by Discord (read-only):

| Flag                     | Value     | Description                                   |
| ------------------------ | --------- | --------------------------------------------- |
| `CROSSPOSTED`            | `1 << 0`  | Published to follower channels                |
| `IS_CROSSPOST`           | `1 << 1`  | Originated from another channel via following |
| `SOURCE_MESSAGE_DELETED` | `1 << 3`  | Source of crosspost was deleted               |
| `URGENT`                 | `1 << 4`  | System urgent message                         |
| `HAS_THREAD`             | `1 << 5`  | A thread is attached to this message          |
| `EPHEMERAL`              | `1 << 6`  | Only visible to the interaction invoker       |
| `LOADING`                | `1 << 7`  | Bot is "thinking" (deferred interaction)      |
| `HAS_SNAPSHOT`           | `1 << 14` | Message has a forwarded snapshot              |

---

## 12. Limits Cheat Sheet

| Constraint                         | Limit                                     |
| ---------------------------------- | ----------------------------------------- |
| `content`                          | 2000 characters                           |
| `embeds` per message               | 10                                        |
| Total embed characters             | 6000 (across all embeds)                  |
| `embed.fields`                     | 25 per embed                              |
| `sticker_ids`                      | 3                                         |
| `nonce`                            | 25 characters                             |
| Max request size                   | 25 MiB                                    |
| V1 components                      | 5 Action Rows, 25 total                   |
| V2 components                      | 40 total                                  |
| `custom_id`                        | 100 characters                            |
| Button `label`                     | 80 characters (38 without emoji, 34 with) |
| String Select `options`            | 25                                        |
| Select `placeholder`               | 150 characters                            |
| Text Input `label`                 | 45 characters                             |
| Text Input `value` / `placeholder` | 4000 / 100 characters                     |
| MediaGallery `items`               | 10                                        |

---

## 13. TypeScript Type Definitions

```typescript
// ─── Snowflake ────────────────────────────────────────────────────────────────
type Snowflake = string; // 64-bit integer as string

// ─── Enums ────────────────────────────────────────────────────────────────────

enum MessageFlag {
  SUPPRESS_EMBEDS = 1 << 2, // 4
  SUPPRESS_NOTIFICATIONS = 1 << 12, // 4096
  IS_VOICE_MESSAGE = 1 << 13, // 8192
  IS_COMPONENTS_V2 = 1 << 15, // 32768
}

enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
  Premium = 6,
}

enum TextInputStyle {
  Short = 1,
  Paragraph = 2,
}

enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
  TextInput = 4,
  UserSelect = 5,
  RoleSelect = 6,
  MentionableSelect = 7,
  ChannelSelect = 8,
  Section = 9,
  TextDisplay = 10,
  Thumbnail = 11,
  MediaGallery = 12,
  File = 13,
  Separator = 14,
  Container = 17,
  Label = 18,
  FileUpload = 19,
}

// ─── Embed ────────────────────────────────────────────────────────────────────

interface EmbedFooter {
  text: string; // max 2048 chars
  icon_url?: string; // http(s) or attachment://
}

interface EmbedImage {
  url: string; // http(s) or attachment://
}

interface EmbedThumbnail {
  url: string; // http(s) or attachment://
}

interface EmbedAuthor {
  name: string; // max 256 chars
  url?: string; // http(s) only
  icon_url?: string; // http(s) or attachment://
}

interface EmbedField {
  name: string; // max 256 chars
  value: string; // max 1024 chars
  inline?: boolean;
}

interface Embed {
  title?: string; // max 256 chars
  description?: string; // max 4096 chars
  url?: string;
  timestamp?: string; // ISO8601
  color?: number; // decimal RGB integer
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  author?: EmbedAuthor;
  fields?: EmbedField[]; // max 25
  // DO NOT SET: type, video, provider, proxy_url, height, width
}

// ─── Allowed Mentions ─────────────────────────────────────────────────────────

interface AllowedMentions {
  parse?: Array<"roles" | "users" | "everyone">;
  roles?: Snowflake[]; // max 100
  users?: Snowflake[]; // max 100
  replied_user?: boolean;
}

// ─── Message Reference ────────────────────────────────────────────────────────

interface MessageReference {
  type?: 0 | 1; // 0 = REPLY (default), 1 = FORWARD
  message_id?: Snowflake;
  channel_id?: Snowflake; // required for FORWARD
  guild_id?: Snowflake;
  fail_if_not_exists?: boolean; // default true
}

// ─── Partial Attachment (for upload metadata) ─────────────────────────────────

interface PartialAttachment {
  id: Snowflake | number; // index of files[n] for new uploads
  filename?: string;
  description?: string; // max 1024 chars
}

// ─── Components ───────────────────────────────────────────────────────────────

interface PartialEmoji {
  id?: Snowflake | null; // null for unicode emoji
  name?: string;
  animated?: boolean;
}

interface UnfurledMediaItem {
  url: string; // http(s) or "attachment://filename"
}

// Layout
interface ActionRow {
  type: ComponentType.ActionRow; // 1
  id?: number;
  components: (
    | Button
    | StringSelect
    | UserSelect
    | RoleSelect
    | MentionableSelect
    | ChannelSelect
  )[];
}

interface Section {
  type: ComponentType.Section; // 9
  id?: number;
  components: TextDisplay[];
  accessory: Button | Thumbnail;
}

interface Container {
  type: ComponentType.Container; // 17
  id?: number;
  components: MessageComponent[];
  accent_color?: number;
  spoiler?: boolean;
}

interface Separator {
  type: ComponentType.Separator; // 14
  id?: number;
  divider?: boolean;
  spacing?: 1 | 2; // 1 = small, 2 = large
}

interface Label {
  type: ComponentType.Label; // 18 — modal-only
  id?: number;
  label: string;
  description?: string;
  component:
    | TextInput
    | StringSelect
    | UserSelect
    | RoleSelect
    | MentionableSelect
    | ChannelSelect
    | FileUpload;
}

// Content
interface TextDisplay {
  type: ComponentType.TextDisplay; // 10
  id?: number;
  content: string;
}

interface Thumbnail {
  type: ComponentType.Thumbnail; // 11
  id?: number;
  media: UnfurledMediaItem;
  description?: string;
  spoiler?: boolean;
}

interface MediaGalleryItem {
  media: UnfurledMediaItem;
  description?: string;
  spoiler?: boolean;
}

interface MediaGallery {
  type: ComponentType.MediaGallery; // 12
  id?: number;
  items: MediaGalleryItem[]; // 1–10
}

interface FileComponent {
  type: ComponentType.File; // 13
  id?: number;
  file: UnfurledMediaItem; // url must be "attachment://"
  spoiler?: boolean;
}

// Interactive
interface Button {
  type: ComponentType.Button; // 2
  id?: number;
  style: ButtonStyle;
  label?: string; // max 80 chars (required if no emoji)
  emoji?: PartialEmoji;
  custom_id?: string; // required for styles 1–4 (max 100 chars)
  url?: string; // required for style 5
  sku_id?: Snowflake; // required for style 6
  disabled?: boolean;
}

interface SelectOption {
  label: string; // max 100 chars
  value: string; // max 100 chars
  description?: string; // max 100 chars
  emoji?: PartialEmoji;
  default?: boolean;
}

interface StringSelect {
  type: ComponentType.StringSelect; // 3
  id?: number;
  custom_id: string;
  options: SelectOption[]; // max 25
  placeholder?: string; // max 150 chars
  min_values?: number; // 0–25, default 1
  max_values?: number; // 1–25, default 1
  disabled?: boolean; // messages only
  required?: boolean; // modals only
}

interface UserSelect {
  type: ComponentType.UserSelect; // 5
  id?: number;
  custom_id: string;
  placeholder?: string;
  default_values?: { id: Snowflake; type: "user" }[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean; // messages only
  required?: boolean; // modals only
}

// RoleSelect (type: 6), MentionableSelect (type: 7) — same shape as UserSelect

interface ChannelSelect {
  type: ComponentType.ChannelSelect; // 8
  id?: number;
  custom_id: string;
  channel_types?: number[];
  placeholder?: string;
  default_values?: { id: Snowflake; type: "channel" }[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean; // messages only
  required?: boolean; // modals only
}

interface TextInput {
  type: ComponentType.TextInput; // 4 — modal-only
  id?: number;
  custom_id: string;
  style: TextInputStyle;
  label: string; // max 45 chars
  min_length?: number; // 0–4000
  max_length?: number; // 1–4000
  required?: boolean; // default true
  value?: string; // pre-filled, max 4000 chars
  placeholder?: string; // max 100 chars
}

interface FileUpload {
  type: ComponentType.FileUpload; // 19 — modal-only
  id?: number;
  custom_id: string;
  accept?: string[]; // MIME types e.g. ["image/*"]
  required?: boolean; // default true
  min_files?: number; // 0–10
  max_files?: number; // 1–10
}

type MessageComponent =
  | ActionRow
  | Section
  | Container
  | Separator
  | TextDisplay
  | Thumbnail
  | MediaGallery
  | FileComponent;

// ─── Create Message Payload ───────────────────────────────────────────────────

interface CreateMessagePayload {
  // At least one of the following is required
  content?: string; // max 2000 chars
  embeds?: Embed[]; // max 10
  sticker_ids?: Snowflake[]; // max 3
  components?: (ActionRow | MessageComponent)[]; // V1: ActionRow only; V2: all
  poll?: PollCreateRequest; // incompatible with IS_COMPONENTS_V2

  // Optional
  tts?: boolean;
  allowed_mentions?: AllowedMentions;
  message_reference?: MessageReference;
  attachments?: PartialAttachment[];
  flags?: number; // use MessageFlag enum
  nonce?: string | number; // max 25 chars
  enforce_nonce?: boolean;
  // files[n] are sent as multipart/form-data, not in JSON body
}
```

---

## 14. JSON Examples

### Basic text message with reply

```json
{
  "content": "Hello! This is a reply.",
  "message_reference": {
    "type": 0,
    "message_id": "1234567890123456789"
  },
  "allowed_mentions": {
    "replied_user": false
  }
}
```

---

### Rich embed message

```json
{
  "embeds": [
    {
      "title": "Deploy Successful 🚀",
      "description": "Version **v2.3.1** is now live in production.",
      "color": 3066993,
      "timestamp": "2026-04-09T12:00:00.000Z",
      "author": {
        "name": "CI/CD Pipeline",
        "icon_url": "https://example.com/bot-icon.png"
      },
      "fields": [
        { "name": "Environment", "value": "Production", "inline": true },
        { "name": "Duration", "value": "3m 42s", "inline": true },
        { "name": "Commit", "value": "`abc1234` Fix auth token expiry" }
      ],
      "footer": {
        "text": "GitHub Actions",
        "icon_url": "https://example.com/github.png"
      }
    }
  ]
}
```

---

### Legacy (V1) components — buttons + select

```json
{
  "content": "Choose an action:",
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 1,
          "label": "Approve",
          "custom_id": "action_approve"
        },
        {
          "type": 2,
          "style": 4,
          "label": "Reject",
          "custom_id": "action_reject"
        },
        {
          "type": 2,
          "style": 5,
          "label": "Docs",
          "url": "https://docs.example.com"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "type": 3,
          "custom_id": "priority_select",
          "placeholder": "Set priority…",
          "options": [
            { "label": "🔴 Critical", "value": "critical" },
            { "label": "🟡 Medium", "value": "medium" },
            { "label": "🟢 Low", "value": "low" }
          ]
        }
      ]
    }
  ]
}
```

---

### Components V2 message — full layout example

```json
{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "accent_color": 5793266,
      "components": [
        {
          "type": 10,
          "content": "## 🚀 New Release: v3.0.0\nHere's what changed in this update."
        },
        {
          "type": 9,
          "components": [
            {
              "type": 10,
              "content": "**Performance improvements** across all endpoints. Average response time reduced by 40%."
            }
          ],
          "accessory": {
            "type": 11,
            "media": { "url": "https://example.com/perf-chart.png" },
            "description": "Performance chart"
          }
        },
        {
          "type": 14,
          "divider": true,
          "spacing": 1
        },
        {
          "type": 12,
          "items": [
            {
              "media": { "url": "https://example.com/screenshot1.png" },
              "description": "Dashboard view"
            },
            {
              "media": { "url": "https://example.com/screenshot2.png" },
              "description": "Settings panel"
            }
          ]
        },
        {
          "type": 14,
          "spacing": 2
        },
        {
          "type": 1,
          "components": [
            {
              "type": 2,
              "style": 1,
              "label": "View Changelog",
              "custom_id": "open_changelog"
            },
            {
              "type": 2,
              "style": 5,
              "label": "Download",
              "url": "https://releases.example.com/v3.0.0"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Components V2 message — file attachment via component

```json
{
  "flags": 32768,
  "attachments": [
    {
      "id": 0,
      "filename": "report.pdf",
      "description": "Monthly summary report"
    }
  ],
  "components": [
    {
      "type": 10,
      "content": "📎 Your report is ready to download:"
    },
    {
      "type": 13,
      "file": { "url": "attachment://report.pdf" }
    }
  ]
}
```

---

### Suppress embeds and notifications

```json
{
  "content": "Check this out: https://example.com/some-article",
  "flags": 4100
}
```

> `flags: 4100` = `SUPPRESS_EMBEDS (4)` | `SUPPRESS_NOTIFICATIONS (4096)`

---

### Forward a message

```json
{
  "message_reference": {
    "type": 1,
    "message_id": "9876543210987654321",
    "channel_id": "1111111111111111111"
  }
}
```

---

### Allowed mentions — suppress all pings

```json
{
  "content": "@everyone <@&123456> Hello <@789>",
  "allowed_mentions": {
    "parse": []
  }
}
```

### Allowed mentions — ping specific users only

```json
{
  "content": "<@111> and <@222>, heads up!",
  "allowed_mentions": {
    "users": ["111", "222"]
  }
}
```
