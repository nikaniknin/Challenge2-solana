// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const transferSol = async() => {
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");

    // Generate a new keypair
    const from = Keypair.generate();
    console.log("\n\tSender wallet " + from.publicKey);

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();
    console.log("\tReceiver wallet " + to.publicKey);

    // Aidrop 2 SOL to Sender wallet
    console.log("\n\tAirdopping some SOL to Sender wallet!\n");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    //console.log("\nlatestBlockHash.blockhash " + latestBlockHash.blockhash);
    //console.log("latestBlockHash.lastValidBlockHeight " + latestBlockHash.lastValidBlockHeight);
    //console.log("signature: fromAirDropSignature " + fromAirDropSignature);

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("\n\tAirdrop completed for the Sender account");

    // Get the wallet balance from a given public key
    const getWalletBalance = async (_publickey) => { 
        try {
            const walletBalance = await connection.getBalance(_publickey);
            return walletBalance;
        } catch (err) {
            console.log(err);
            return 0;
        }
        };
        
    // Ensure balance is updated after airdrop
    //await new Promise(r => setTimeout(r, 1000)); // Delay to ensure balance is updated
    
    const fromBalance = await getWalletBalance(from.publicKey);
    console.log(`\n\tSender balance before transfer: ${fromBalance / LAMPORTS_PER_SOL} SOL`);
        
    // Calculate 50% of the sender's current balance for the transfer amount
    const transferAmount = fromBalance / 2;
    console.log(`\tTransferring 50% of sender's balance: ${transferAmount / LAMPORTS_PER_SOL} SOL to receiver.`);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: transferAmount
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('\n\tSignature is', signature);

    // Checking balances after the transfer
    const updatedFromBalance = await getWalletBalance(from.publicKey);
    console.log(`\n\tSender balance after transfer:  ${updatedFromBalance / LAMPORTS_PER_SOL} SOL`);
    const toBalance = await getWalletBalance(to.publicKey);
    console.log(`\tReceiver balance after transfer: ${toBalance / LAMPORTS_PER_SOL} SOL`);
}

transferSol();

