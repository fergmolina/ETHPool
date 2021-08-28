# Smart Contract Challenge

## A) Challenge

### 1) Setup a project and create a contract

#### Summary

ETHPool provides a service where people can deposit ETH and they will receive weekly rewards. Users must be able to take out their deposits along with their portion of rewards at any time. New rewards are deposited manually into the pool by the ETHPool team each week using a contract function.

![Alt Text](https://media4.giphy.com/media/TdwziQPhbNAzK/giphy.gif)

Requeriments and goals with a green tick are done for this project. 

#### Requirements 

- Only the team can deposit rewards. :heavy_check_mark:
- Deposited rewards go to the pool of users, not to individual users. :heavy_check_mark:
- Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited. :heavy_check_mark:

Example:

> Let say we have user **A** and **B** and team **T**.
>
> **A** deposits 100, and **B** deposits 300 for a total of 400 in the pool. Now **A** has 25% of the pool and **B** has 75%. When **T** deposits 200 rewards, **A** should be able to withdraw 150 and **B** 450.
>
> What if the following happens? **A** deposits then **T** deposits then **B** deposits then **A** withdraws and finally **B** withdraws.
> **A** should get their deposit + all the rewards.
> **B** should only get their deposit because rewards were sent to the pool before they participated.

#### Goal

Design and code a contract for ETHPool, take all the assumptions you need to move forward. :heavy_check_mark:

You can use any development tools you prefer: **Hardhat**, Truffle, Brownie, Solidity, Vyper. :heavy_check_mark:

### Assumptions

Nothing is said about autocompund. One assumption that I made is that the rewards that were given are not back to the deposit pool automatically. Users must withdraw the rewards and deposit it back. 

### Patterns

Following patterns were used in this project:
- **Multiply before Dividing pattern** when the reward for each user is being calculated
- **Checks Effects Interaction pattern** when a transfer is made
- **Access Restriction pattern** for only team functions

### 2) Deploy your contract

Deploy the contract to any Ethereum testnet of your preference. Keep record of the deployed address.

Bonus:

- Verify the contract in Etherscan

### 3) Interact with the contract

Create a script (or a Hardhat task) to query the total amount of ETH held in the contract.

_You can use any library you prefer: Ethers.js, Web3.js, Web3.py, eth-brownie_

