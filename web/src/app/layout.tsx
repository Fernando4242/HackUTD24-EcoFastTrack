import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Head from "next/head";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Ripple Monitoring",
  description: "Providing monitoring and management solutions for renewable energy systems",
  openGraph: {
    title: "Ripple Monitoring",
    description: "Providing monitoring and management solutions for renewable energy systems",
    siteName: "Ripple Monitoring",
    images: [
      {
        url: "/logo.png", // Replace with your image path
        width: 1200,
        height: 630,
        alt: "Ripple Monitoring Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="./logo.png" />
      </Head>
      {" "}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <SidebarProvider> */}
        {/* <AppSidebar /> */}
        <main className="w-full">
          {/* <SidebarTrigger defaultValue={1} /> */}
          {children}
        </main>
        {/* </SidebarProvider> */}
      </body>
    </html>
  );
}
