import crypto from "node:crypto";
import fs from "node:fs";

const algorithm = "aes-256-gcm";

const SECRET_SALT = process.env.SECRET_SALT || "Secret Salt You Should Update";
const SECRET_PASSPHRASE =
  process.env.SECRET_PASSPHRASE || "Secret Key You Should Update";

const secretKey = crypto.scryptSync(SECRET_PASSPHRASE, SECRET_SALT, 32); // salt can be random, but in this case we are just using a string

function decryptToString(secureServiceAccountEntry, key = secretKey) {
  console.log(`Decrypting ${secureServiceAccountEntry}...`);

  const encryptedData = JSON.parse(secureServiceAccountEntry);

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(encryptedData.auth_tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.data, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export { decryptToString };
