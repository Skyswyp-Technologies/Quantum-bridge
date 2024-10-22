'use client';

import React from 'react';
import { ToastContainer } from "react-toastify";
import { BridgeProvider } from "@/context/BridgeContext";
import { Providers } from '@/app/providers';
import { type State } from 'wagmi';

interface ClientLayoutProps {
  children: React.ReactNode;
  initialState?: State;
  urbanistClassName: string;
}

export default function ClientLayout({ children, initialState, urbanistClassName }: ClientLayoutProps) {
  return (
    <>
      <ToastContainer position="top-center" />
      <Providers initialState={initialState}>
        <BridgeProvider>
          <body className={`${urbanistClassName} flex flex-col h-full`}>
            <main className="flex-grow">{children}</main>
          </body>
        </BridgeProvider>
      </Providers>
    </>
  );
}