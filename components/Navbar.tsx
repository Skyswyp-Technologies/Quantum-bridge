import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobConnect from "./ConnectWallet";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center w-full h-16 px-8 xl:px-20 mx-auto py-4 bg-[#000000] border-b border-b-[#3E4347]">
      <div className="flex flex-row gap-16 items-center ">
        <Link href={"/"} className="text-lg text-[#A6A9B8] w-[50px] h-[50px]">
          <Image src="/logo.svg" alt="wave" width={50} height={50} />
        </Link>

        <div className="flex flex-row gap-8 items-center">
          <Link href={"/"} className="text-lg text-[#A6A9B8] ">
            Bridge
          </Link>
          <Link href={"/"} className="text-lg text-[#A6A9B8] ">
            Faucet
          </Link>
        </div>
      </div>

      <MobConnect />
    </div>
  );
};

export default Navbar;
