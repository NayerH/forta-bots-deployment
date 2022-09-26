import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Interface } from "ethers/lib/utils";
import { BOT_CREATE_FUNCTION_ABI } from './constants';
import { provideTransactionHandler } from "./agent";

describe("Create-Bot Detection Bot", () => {
  const MOCK_NETHERMIND_DEPLOYER : string = createAddress("0x3");
  const MOCK_PROXY_ADDRESS : string = createAddress("0x2");
  let handleTransaction : HandleTransaction;

  beforeAll(() => {
    handleTransaction = provideTransactionHandler(MOCK_NETHERMIND_DEPLOYER, MOCK_PROXY_ADDRESS, BOT_CREATE_FUNCTION_ABI);
  });

  it("returns empty findings if transaction is not involved with bot deployments", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent().setFrom(MOCK_NETHERMIND_DEPLOYER).setTo(MOCK_PROXY_ADDRESS);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  //Need to set to field in the TraceProps object for it to be detected
  it("returns empty findings if bot deployment is not done by Nethermind's deployment address", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"))
      .setTo(MOCK_PROXY_ADDRESS)
      .addTraces({
        function: BOT_CREATE_FUNCTION_ABI,
        to: MOCK_PROXY_ADDRESS,
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
      .setFrom(MOCK_NETHERMIND_DEPLOYER)
      .setTo(createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"))
      .addTraces({
        function: BOT_CREATE_FUNCTION_ABI,
        to: createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"),
        arguments: [
          123456,
          MOCK_NETHERMIND_DEPLOYER,
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns a single finding one if bot deployment is done to the correct proxy address by Nethermind's deployer address", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(MOCK_NETHERMIND_DEPLOYER)
      .setTo(MOCK_PROXY_ADDRESS)
      .addTraces({
        function: BOT_CREATE_FUNCTION_ABI,
        to: MOCK_PROXY_ADDRESS,
        arguments: [
          123456,
          MOCK_NETHERMIND_DEPLOYER,
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

  it("returns multiple findings if bot deployment is done to the correct proxy address by Nethermind's deployer address", async () => {
    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(MOCK_NETHERMIND_DEPLOYER)
      .setTo(MOCK_PROXY_ADDRESS)
      .addTraces({
        function: BOT_CREATE_FUNCTION_ABI,
        to: MOCK_PROXY_ADDRESS,
        arguments: [
          123456,
          MOCK_NETHERMIND_DEPLOYER,
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [222],
        ]
      })
      .addTraces({
        function: BOT_CREATE_FUNCTION_ABI,
        to: MOCK_PROXY_ADDRESS,
        arguments: [
          654321,
          MOCK_NETHERMIND_DEPLOYER,
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [333],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([
        Finding.fromObject({
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
      }),
      Finding.fromObject({
        name: "Bot Deployment",
        description: "A bot was deployed by Nethermind's Forta deployer address",
        alertId: "BOT-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "polygon",
        metadata: {
          agentId : "654321",
          metadata : "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
        },
      })
    ]);
  });


});
