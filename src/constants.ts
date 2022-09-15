import { createAddress } from "forta-agent-tools";

export const BOT_CREATE_FUNCTION_SIGNATURE : string = "function createAgent(uint256 agentId,address owner,string metadata,uint256[] chainIds)";
export const NETHERMIND_DEPLOYER_ADDRESS : string = createAddress("0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8");
export const PROXY_CONTRACT_ADDRESS : string = createAddress("0x61447385B019187daa48e91c55c02AF1F1f3F863");
