import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import {BOT_CREATE_FUNCTION_SIGNATURE, NETHERMIND_DEPLOYER_ADDRESS, PROXY_CONTRACT_ADDRESS} from './constants';

export function provideTransactionHandler(deployerAddress : string, proxyAddress: string, functionSignature: string): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    if(txEvent.from != deployerAddress) return findings;
    if(txEvent.to != proxyAddress) return findings;

    const createBotFunctionCalls = txEvent.filterFunction(functionSignature, proxyAddress);

    createBotFunctionCalls.forEach((createBotFunctionCall) => {

      const { agentId, metadata } = createBotFunctionCall.args;

        findings.push(
          Finding.fromObject({
            name: "Bot Deployment",
            description: "A bot was deployed by Nethermind's Forta deployer address",
            alertId: "BOT-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: "polygon",
            metadata: {
              agentId: agentId.toString(),
              metadata,
            },
          })
        );

    });

    return findings;
  };
}

export default {
  handleTransaction : provideTransactionHandler(NETHERMIND_DEPLOYER_ADDRESS, PROXY_CONTRACT_ADDRESS, BOT_CREATE_FUNCTION_SIGNATURE),
};
