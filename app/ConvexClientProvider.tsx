"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.error("NEXT_PUBLIC_CONVEX_URL is not set! Please add it to your .env.local file");
}

const convex = new ConvexReactClient(convexUrl || "");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    return (
      <div className="p-4 bg-red-100 text-red-800">
        Error: NEXT_PUBLIC_CONVEX_URL is not configured. Please check your environment variables.
      </div>
    );
  }
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}