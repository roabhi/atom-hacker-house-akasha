import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

const RPC_ENDPOINT = "https://rpc-palvus.pion-1.ntrn.tech";
const FAUCET_PRIVATE_KEY = "your-private-key-here"; // Replace with base64 encoded private key
const DENOM = "untrn";
const AMOUNT = "10000"; // 0.01 NTRN (considering 6 decimals)

export async function sendTokens(recipientAddress: string): Promise<string> {
  try {
    // Create a wallet from private key
    const privateKeyBytes = Buffer.from(FAUCET_PRIVATE_KEY, 'base64');
    const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes, "neutron");
    const [account] = await wallet.getAccounts();
    
    const client = await SigningStargateClient.connectWithSigner(
      RPC_ENDPOINT,
      wallet
    );

    const result = await client.sendTokens(
      account.address,
      recipientAddress,
      [{ denom: DENOM, amount: AMOUNT }],
      {
        amount: [{ denom: DENOM, amount: "5000" }],
        gas: "200000",
      }
    );

    return result.transactionHash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error("Failed to send tokens");
  }
}

export async function validateAddress(address: string): Promise<boolean> {
  try {
    return address.startsWith("neutron") && address.length === 44;
  } catch {
    return false;
  }
}