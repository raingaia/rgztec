import { ethers } from "ethers";
import { nanoid } from "nanoid";
import { canonicalize } from "../utils/c14n.js";
import fs from "node:fs";

const PRIV = process.env.ISSUER_PRIVKEY; // Gerekli: yayıncı özel anahtarı (0x...)
const RPC  = process.env.RPC_URL || "https://rpc.ankr.com/eth_sepolia";
const CONTRACT = process.env.LIC_CONTRACT || ""; // Opsiyonel: on-chain anchor adresi

if (!PRIV) throw new Error("ISSUER_PRIVKEY missing");

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIV, provider);
const issuer = await wallet.getAddress();

// workflow_dispatch veya manuel env ile beslenir
const argv = process.env;

function nowSec(){ return Math.floor(Date.now()/1000); }
function toIntOrNull(v){ return (v === undefined || v === "" ? null : parseInt(v,10)); }

const license = {
  issuer,
  licenseId: "lic_" + nanoid(10),
  product: {
    id: argv.PRODUCT_ID || "rgztec:template:pro",
    version: argv.PRODUCT_VERSION || "1.0.0"
  },
  grantee: {
    name: argv.GRANTEE_NAME || "Acme Inc.",
    email: argv.GRANTEE_EMAIL || "owner@example.com"
  },
  terms: {
    plan: argv.PLAN || "Extended",
    seats: parseInt(argv.SEATS || "1", 10),
    transferable: (argv.TRANSFERABLE || "false").toLowerCase() === "true"
  },
  constraints: {
    domain: (argv.DOMAINS || "").split(",").map(s=>s.trim()).filter(Boolean),
    maxBuilds: toIntOrNull(argv.MAX_BUILDS || "")
  },
  issuedAt: nowSec(),
  expiresAt: toIntOrNull(argv.EXPIRES_AT || "")
};

// 1) Hash
const canon = canonicalize(license);
const hash  = ethers.keccak256(ethers.toUtf8Bytes(canon));

// 2) İmza (message signature)
const signature = await wallet.signMessage(ethers.getBytes(hash));

// 3) Opsiyonel: On-chain anchor
if (CONTRACT) {
  const abi = [
    "function anchorLicense(bytes32 licenseHash) external",
    "function isAnchored(bytes32 licenseHash) view returns (bool)"
  ];
  const reg = new ethers.Contract(CONTRACT, abi, wallet);
  const anchored = await reg.isAnchored(hash);
  if (!anchored) {
    const tx = await reg.anchorLicense(hash);
    console.log("Anchoring tx:", tx.hash);
    await tx.wait();
  } else {
    console.log("Already anchored.");
  }
}

fs.mkdirSync("./licenses",{recursive:true});
const out = { license, signature, hash };
const file = `./licenses/${license.licenseId}.json`;
fs.writeFileSync(file, JSON.stringify(out, null, 2));
console.log("Wrote", file);
