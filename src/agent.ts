import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import { createAddress } from "forta-agent-tools";
import {BOT_CREATE_FUNCTION_ABI, NETHERMIND_DEPLOYER_ADDRESS, PROXY_CONTRACT_ADDRESS} from './constants';

export function provideTransactionHandler(deployerAddress : string, proxyAddress: string, functionABI: string): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];
    deployerAddress = createAddress(deployerAddress);
    proxyAddress = createAddress(proxyAddress);

    if(txEvent.from != deployerAddress) return findings;

    const createBotFunctionCalls = txEvent.filterFunction(functionABI, proxyAddress);

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
  handleTransaction : provideTransactionHandler(NETHERMIND_DEPLOYER_ADDRESS, PROXY_CONTRACT_ADDRESS, BOT_CREATE_FUNCTION_ABI),
};
