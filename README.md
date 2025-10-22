
# DigiLocker with Blockchain

A **decentralized document storage and verification system** that allows users to securely upload documents, store them on IPFS, and verify authenticity using a local blockchain (Hardhat).  

---

## Project Idea

DigiLocker-with-Blockchain is a secure web application that enables users to:

- Upload personal or official documents (PDF, JPG, etc.).
- Store documents **decentrally on IPFS**.  
- Record **document metadata and hashes** on a blockchain for immutability and verification.  
- Retrieve documents using **CID or transaction hash**.  
- Verify documents via **transaction confirmations** on the blockchain.  

This ensures documents are **tamper-proof, verifiable, and securely stored**.  

---

## Features

### Beginner-Level
- User authentication (login/register).  
- Document upload with basic metadata.  
- Folder-based organization of documents.  

### Intermediate-Level
- Document encryption before storage.  
- IPFS integration for decentralized storage.  
- Blockchain integration for immutability.  

### Advanced-Level
- Transaction verification with confirmations.  
- Real-time status updates: pending, confirmed, verified.  
- UI support for light/dark mode.  

---

## Project Architecture

\`\`\`
blockchain-project/
├─ blockchain/        # Hardhat smart contract project
│  ├─ contracts/      # Solidity contracts (DocumentRegistry.sol, DocumentStorage.sol)
│  ├─ scripts/        # Deployment scripts
│  ├─ artifacts/      # Compiled ABIs
│  ├─ cache/          # Hardhat compilation cache
│  ├─ hardhat.config.js
│  └─ .env
│
├─ backend/           # Node.js + Express backend
│  ├─ models/         # Mongoose schemas (User.js, Document.js)
│  ├─ routes/         # API routes (authRoutes.js, uploadRoutes.js)
│  ├─ contracts/      # Copied ABIs from blockchain
│  ├─ utils/          # Utility functions
│  └─ temp_uploads/   # Temporary file storage
│
└─ frontend/          # React frontend
   ├─ src/
   │  ├─ pages/
   │  │  ├─ Dashboard/
   │  │  ├─ RetrieveDocument/
   │  │  ├─ Login/
   │  │  ├─ Register/
   │  │  └─ ApiTest/
   │  ├─ components/
   │  ├─ context/     # AuthContext.js
   │  └─ App.js
   └─ public/
\`\`\`

---

## Technologies Used

- **Frontend:** React, CSS, Axios  
- **Backend:** Node.js, Express, MongoDB, Mongoose  
- **Blockchain:** Hardhat, ethers.js, Solidity  
- **Decentralized Storage:** IPFS (Pinata)  
- **Other:** JWT authentication, Tesseract.js (OCR for documents)

---

## Setup Instructions

### 1️⃣ Clone the repository
\`\`\`bash
git clone <repo-url>
cd blockchain-project
\`\`\`

### 2️⃣ Install dependencies
\`\`\`bash
# Blockchain
cd blockchain
npm install

# Backend
cd ../backend
npm install

# Frontend
cd ../frontend
npm install
\`\`\`

### 3️⃣ Start Hardhat local blockchain
\`\`\`bash
cd blockchain
npx hardhat node
\`\`\`
- This spins up a local Ethereum network with pre-funded test accounts.

### 4️⃣ Deploy Smart Contracts
\`\`\`bash
npx hardhat run scripts/deploy.js --network localhost
\`\`\`
- Note the deployed contract addresses.

### 5️⃣ Start Backend
\`\`\`bash
cd ../backend
npm run dev
\`\`\`
- Backend runs on \`http://localhost:5000\`.

### 6️⃣ Start Frontend
\`\`\`bash
cd ../frontend
npm start
\`\`\`
- Frontend runs on \`http://localhost:3000\`.

---

## How it Works

1. **Upload Document**
   - User uploads a document via Dashboard.
   - Document is stored in MongoDB and on **IPFS**.
   - Blockchain transaction is created with document metadata or hash.

2. **Retrieve Document**
   - Enter CID or transaction hash.
   - Frontend fetches document details from backend.
   - IPFS file can be previewed directly.

3. **Blockchain Verification**
   - Each document transaction is mined into a local Hardhat block.
   - Confirmations increase with subsequent blocks.
   - Once \`MAX_CONFIRMATIONS\` is reached, document is marked **Verified** ✅.

---

## Key Concepts

- **Mining:** Creating a new block that includes transactions. On Hardhat, can be done manually via \`evm_mine\`.
- **Confirmations:** Number of blocks added after your transaction block. More confirmations = higher guarantee of finality.
- **IPFS:** Decentralized storage system. Files are referenced via **CID**.
- **Hardhat:** Local Ethereum environment for deploying and testing smart contracts.

---

## Notes

- Local blockchain transactions do **not require real Ether**.  
- On testnet/mainnet, transactions require network Ether and cannot be mined manually.  
- This project can be extended to store **full document on IPFS**, or just **hashes** for lighter storage.  

---

## Author

*Aryan Naikar*  

---

## License

MIT License
