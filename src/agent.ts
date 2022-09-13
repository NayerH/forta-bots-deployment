import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

const BOT_CREATE_FUNCTION_SIGNATURE : string = "function createAgent(uint256 agentId,address owner,string metadata,uint256[] chainIds)";
const NETHERMIND_DEPLOYER_ADDRESS : string = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";
const PROXY_CONTRACT_ADDRESS : string = "0x61447385B019187daa48e91c55c02AF1F1f3F863";

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
              agentId,
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
