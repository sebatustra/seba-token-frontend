import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { FC, useState } from "react";
import styles from "../styles/Home.module.css";
import * as token from "@solana/spl-token";

export const CreateMintForm: FC = () => {
  const [txSig, setTxSig] = useState("");
  const [mint, setMint] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : "";
  };

  const createMint = async (event) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = web3.Keypair.generate();
    const tokenProgramId = token.TOKEN_PROGRAM_ID;

    const transaction = new web3.Transaction();

    const createAccountInstruction = web3.SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: token.MINT_SIZE,
        lamports,
        programId: tokenProgramId
    });

    const initializeMintInstruction = token.createInitializeMintInstruction(
        mintKeypair.publicKey,
        0,
        publicKey,
        publicKey,
        tokenProgramId
    );



    transaction.add(createAccountInstruction);
    transaction.add(initializeMintInstruction);

    await sendTransaction(transaction, connection, {signers: [mintKeypair]}).then((sig) => {
        setTxSig(sig);
        setMint(mintKeypair.publicKey.toString())
    })
  };

  return (
    <div>
      {publicKey ? (
        <form onSubmit={createMint} className={styles.form}>
          <button type="submit" className={styles.formButton}>
            Create Mint
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div>
          <p>Token Mint Address: {mint}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
