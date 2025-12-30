import type { Metadata } from "next";
import "./globals.css";
import {Outfit} from 'next/font/google';
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";



export const metadata: Metadata = {
  title: "AI Agent Builder Platform",
  description: "The app where you can build AI Agents simply by just drag and drop",
};

const outfit = Outfit({ subsets: ['latin']})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <ClerkProvider>
    <html lang="en">
      <body
        className={outfit.className}
      >
      <ConvexClientProvider>
        <TooltipProvider>
          <Provider>
            {children}
          </Provider>
        </TooltipProvider>
        <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
