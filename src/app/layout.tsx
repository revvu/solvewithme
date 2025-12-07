import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolveWithMe - AI-Powered Math Tutoring",
  description: "Learn math with an AI tutor that helps you discover solutions on your own",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
