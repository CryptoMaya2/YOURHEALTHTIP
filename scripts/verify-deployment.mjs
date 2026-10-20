import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';

const address = process.argv[2];
if (!/^0x[0-9a-fA-F]{40}$/.test(address || '')) throw new Error('Usage: npm run verify:deployment -- <deployed-v3-address>');
const sourcePath = 'contracts/your_health_tip.py';
const source = readFileSync(sourcePath);
const sourceCommit = execFileSync('git', ['log', '-1', '--format=%H', '--', sourcePath], {encoding:'utf8'}).trim();
const committedSource = execFileSync('git', ['show', `${sourceCommit}:${sourcePath}`]);
if (!source.equals(committedSource)) throw new Error('Commit contract changes before verifying a deployment.');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const client = createClient({chain:studionet, endpoint:process.env.GENLAYER_RPC_URL || undefined});
const deployedSource = await client.getContractCode(address);
if (sha256(source) !== sha256(deployedSource)) throw new Error('Deployed code differs from the published source.');
const version = await client.readContract({address,functionName:'get_version',args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
if (version !== '3') throw new Error('Deployed version is not v3 in finalized state.');
const result = {verifiedAt:new Date().toISOString(),chainId:studionet.id,contractAddress:address,contractVersion:version,
  reviewedSourceCommit:sourceCommit,sourceSha256:sha256(source),deployedSourceSha256:sha256(deployedSource),sourceMatches:true};
writeFileSync('deployments/v3-source-verification.json', JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
