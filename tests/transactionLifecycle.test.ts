import test from 'node:test';
import assert from 'node:assert/strict';
import { requireFinalizedSuccess, settleTransaction, signatureError, TransactionFailure, PendingTransaction } from '../src/services/transactionLifecycle.ts';

test('ACCEPTED is provisional even with successful execution', () => {
  assert.throws(() => requireFinalizedSuccess({statusName:'ACCEPTED', txExecutionResultName:'FINISHED_WITH_RETURN'}), PendingTransaction);
});
test('finalization without execution success is rejected', () => {
  assert.throws(() => requireFinalizedSuccess({statusName:'FINALIZED'}), TransactionFailure);
  assert.throws(() => requireFinalizedSuccess({statusName:'FINALIZED', txExecutionResultName:'NOT_VOTED'}), TransactionFailure);
});
test('finalized contract revert is rejected', () => {
  assert.throws(() => requireFinalizedSuccess({statusName:'FINALIZED', txExecutionResultName:'FINISHED_WITH_ERROR'}), TransactionFailure);
});
test('canceled and undetermined receipts are failures', () => {
  for (const status of ['CANCELED', 'UNDETERMINED']) assert.throws(() => requireFinalizedSuccess({status}), TransactionFailure);
});
test('successful finalized execution completes', async () => {
  const receipt = {statusName:'FINALIZED', txExecutionResultName:'FINISHED_WITH_RETURN'};
  assert.equal(await settleTransaction('0x123', async () => receipt), receipt);
});
test('RPC failure preserves unknown outcome and transaction hash', async () => {
  await assert.rejects(settleTransaction('0xabc', async () => { throw new Error('RPC offline'); }), /0xabc.*finalization could not be verified.*RPC offline/);
});
test('timeout never reports success or definite failure', async () => {
  await assert.rejects(settleTransaction('0xabc', async () => { throw new Error('timeout'); }), PendingTransaction);
});
test('receipt execution errors cannot be hidden by successful outer status', () => {
  assert.throws(() => requireFinalizedSuccess({statusName:'FINALIZED', txExecutionResultName:'FINISHED_WITH_RETURN', consensus_data:{leader_receipt:[{mode:'leader',error:'revert'}]}}), TransactionFailure);
});
test('signature rejection returns actionable cancellation', () => {
  assert.match(signatureError({code:4001}).message, /declined/);
  assert.match(signatureError(new Error('User denied transaction')).message, /declined/);
});

test('Studio finalized successful leader return is recognized without mainnet execution field', () => {
  requireFinalizedSuccess({statusName:'FINALIZED',consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS',result:{status:'return'},genvm_result:{error_code:null}}]}});
});
test('Studio error payload cannot pass even when execution string says SUCCESS', () => {
  assert.throws(() => requireFinalizedSuccess({statusName:'FINALIZED',consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS',result:{status:'error'}}]}}),TransactionFailure);
});
test('Studio accepted successful return still remains provisional', () => {
  assert.throws(() => requireFinalizedSuccess({statusName:'ACCEPTED',consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS',result:{status:'return'}}]}}),PendingTransaction);
});
