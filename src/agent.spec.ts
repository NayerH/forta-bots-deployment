import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Interface } from "ethers/lib/utils";
import { BOT_CREATE_FUNCTION_SIGNATURE, NETHERMIND_DEPLOYER_ADDRESS, PROXY_CONTRACT_ADDRESS } from './constants';
import agent from "./agent";

describe("Create-Bot Detection Bot", () => {
  let handleTransaction: HandleTransaction = agent.handleTransaction;
  let functionABI = new Interface([BOT_CREATE_FUNCTION_SIGNATURE]).getFunction("createAgent");

  it("returns empty findings if transaction is not involved with bot deployments", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent().setFrom(NETHERMIND_DEPLOYER_ADDRESS).setTo(PROXY_CONTRACT_ADDRESS);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  //Need to set to field in the TraceProps object for it to be detected
  it("returns empty findings if bot deployment is not done by Nethermind's deployment address", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"))
      .setTo(PROXY_CONTRACT_ADDRESS)
      .addTraces({
        function: functionABI,
        to: PROXY_CONTRACT_ADDRESS,
        arguments: [
          123456,
          createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"),
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if bot deployment is not done to the correct proxy address", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
      .setTo(createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"))
      .addTraces({
        function: functionABI,
        to: createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"),
        arguments: [
          123456,
          NETHERMIND_DEPLOYER_ADDRESS,
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns non-empty findings if bot deployment is done to the correct proxy address by Nethermind's deployer address", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
      .setTo(PROXY_CONTRACT_ADDRESS)
      .addTraces({
        function: functionABI,
        to: PROXY_CONTRACT_ADDRESS,
        arguments: [
          123456,
          NETHERMIND_DEPLOYER_ADDRESS,
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([Finding.fromObject({
      name: "Bot Deployment",
      description: "A bot was deployed by Nethermind's Forta deployer address",
      alertId: "BOT-1",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "polygon",
      metadata: {
        agentId : "123456",
        metadata : "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
      },
    })]);
  });


});
