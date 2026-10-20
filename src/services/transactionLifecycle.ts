export interface Receipt {
  status?: unknown;
  statusName?: string;
  txExecutionResultName?: string;
  consensus_data?: { leader_receipt?: { mode?: string; error?: unknown; execution_result?: string; result?: unknown; genvm_result?: unknown }[] };
}

export class TransactionFailure extends Error {}
export class PendingTransaction extends Error {}

export function requireFinalizedSuccess(receipt: Receipt) {
  const status = String(receipt.statusName || receipt.status);
  if (['CANCELED', 'UNDETERMINED'].includes(status) || receipt.txExecutionResultName === 'FINISHED_WITH_ERROR') {
    throw new TransactionFailure(`Contract transaction failed (${status}, ${receipt.txExecutionResultName}).`);
  }
  if (status !== 'FINALIZED') throw new PendingTransaction(`Transaction is ${status}; finalization is not confirmed.`);
  const leaders = receipt.consensus_data?.leader_receipt?.filter(r => r.mode === 'leader') || [];
  const returned = (value: unknown) => typeof value === 'object' && value !== null && 'status' in value && value.status === 'return';
  const vmError = (value: unknown) => {
    if (!value || typeof value !== 'object') return false;
    const errors = value as Record<string, unknown>;
    return Boolean(errors.raw_error || errors.error_code || errors.error_description);
  };
  const studioSuccess = leaders.length > 0 && leaders.every(r => r.execution_result === 'SUCCESS'
    && returned(r.result) && !r.error && !vmError(r.genvm_result));
  if (receipt.txExecutionResultName ? receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN' : !studioSuccess) {
    throw new TransactionFailure(`Finalized transaction has no successful execution result (${receipt.txExecutionResultName || 'missing'}).`);
  }
  if (receipt.consensus_data?.leader_receipt?.some(r => r.mode === 'leader' && (r.error || /error|fail|revert/i.test(r.execution_result || '')))) {
    throw new TransactionFailure('Finalized transaction contains a contract execution error.');
  }
}

export async function settleTransaction(hash: string, wait: () => Promise<Receipt>) {
  let receipt: Receipt;
  try { receipt = await wait(); }
  catch (error) {
    throw new PendingTransaction(`Transaction ${hash}: finalization could not be verified. ${error instanceof Error ? error.message : String(error)}. Check its receipt before resubmitting.`);
  }
  requireFinalizedSuccess(receipt);
  return receipt;
}

export function signatureError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if ((typeof error === 'object' && error !== null && 'code' in error && error.code === 4001) || /user rejected|user denied|cancelled|declined/i.test(message)) {
    return new Error('Transaction declined: signature request was cancelled in your wallet.');
  }
  return new Error(`Transaction submission failed: ${message}`);
}
