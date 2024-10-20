import { Urbanist } from "next/font/google";
import "./globals.css";
import "@coinbase/onchainkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "@/config/wagmi";
import ClientLayout from "@/components/ClientLayout";

const urbanist = Urbanist({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );

  return (
    <html lang="en" className="h-full">
      <ClientLayout initialState={initialState} urbanistClassName={urbanist.className}>
        {children}
      </ClientLayout>
    </html>
  );
}