import localFont from "next/font/local";
import "./globals.css";

const alternoxRegular = localFont({
  src: "./fonts/Alternox-Regular.otf",
  variable: "--font-alternox",
  weight: "400",
});

const alternoxBold = localFont({
  src: "./fonts/Alternox-Bold.otf",
  variable: "--font-alternox-bold",
  weight: "500",
});

export const metadata = {
  title: "SpaceUp 2024 Onboarding",
  description: "Welcome to SpaceUp 2024!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body
        className={`${alternoxRegular.variable} ${alternoxBold.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
