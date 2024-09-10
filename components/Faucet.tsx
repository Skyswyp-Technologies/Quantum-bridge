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

const SuccessModal: React.FC<{ isOpen: boolean; onClose: () => void; amount: number; tokenSymbol: string }> = ({ isOpen, onClose, amount, tokenSymbol }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1ACC] border border-[#A6A9B880] rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Successful!</h2>
            <p className="text-gray-300 mb-4">You have successfully claimed your test tokens!</p>
            <p className="text-white text-xl font-bold mb-6">{amount} {tokenSymbol}</p>
            <p className="text-white text-xl font-bold mb-6">Tx Hash: link </p>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-2 px-4 rounded-full text-white font-semibold hover:bg-gradient-to-l transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      );
    };  

    const Faucet: React.FC = () => {
        const [address, setAddress] = useState<string>('');
        const [isMobile, setIsMobile] = useState(false);
        const [showSuccessModal, setShowSuccessModal] = useState(false);
      
        useEffect(() => {
          const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
          };
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
        }, []);
      
        const handleClaim = () => {
          console.log('Claiming tokens for address:', address);
          setShowSuccessModal(true);
        };
      
        return (
          <div className="bg-[#000000] text-white w-full h-screen flex flex-col">
            {isMobile ? <MobileNavbar /> : <Navbar />}
            <div className="flex-1 flex">
              {isMobile ? (
                <MobileFaucetContent address={address} setAddress={setAddress} handleClaim={handleClaim} />
              ) : (
                <DesktopFaucetContent address={address} setAddress={setAddress} handleClaim={handleClaim} />
              )}
            </div>
            <SuccessModal 
              isOpen={showSuccessModal} 
              onClose={() => setShowSuccessModal(false)} 
              amount={10} 
              tokenSymbol="ARB" 
            />
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
      <h1 className="text-xl text-[#A6A9B8] font-semibold">Faucet</h1>
      <div className="w-6"></div>
    </nav>
  );
}

const MobileFaucetContent: React.FC<ContentProps> = ({ address, setAddress, handleClaim }) => (
    <main className="flex-1 flex flex-col py-6 px-4 w-full">
      <div className="flex-1 flex flex-col rounded-3xl border border-[#3E4347] relative overflow-hidden">
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
        <div className="flex-1 flex flex-col justify-between p-4 z-10">
          <div className="w-full max-w-md mx-auto space-y-6">

         
            <h2 className="text-xl text-[#A6A9B8] font-semibold text-center">Get Test Tokens</h2>
            
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
          
          <div className="w-full">
            <button
              className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 px-7 rounded-full font-semibold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
              onClick={handleClaim}
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </main>
  );
  
  const DesktopFaucetContent: React.FC<ContentProps> = ({ address, setAddress, handleClaim }) => (
    <main className="flex-1 flex items-center justify-center relative w-full">
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