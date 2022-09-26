# Bot Deployment Challenge

## Description

This bot detects deployment of bots by Nethermind's deployer address

## Supported Chains

- Polygon

## Alerts

- BOT-1
  - Fired when a transaction is sent from Nethermind's bot deployment address to a proxy address to deploy a Forta bot
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata
    - `agentId`: unique identifier of the deployed bot
    - `metadata`: IPFS hash for the metadata of the bot

## Test Data

The agent behaviour can be verified with the following transactions:

- [0xb9fffc84511a7135aeed7db1f560951dac6c9ea49c8de353e9c41d70a322b210](https://polygonscan.com/tx/0xb9fffc84511a7135aeed7db1f560951dac6c9ea49c8de353e9c41d70a322b210)
