import { useState } from 'react'
import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui/button'
import { parseEther } from 'viem'

const PRESALE_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}], "name": "OwnershipTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{"indexed":true,"internalType":"address","name":"purchaser","type":"address"},{"indexed":true,"internalType":"address","name":"beneficiary","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}], "name": "TokensPurchased", "type": "event" },
  { "inputs": [], "name": "ReopenFinalizeSale", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"address","name":"beneficiary","type":"address"}], "name": "buyTokens", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "closeSale", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "costToEnter", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"address","name":"_address","type":"address"}], "name": "finalizeSale", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getEntranceFee", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getFinalizeSale", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getPreSaleStatus", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "hardCap", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"initRate","type":"uint256"},{"internalType":"uint256","name":"entranceFee","type":"uint256"},{"internalType":"uint256","name":"maxBuy","type":"uint256"},{"internalType":"uint256","name":"_softCap","type":"uint256"},{"internalType":"uint256","name":"_hardcap","type":"uint256"}], "name": "initialiser", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "isOwner", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "maxCostToEnter", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "openSale", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "rate", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"_newFee","type":"uint256"}], "name": "setEntranceFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"_newFee","type":"uint256"}], "name": "setMaxBUY", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"_Rate","type":"uint256"}], "name": "setRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "softCap", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "token", "outputs": [{"internalType":"contract IERC20","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"address","name":"","type":"address"}], "name": "trackedTKN", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"address","name":"newOwner","type":"address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "wallet", "outputs": [{"internalType":"address payable","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "weiRaised", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "stateMutability": "payable", "type": "receive" }
 ] as const

// TODO: replace with deployed contract address on Sepolia
const PRESALE_ADDRESS: `0x${string}` = '0x0000000000000000000000000000000000000000'

function App() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash })
  const [ethValue, setEthValue] = useState<string>('0.01')

  const { data: cost } = useReadContract({
    abi: PRESALE_ABI,
    address: PRESALE_ADDRESS,
    functionName: 'getEntranceFee',
  })

  const handleBuy = () => {
    if (!address) return
    writeContract({
      abi: PRESALE_ABI,
      address: PRESALE_ADDRESS,
      functionName: 'buyTokens',
      args: [address],
      value: parseEther(ethValue),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <header className="w-full border-b sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Token Presale</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 flex-1 grid gap-8 md:grid-cols-2 items-start">
        <section className="rounded-xl border bg-card p-6 shadow">
          <h2 className="text-2xl font-semibold mb-2">Buy before price increases!</h2>
          <p className="text-sm text-muted-foreground mb-6">Connect your wallet and purchase presale tokens on Sepolia.</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Entrance Fee</span>
              <span className="font-medium">{cost ? `${Number(cost) / 1e18} ETH` : '—'}</span>
            </div>
            <label className="block text-sm font-medium">Pay Token (ETH)</label>
            <input
              value={ethValue}
              onChange={(e) => setEthValue(e.target.value)}
              type="number"
              min="0"
              step="0.001"
              className="w-full rounded-md border bg-background px-3 py-2"
            />
            <Button
              onClick={handleBuy}
              disabled={!isConnected || isPending}
              className="w-full"
            >
              {isPending ? 'Confirming…' : 'Buy Now'}
            </Button>
            {hash && <p className="text-xs text-muted-foreground">Tx: {hash}</p>}
            {txSuccess && <p className="text-xs text-green-600">Success! Tokens purchased.</p>}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6 shadow">
          <h2 className="text-2xl font-semibold mb-2">Sale details</h2>
          <ul className="space-y-2 text-sm">
            <li>Network: Sepolia</li>
            <li>Contract: <code className="break-all">{PRESALE_ADDRESS}</code></li>
          </ul>
        </section>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
        Built with Tailwind and shadcn/ui
      </footer>
    </div>
  )
}

export default App
