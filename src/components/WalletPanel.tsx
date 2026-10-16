import { useState, useSyncExternalStore } from 'react';
import { connectWallet, disconnectWallet, getWalletAddress, isOnChain, subscribeWallet } from '../services/wallet';
export function WalletPanel() {
  const address=useSyncExternalStore(subscribeWallet,getWalletAddress,()=>null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  if(!isOnChain) return <div className="container" style={{padding:'0.75rem 1rem'}}>Demo mode · submissions stay in this browser.</div>;
  return <section className="container" aria-label="Wallet connection" style={{padding:'0.75rem 1rem'}}>
    <span>GenLayer Studio · {address ? `${address.slice(0,6)}…${address.slice(-4)}`:'Wallet disconnected'} </span>
    <button className="btn btn-outline btn-sm" disabled={busy} onClick={async()=>{
      setError(''); setBusy(true);
      try { if(address) disconnectWallet(); else await connectWallet(); }
      catch(e) {setError(e instanceof Error?e.message:'Wallet connection failed.');}
      finally {setBusy(false);}
    }}>{busy?'Connecting…':address?'Disconnect':'Connect wallet'}</button>
    {error && <p role="alert">{error}</p>}
  </section>;
}
