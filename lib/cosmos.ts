import {
  SigningStargateClient,
  StargateClient,
  calculateFee,
} from '@cosmjs/stargate'
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'

const RPC_ENDPOINT = 'https://rpc-palvus.pion-1.ntrn.tech'
const FAUCET_PRIVATE_KEY =
  'ea68086bcf2d8c1a94e76827dff019d1ced28ba465641011b7d3771ac4e715a3'
const DENOM = 'untrn'
const AMOUNT = '10000' // 0.01 NTRN (considering 6 decimals)
const GAS_PRICE = GasPrice.fromString('0.025untrn')
const GAS_MULTIPLIER = 1.6

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

export async function sendTokens(recipientAddress: string): Promise<string> {
  try {
    // Validate recipient address
    if (!(await validateAddress(recipientAddress))) {
      throw new Error('Invalid recipient address')
    }

    // Convert hex private key to Uint8Array
    const privateKeyBytes = hexToBytes(FAUCET_PRIVATE_KEY)

    const wallet = await DirectSecp256k1Wallet.fromKey(
      privateKeyBytes,
      'neutron'
    )
    const [account] = await wallet.getAccounts()

    // Connect to the network with proper gas configuration
    const client = await SigningStargateClient.connectWithSigner(
      RPC_ENDPOINT,
      wallet,
      {
        gasPrice: GAS_PRICE,
      }
    )

    // Verify sender has sufficient balance
    const balance = await client.getBalance(account.address, DENOM)
    if (BigInt(balance.amount) < BigInt(AMOUNT)) {
      throw new Error('Insufficient funds in faucet wallet')
    }

    // Simulate the transaction to estimate gas
    const simulate = await client.simulate(
      account.address,
      [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: {
            fromAddress: account.address,
            toAddress: recipientAddress,
            amount: [{ denom: DENOM, amount: AMOUNT }],
          },
        },
      ],
      ''
    )

    // Calculate gas with safety margin
    const estimatedGas = Math.round(simulate * GAS_MULTIPLIER)
    const fee = calculateFee(estimatedGas, GAS_PRICE)

    // Send the transaction with estimated gas
    const result = await client.sendTokens(
      account.address,
      recipientAddress,
      [{ denom: DENOM, amount: AMOUNT }],
      fee,
      'Faucet distribution'
    )

    if (!result?.transactionHash) {
      throw new Error('Transaction failed - no hash returned')
    }

    // Verify transaction success
    const txResponse = await client.getTx(result.transactionHash)
    if (!txResponse || txResponse.code !== 0) {
      throw new Error(
        `Transaction failed on chain with code ${txResponse?.code}`
      )
    }

    return result.transactionHash
  } catch (error) {
    console.error('Transaction failed:', error)
    if (error instanceof Error) {
      console.error('Detailed error message:', error.message)
      throw new Error(`Transaction failed: ${error.message}`)
    }
    throw new Error('Transaction failed with unknown error')
  }
}

export async function validateAddress(address: string): Promise<boolean> {
  if (!address.startsWith('neutron')) {
    console.error('Invalid address format:', address)
    return false
  }

  try {
    const client = await StargateClient.connect(RPC_ENDPOINT)
    const account = await client.getAccount(address)
    return account !== null // Check if account exists
  } catch (error) {
    console.error('Address validation failed:')
    return false // Return false if any error occurs
  }
}
