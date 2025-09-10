import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js";

// Sabitle: yayıncı adresin (Raingaia LLC / RGZTEC kasası)
const ISSUER = "0xYOUR_ISSUER_ADDRESS";

// Opsiyonel anchor
const LIC_CONTRACT = "0xYOUR_CONTRACT_ADDR";  // yoksa "" bırak
const RPC_URL = "https://rpc.ankr.com/eth_sepolia";
const ABI = ["function isAnchored(bytes32) view returns (bool)"];

// Kanonik JSON (frontend)
function sort(x){
  if(Array.isArray(x)) return x.map(sort);
  if(x && typeof x === 'object') return Object.keys(x).sort().reduce((a,k)=>(a[k]=sort(x[k]),a),{});
  return x;
}
function canonicalize(obj){ return JSON.stringify(sort(obj)); }

async function verify(bundle){
  if(!bundle || !bundle.license || !bundle.signature) return { ok:false, reason:"Bad bundle" };

  const canon = canonicalize(bundle.license);
  const hash  = ethers.keccak256(ethers.toUtf8Bytes(canon));

  if (bundle.hash && bundle.hash.toLowerCase() !== hash.toLowerCase()) {
    return { ok:false, reason:"Hash mismatch" };
  }

  const recovered = ethers.verifyMessage(ethers.getBytes(hash), bundle.signature);
  if (recovered.toLowerCase() !== ISSUER.toLowerCase()) {
    return { ok:false, reason:"Wrong issuer (signature not by RGZTEC)" };
  }

  let anchored = null;
  if (LIC_CONTRACT) {
    const p = new ethers.JsonRpcProvider(RPC_URL);
    const reg = new ethers.Contract(LIC_CONTRACT, ABI, p);
    anchored = await reg.isAnchored(hash);
  }

  return { ok:true, hash, issuer: recovered, anchored };
}

const file = document.getElementById('file');
const out  = document.getElementById('out');

file.addEventListener('change', async ()=>{
  const f = file.files[0];
  if(!f){ out.textContent = "No file."; return; }
  try{
    const txt = await f.text();
    const bundle = JSON.parse(txt);
    const res = await verify(bundle);
    out.textContent = JSON.stringify(res, null, 2);
  }catch(e){
    out.textContent = "Error: " + e.message;
  }
});
