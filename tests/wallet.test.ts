import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

const A = '0x1111111111111111111111111111111111111111';
const B = '0x2222222222222222222222222222222222222222';
let accounts = [A];
let connectAction = async () => {};
const events = new Map<string, () => void>();
const provider = {
  async request() { return accounts; },
  on(name: string, callback: () => void) { events.set(name, callback); }
};
Object.assign(globalThis, {window: {ethereum: provider}});
mock.module('genlayer-js', {namedExports: {createClient: () => ({connect: () => connectAction()})}});
const wallet = await import('../src/services/wallet.ts');

test('wallet connection, account switch, disconnection and reconnect guards', async () => {
  assert.equal(await wallet.connectWallet(), A);
  accounts = [B]; events.get('accountsChanged')!();
  assert.equal(wallet.getWalletAddress(), null);
  await assert.rejects(wallet.getWriteClient(), /Connect your wallet/);
  assert.equal(await wallet.connectWallet(), B);
  events.get('disconnect')!();
  assert.equal(wallet.getWalletAddress(), null);
  await wallet.connectWallet();
  accounts = [A];
  await assert.rejects(wallet.getWriteClient(), /account changed/);
  assert.equal(wallet.getWalletAddress(), null);
});

test('account changing during chain connection cannot produce stale writer', async () => {
  accounts = [A]; await wallet.connectWallet();
  connectAction = async () => { accounts = [B]; events.get('accountsChanged')!(); };
  await assert.rejects(wallet.getWriteClient(), /changed or disconnected/);
  assert.equal(wallet.getWalletAddress(), null);
  connectAction = async () => {};
});

test('chain changes disconnect cached wallet', async () => {
  accounts = [A]; await wallet.connectWallet();
  events.get('chainChanged')!();
  assert.equal(wallet.getWalletAddress(), null);
});

test('provider RPC failure prevents write-client acquisition', async () => {
  accounts = [A]; await wallet.connectWallet();
  connectAction = async () => { throw new Error('RPC failure'); };
  await assert.rejects(wallet.getWriteClient(), /RPC failure/);
  connectAction = async () => {};
});
