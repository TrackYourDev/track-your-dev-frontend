import jwt from 'jsonwebtoken';
import fs from 'fs';

const appId = '1265874';

// Resolve the GitHub App private key lazily (inside the function) rather than at
// module load. In Next.js, modules are evaluated at build time while collecting
// routes, and a top-level readFileSync of a missing private-key.pem would crash
// the build. Prefer env vars; fall back to a local PEM only for local dev.
let cachedPrivateKey: string | undefined;

function getPrivateKey(): string {
  if (cachedPrivateKey) return cachedPrivateKey;

  let privateKey = process.env.PRIVATE_KEY;

  if (!privateKey && process.env.PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf8');
  }

  if (!privateKey) {
    privateKey = fs.readFileSync('./private-key.pem', 'utf8'); // fallback for local dev
  }

  cachedPrivateKey = privateKey;
  return privateKey;
}

const generateJwtToken = () => {
  return jwt.sign(
    {
      iss: appId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    getPrivateKey(),
    { algorithm: 'RS256' }
  );
};

export default generateJwtToken;
