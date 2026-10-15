"use client";

import css from "./NotesPage.module.css";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";

import toast from "react-hot-toast";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes, deleteNote } from "@/lib/api";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { NoteTag } from "@/types/note";
import Link from "next/link";
import { notesKey, PER_PAGE } from "@/lib/queryKeys";

interface NotesProps {
  tag?: NoteTag;
}

export default function Notes({ tag }: NotesProps) {
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState(``);

  const { data, isLoading, isError } = useQuery({
    queryKey: notesKey(tag, search, page),
    queryFn: () => fetchNotes({ search, page, perPage: PER_PAGE, tag }),
    placeholderData: keepPreviousData,
  });

  const updateSearchQuery = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    updateSearchQuery(value);
  };

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;
  const queryClient = useQueryClient();

  const deleteNotes = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotes"] });
      toast.success("Нотатку видалено");
    },
    onError: () => {
      toast.error(`Нотатку не знайдено`);
    },
  });

  useEffect(() => {
    if (search && !isLoading && data?.notes.length === 0) {
      toast.error(`Нотатку не знайдено`);
    }
  }, [data, search, isLoading]);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox query={inputValue} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          ></Pagination>
        )}
        {
          <Link href="/notes/action/create" className={css.button}>
            Create note +
          </Link>
        }
      </header>
      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {!isLoading && !isError && notes.length > 0 && (
        <NoteList notes={notes} onDelete={(id) => deleteNotes.mutate(id)} />
      )}
      {!isLoading && !isError && notes.length === 0 && (
        <p className={css.emptyState}>
          {tag ? `Нотаток з тегом "${tag}" ще немає` : "Нотаток ще немає"}
        </p>
      )}
    </div>
  );
}
