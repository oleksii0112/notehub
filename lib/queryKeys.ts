import type { NoteTag } from "@/types/note";

export const PER_PAGE = 12;
export const notesKey = (tag?: NoteTag, search = "", page = 1) =>
  ["getNotes", search, page, tag ?? "all"] as const;
