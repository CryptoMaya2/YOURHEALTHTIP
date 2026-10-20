import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const environment = import.meta.env || {};
type Provider = NonNullable<Parameters<typeof createClient>[0]>['provider'];
let address: `0x${string}` | null = null;
let provider: Provider;
const listeners = new Set<() => void>();
export const isOnChain = environment.VITE_USE_GENLAYER_CONTRACT !== 'false';
export const subscribeWallet = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getWalletAddress = () => address;
function notify() { listeners.forEach(listener => listener()); }
export function disconnectWallet() { address = null; notify(); }
export async function connectWallet() {
  const injected = (window as unknown as { ethereum?: Provider }).ethereum;
  if (!injected) throw new Error('Install a browser wallet such as MetaMask to continue.');
  if (provider !== injected) {
    provider = injected;
    const events = injected as unknown as { on?: (name: string, callback: () => void) => void };
    events.on?.('accountsChanged', disconnectWallet);
    events.on?.('chainChanged', disconnectWallet);
    events.on?.('disconnect', disconnectWallet);
  }
  const accounts = await injected.request({ method: 'eth_requestAccounts' }) as string[];
  if (!accounts[0] || !/^0x[0-9a-fA-F]{40}$/.test(accounts[0])) throw new Error('No wallet account selected.');
  const client = createClient({chain: studionet, account: accounts[0] as `0x${string}`, provider: injected,
    endpoint: environment.VITE_GENLAYER_RPC_URL || undefined});
  await client.connect('studionet');
  const current = await injected.request({method:'eth_accounts'}) as string[];
  if (!current[0] || !/^0x[0-9a-fA-F]{40}$/.test(current[0])) throw new Error('Wallet was disconnected.');
  address = current[0] as `0x${string}`;
  notify();
  return address;
}
export async function getWriteClient() {
  if (!address || !provider) throw new Error('Connect your wallet before submitting a transaction.');
  const accounts = await provider.request({method:'eth_accounts'}) as string[];
  if (accounts[0]?.toLowerCase() !== address.toLowerCase()) {
    disconnectWallet(); throw new Error('Wallet account changed. Please reconnect.');
  }
  const client = createClient({chain:studionet, account:address, provider,
    endpoint:environment.VITE_GENLAYER_RPC_URL || undefined});
  const expected = address;
  await client.connect('studionet');
  const current = await provider.request({method:'eth_accounts'}) as string[];
  if (!address || address !== expected || current[0]?.toLowerCase() !== expected.toLowerCase()) {
    disconnectWallet(); throw new Error('Wallet account changed or disconnected. Please reconnect.');
  }
  return client;
}
