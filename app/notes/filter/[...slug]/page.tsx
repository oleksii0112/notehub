import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import Notes from "./Notes.client";
import { NoteTag } from "@/types/note";
import { Metadata } from "next";
import { notesKey, PER_PAGE } from "@/lib/queryKeys";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> { 
  const { slug } = await params;
  const rawTag = slug?.[0];
  const isAll = !rawTag || rawTag === "all";
  const title = isAll ? "All notes" : `Notes with tag ${rawTag}`
  const description = isAll ? "This is a list of all your notes in NoteHub" : `Notes filtered by the "${rawTag}" tag in NoteHub`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/notes/filter/${rawTag ?? "all"}`,
      siteName: "NoteHub",
      images: [
        {
          url: "/notes.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
  };
}

export default async function FilterNotesPage({ params }: Props) {
  const { slug } = await params;
  const rawTag = slug?.[0];
  const tag: NoteTag | undefined =
    !rawTag || rawTag === "all" ? undefined : (rawTag as NoteTag);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: notesKey(tag),
    queryFn: () => fetchNotes({ search: "", page: 1, perPage: PER_PAGE, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Notes tag={tag} />
    </HydrationBoundary>
  );
}
