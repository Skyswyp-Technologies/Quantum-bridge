'use client';

import React from 'react';
import { ToastContainer } from "react-toastify";
import { BridgeProvider } from "@/context/BridgeContext";
import { Providers } from '@/app/providers';

interface ClientLayoutProps {
  children: React.ReactNode;
  initialState: any;
  urbanistClassName: string;
}

export default function ClientLayout({ children, initialState, urbanistClassName }: ClientLayoutProps) {
  return (
    <>
      <ToastContainer position="top-center" />
      <Providers inialState={initialState}>
        <BridgeProvider>
          <body className={`${urbanistClassName} flex flex-col h-full`}>
            <main className="flex-grow">{children}</main>
          </body>
        </BridgeProvider>
      </Providers>
    </>
  );
}