import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';
import type { HealthTip, ReviewRecord, CreateTipInput, SubmitChallengeInput, Category, ReviewStatus, EvidenceSource } from '../types/tip';
import type { ITipService, TipFilterOptions } from './tipService';
import { getWalletAddress, getWriteClient } from './wallet';

type Client = ReturnType<typeof createClient>;
interface RawReview { status: ReviewStatus; reviewed_at: string; evaluator: string; reasoning: string; sources: EvidenceSource[] }
interface RawChallenge { challenger: string; created_at: string; reason: string; evidence_url: string; status: string }
interface RawTip {
  id: string; title: string; content: string; category: Category; region: string; submitter: string;
  submitted_at: string; status: ReviewStatus; review: RawReview | null; reviews: RawReview[];
  challenges: RawChallenge[]; supporting_sources: string[]; flag_count: number;
}
export class GenLayerTipService implements ITipService {
  private address = import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS as `0x${string}` | undefined;
  private client = createClient({chain: studionet, endpoint:import.meta.env.VITE_GENLAYER_RPC_URL || undefined});
  private versionChecked = false;
  public isConfigured() { return Boolean(this.address && /^0x[0-9a-fA-F]{40}$/.test(this.address)); }
  public getContractAddress() { return this.address || null; }
  private async ready() {
    if (!this.isConfigured()) throw new Error('Set VITE_GENLAYER_CONTRACT_ADDRESS to the deployed v2 contract address.');
    if (!this.versionChecked) {
      const version = await this.client.readContract({address:this.address!,functionName:'get_version',args:[]});
      if (version !== '2') throw new Error('This frontend requires the YourHealthTip v2 contract. Deploy the updated contract first.');
      this.versionChecked = true;
    }
  }
  private transactionKey(id: string) { return `yht:${studionet.id}:${this.address}:${id}:transactions`; }
  private transactions(id: string): Record<string,string> {
    try { return JSON.parse(localStorage.getItem(this.transactionKey(id)) || '{}'); } catch { return {}; }
  }
  private async write(id:string, functionName:string, args:Parameters<Client['writeContract']>[0]['args']) {
    await this.ready();
    const writer = await getWriteClient();
    const hash = await writer.writeContract({address:this.address!,functionName,args,value:0n});
    // Persist the submitted hash before polling so a timeout can be investigated without resubmission.
    try { localStorage.setItem(this.transactionKey(id),JSON.stringify({...this.transactions(id),[`pending_${functionName}`]:hash})); } catch { /* optional local receipt cache */ }
    const receipt = await this.client.waitForTransactionReceipt({hash,status:TransactionStatus.ACCEPTED,retries:120,interval:3000});
    const status = String(receipt.statusName || receipt.status);
    if (!['ACCEPTED','FINALIZED','5','7'].includes(status)
        || (receipt.txExecutionResultName && receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN')
        || receipt.consensus_data?.leader_receipt?.some(r => r.mode === 'leader' && (r.error || /error|fail|revert/i.test(r.execution_result)))) {
      throw new Error(`Transaction ${hash} did not succeed (${status}). Check its receipt before retrying.`);
    }
    try {
      const tx=this.transactions(id); delete tx[`pending_${functionName}`];
      localStorage.setItem(this.transactionKey(id),JSON.stringify({...tx,[functionName]:hash}));
    } catch { /* optional local receipt cache */ }
    return hash;
  }
  async listTips(options:TipFilterOptions={}) {
    await this.ready();
    const ids = await this.client.readContract({address:this.address!,functionName:'get_all_tip_ids',args:[]}) as string[];
    const tips:HealthTip[]=[];
    // Do not hide RPC failures by quietly dropping records.
    for (const id of ids) { const tip=await this.getTip(id); if(tip) tips.push(tip); }
    return tips.filter(t => (!options.currentUserOnly || t.isCurrentUserSubmission)
      && (!options.category || options.category==='all' || t.category===options.category)
      && (!options.status || options.status==='all' || t.status===options.status)
      && (!options.searchQuery || `${t.title} ${t.content} ${t.region}`.toLowerCase().includes(options.searchQuery.trim().toLowerCase())))
      .sort((a,b) => options.sortBy==='oldest' ? Date.parse(a.submittedAt)-Date.parse(b.submittedAt)
        : options.sortBy==='recently-reviewed' ? (Date.parse(b.review?.reviewedAt || '')||0)-(Date.parse(a.review?.reviewedAt || '')||0)
        : Date.parse(b.submittedAt)-Date.parse(a.submittedAt));
  }
  async getTip(id:string):Promise<HealthTip|null> {
    await this.ready();
    const raw=JSON.parse(await this.client.readContract({address:this.address!,functionName:'get_tip',args:[id]}) as string) as RawTip;
    const tx=this.transactions(id);
    const mapReview=(r:RawReview):ReviewRecord=>({status:r.status,reviewedAt:r.reviewed_at,evaluator:r.evaluator,
      reasoning:r.reasoning,sourcesConsulted:r.sources || [],contractTransactionRef:`Contract: ${this.address}`});
    return {id:raw.id,title:raw.title,content:raw.content,summary:raw.content.slice(0,140),category:raw.category,
      region:raw.region,submittedBy:raw.submitter,submittedAt:raw.submitted_at,status:raw.status,isSampleData:false,
      isCurrentUserSubmission:raw.submitter.toLowerCase()===getWalletAddress()?.toLowerCase(),
      supportingSources:raw.supporting_sources,flagCount:raw.flag_count,
      review:raw.review ? {...mapReview(raw.review),contractTransactionRef:tx.review_tip || `Contract: ${this.address}`} :undefined,reviewHistory:raw.reviews.map(mapReview),transactions:tx,
      challenges:raw.challenges.map((c,index)=>({id:`${id}-${index}`,tipId:id,createdAt:c.created_at,
        challengerName:c.challenger,reason:c.reason,evidenceUrl:c.evidence_url,
        status:c.status==='resolved'?'resolved':'under-review'}))};
  }
  async submitTip(input:CreateTipInput) {
    if(!input.generalHealthAcknowledgement) throw new Error('Confirm the general health acknowledgement.');
    const id=`tip-${crypto.randomUUID()}`;
    await this.write(id,'submit_tip',[id,input.title.trim(),input.content.trim(),input.category,'',input.region?.trim()||'Global',JSON.stringify(input.supportingSources||[])]);
    return (await this.getTip(id))!;
  }
  async reviewTip(id:string,sourceUrl='') {
    await this.write(id,'review_tip',[id,sourceUrl]);
    const tip=(await this.getTip(id))!;
    if(['pending','under-challenge'].includes(tip.status)) throw new Error('Review transaction returned without a completed review. Refresh its receipt before retrying.');
    return tip;
  }
  async challengeTip(input:SubmitChallengeInput) {
    await this.write(input.tipId,'challenge_tip',[input.tipId,'',input.reason.trim(),input.evidenceUrl?.trim()||'']);
    return (await this.getTip(input.tipId))!;
  }
  async getReviewRecord(id:string) { return (await this.getTip(id))?.review || null; }
  async flagTip(id:string,reason:string) { await this.write(id,'flag_tip',[id,reason]); return true; }
  async resetToDefaultSampleData():Promise<void> { throw new Error('Network records cannot be reset from the browser.'); }
}
