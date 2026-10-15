import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "modern-normalize/modern-normalize.css";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://notehub-lite.vercel.app"),
  title: "NoteHub",
  description:
    "NoteHub is a simple and efficient application designed for managing personal notes.",
  openGraph: {
    title: "NoteHub",
    description:
      "NoteHub is a simple and efficient application designed for managing personal notes",
    url: `/`,
    siteName: "NoteHub",
    images: [
      {
        url: "/notes.jpg",
        width: 1200,
        height: 630,
        alt: `Notebook with some notes`,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <TanStackProvider>
          <Header></Header>
          {children}
          {modal}
          <Footer></Footer>
          <Toaster position="top-right" />
        </TanStackProvider>
      </body>
    </html>
  );
}
