"use client"

import React, { useState } from 'react';
import Navbar from './Navbar';

interface ContentProps {
  address: string;
  setAddress: (address: string) => void;
  handleClaim: () => void;
}

const Faucet: React.FC = () => {
  const [address, setAddress] = useState<string>('');

  const handleClaim = () => {
    // Implement claim functionality here
    console.log('Claiming tokens for address:', address);
  };

  return (
    <>
      {/* Mobile view */}
      <div className="bg-[#000000] text-white min-h-screen w-full flex flex-col md:hidden">
        <Navbar />
        <FaucetContent address={address} setAddress={setAddress} handleClaim={handleClaim} />
      </div>

      {/* Desktop view */}
      <div className="bg-[#000000] text-white h-screen w-full hidden md:flex flex-col">
        <Navbar />
        <FaucetContent address={address} setAddress={setAddress} handleClaim={handleClaim} />
      </div>
    </>
  );
};

const FaucetContent: React.FC<ContentProps> = ({ address, setAddress, handleClaim }) => (
  <main className="flex-grow flex items-center justify-center px-4 relative">
    {/* Glow effect */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6AEFFF] opacity-30 blur-[100px] rounded-full"></div>
    
    <div className="max-w-3xl w-full space-y-5 text-center relative z-10">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2859A9] to-[#6AEFFF] text-transparent bg-clip-text">
        FAUCET
      </h1>
      <p className="text-xl text-gray-300">Get Test Tokens</p>

      <div className='w-full md:w-[800px] mx-auto bg-[#1A1A1A80] border border-[#3E434773] rounded-lg p-6 flex flex-col gap-8 backdrop-blur-sm'>
         <label className='text-[#FFFFFF] text-xl'>Enter your address</label>

         <div className='flex flex-col md:flex-row justify-between items-center pb-10 gap-4'>
            <div className='flex flex-col md:flex-row gap-4 items-center w-full md:w-auto'>
                <button className='p-2 bg-[#1E1E1E] rounded hover:bg-[#2A2A2A] transition-colors'>
                    Paste
                </button>

                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full md:w-[50%] bg-transparent border-b border-gray-700 py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 relative z-10"
                />
            </div>

            <button
              className="w-full md:w-auto bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-4 px-7 rounded-full hover:bg-gradient-to-l transition-colors duration-200 font-bold text-2xl text-white"
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