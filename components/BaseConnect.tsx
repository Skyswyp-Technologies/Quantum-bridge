import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { color } from "@coinbase/onchainkit/theme";



export function WalletComponents() {
  return (
    <div className="flex justify-end">
      <Wallet>
        
        <ConnectWallet
          className="bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white font-bold py-2 px-4 rounded-full"
        >
          <Name className='text-white' />
        </ConnectWallet>
        <WalletDropdown className="z-[51] mt-2 bg-[#1A1A1A] border border-[#3E4347] rounded-lg shadow-xl">
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick={true}>
            <Avatar className="w-10 h-10 rounded-full" />
            <Name className="text-white font-semibold" />
            <Address className="text-[#A6A9B8] text-sm" />
            <EthBalance className="text-[#A6A9B8] text-sm" />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownLink
            icon="wallet"
            href="https://wallet.coinbase.com"
            className="text-[#A6A9B8] hover:text-white transition-colors duration-200"
          >
            Go to Wallet Dashboard
          </WalletDropdownLink>
          <WalletDropdownFundLink className="text-[#A6A9B8] hover:text-white transition-colors duration-200" />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
