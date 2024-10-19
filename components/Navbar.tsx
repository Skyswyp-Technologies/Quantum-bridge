import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobConnect from "./ConnectWallet";
import { BaseWallet } from "./BaseWallet";

const Navbar = () => {
  return (
    <div className="hidden md:flex justify-between items-center w-full h-16 px-8 xl:px-20 mx-auto py-4 bg-[#000000] border-b border-b-[#3E434773]">
      <div className="flex flex-row gap-16 items-center ">
        <Link href={"/"} className="text-lg text-[#A6A9B8] w-[50px] h-[50px]">
          <Image src="/logo.svg" alt="wave" width={50} height={50} />
        </Link>

        <div className="flex flex-row gap-8 items-center">
          <Link href={"/"} className="text-lg text-[#A6A9B8] ">
            Bridge
          </Link>
          <Link href={"/faucet"} className="text-lg text-[#A6A9B8] ">
            Faucet
          </Link>
          <Link href={"/domain"} className="text-lg text-[#A6A9B8] ">
            Domains
          </Link>
          <Link href={"/lending"} className="text-lg text-[#A6A9B8] ">
            Lending
          </Link>
        </div>
      </div>

      <MobConnect />
      {/* <BaseWallet /> */}
    </div>
  );
};

export default Navbar;
