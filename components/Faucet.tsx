"use client"

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ContentProps {
  address: string;
  setAddress: (address: string) => void;
  handleClaim: () => void;
}

const Faucet: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClaim = () => {
    // Implement claim functionality here
    console.log('Claiming tokens for address:', address);
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen w-full flex flex-col">
      {isMobile ? <MobileNavbar /> : <Navbar />}
      {isMobile ? (
        <MobileFaucetContent address={address} setAddress={setAddress} handleClaim={handleClaim} />
      ) : (
        <DesktopFaucetContent address={address} setAddress={setAddress} handleClaim={handleClaim} />
      )}
    </div>
  );
};

const MobileNavbar: React.FC = () => {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="cursor-pointer" onClick={() => router.push('/')}>
        <Image src="/back.svg" alt="back" width={13} height={22} />
      </div>
      <h1 className="text-xl font-semibold">Faucet</h1>
      <div className="w-6"></div>
    </nav>
  );
}

const MobileFaucetContent: React.FC<ContentProps> = ({ address, setAddress, handleClaim }) => (
  <main className="flex-grow flex flex-col px-4 py-6 relative">
    <div className="absolute inset-0 z-0">
      <Image
        src="/wave.png"
        alt="wave background"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <div className="absolute w-[59px] h-[223px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial-glow from-[#6AEFFF33] to-[#6AEFFF] opacity-60 blur-3xl"></div>
    </div>
    <div className="w-full max-w-md mx-auto space-y-6 z-10">
      <h2 className="text-xl font-semibold text-center">Get Test Tokens</h2>
      
      <div className='w-full bg-[#1A1A1A80] border border-[#3E434773] rounded-lg p-4 flex flex-col gap-4 backdrop-blur-sm'>
        <label className='text-gray-400 text-sm'>Enter your address</label>
        
        <div className='flex w-full items-center gap-2 relative'>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x85F...76cf"
            className="w-full bg-transparent border-b border-gray-700 py-2 pr-16 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button className='absolute right-2 p-1 px-2 bg-[#1E1E1E] text-xs rounded text-gray-400 hover:bg-[#2A2A2A] transition-colors'>
            paste
          </button>
        </div>
      </div>
    </div>
    
    <div className="mt-auto px-4 pb-6 z-10">
      <button
        className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 px-7 rounded-full font-semibold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
        onClick={handleClaim}
      >
        Claim
      </button>
    </div>
  </main>
);

const DesktopFaucetContent: React.FC<ContentProps> = ({ address, setAddress, handleClaim }) => (
  <main className="flex-grow flex items-center justify-center px-4 py-8 relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6AEFFF] opacity-30 blur-[100px] rounded-full"></div>
    
    <div className="w-full max-w-3xl space-y-5 text-center relative z-10">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2859A9] to-[#6AEFFF] text-transparent bg-clip-text">
        FAUCET
      </h1>
      <p className="text-xl text-gray-300">Get Test Tokens</p>
      
      <div className='w-full mx-auto bg-[#1A1A1A80] border border-[#3E434773] rounded-lg p-6 flex flex-col gap-8 backdrop-blur-sm'>
        <label className='text-[#FFFFFF] text-xl text-left'>Enter your address</label>
        
        <div className='flex w-full items-center gap-4'>
          <div className='flex w-full items-center gap-2'>
            <button className='p-2 bg-[#1E1E1E] rounded hover:bg-[#2A2A2A] transition-colors flex-shrink-0'>
              Paste
            </button>
            
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="w-full bg-transparent border-b border-gray-700 py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 relative z-10"
            />
          </div>
          
          <button
            className="w-auto bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 px-7 rounded-full hover:bg-gradient-to-l transition-colors duration-200 font-bold text-xl text-white whitespace-nowrap"
            onClick={handleClaim}
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  </main>
);

export default Faucet;