import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { Settings, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo_falwsb.png";
import { PresaleContract } from "../lib/config";

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  const { data: owner } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "owner",
  });

  // Redirect if not the owner
  if (isConnected && address && owner && address.toLowerCase() !== (owner as string).toLowerCase()) {
    return (
      <div className="min-h-screen bg-light-blue font-baloo flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-blue-green mb-4">Access Denied</h1>
          <p className="text-dark-blue-green mb-6">You are not authorized to access this page.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-dark-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Presale
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-blue font-baloo">
      {/* Header */}
      <header className="border-b bg-dark-blue backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="FarmrSwap"
                className="w-10 h-10 rounded-lg shadow-md"
              />
              <h1 className="text-xl font-bold text-muted-blue font-fredoka">
                Farmrswap
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-blue hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Presale</span>
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-dark-blue-green text-2xl font-bold mb-4">
            <Settings className="w-6 h-6" />
            Admin Panel
          </div>
          <p className="text-dark-blue-green">
            Manage your presale contract settings and functions.
          </p>
        </div>

        {/* Admin content area - currently empty as requested */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-dark-blue rounded-lg border border-muted-blue p-8 text-center">
            <p className="text-muted-blue text-lg">
              Admin functions will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}