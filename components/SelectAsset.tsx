"use client";

import Image from 'next/image';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useBridge } from '@/context/BridgeContext';

const AssetSelector = () => {
  const router = useRouter();
  const { tokens, setFromToken, setToToken } = useBridge();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTokens, setFilteredTokens] = useState(tokens);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setType(searchParams.get('type'));
  }, []);

  useEffect(() => {
    setFilteredTokens(
      tokens.filter(token => 
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, tokens]);

  const handleAssetSelect = (tokenId: string) => {
    if (type === 'from') {
      setFromToken(tokenId);
    } else if (type === 'to') {
      setToToken(tokenId);
    }
    router.push('/');
  };

  if (type === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <span className="font-bold text-white text-center mb-7">Choose asset to bridge</span>

      <div className="w-full flex flex-col flex-grow gap-4 overflow-y-auto">
        <div className='rounded border border-[#3E434773] bg-[#1A1A1A80] p-2 flex justify-between items-center'>
          <input
            type="text"
            placeholder="Search by token name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white w-full focus:outline-none"
          />
          <Image src="/search.svg" alt='search' width={16} height={16} />
        </div>

        {filteredTokens.map((token) => (
          <div 
            key={token.id}
            className='rounded border border-[#3E434773] bg-[#1A1A1A80] p-2 cursor-pointer'
            onClick={() => handleAssetSelect(token.id)}
          >
            <div className='flex flex-row items-center gap-4'>
              <Image src={token.icon} alt={token.name} width={24} height={24} />
              <div className='flex flex-col gap-2'>
                <span className="text-white">{token.symbol}</span>
                <span className="text-[#9A9A9A] text-sm">{token.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SelectAsset = () => {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col bg-[#000000]">
      <nav className="bg-[#000000] text-white h-16 border-b border-b-[#3E4347] container mx-auto flex items-center px-4 relative">
        <div className="absolute left-4 cursor-pointer" onClick={() => router.push('/')}>
          <Image src="/back.svg" alt="back" width={13} height={22} />
        </div>
        <span className="text-[#A6A9B8] font-bold text-xl flex-grow text-center">
          Bridge Assets
        </span>
      </nav>

      <div className="flex-grow flex justify-center">
        <div className="w-full lg:w-[360px] mx-4 my-4 lg:my-8 px-5 py-3 flex flex-col rounded-3xl border border-[#3E4347] relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/wave.png"
              alt="wave background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
            <div className="absolute w-[59px] h-[223px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial-glow from-[#6AEFFF33] to-[#6AEFFF] opacity-90 blur-3xl"></div>
          </div>
          <div className="relative z-10 flex-grow flex flex-col">
            <Suspense fallback={<div>Loading...</div>}>
              <AssetSelector />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectAsset;