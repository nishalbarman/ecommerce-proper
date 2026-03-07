const crypto = require("node:crypto");
const fs = require("node:fs");

const algorithm = "aes-256-gcm";

const SECRET_SALT =
  process.env.SECRET_SALT_SERVICE_ACCOUNT || "Secret Salt You Should Update";
const SECRET_PASSPHRASE =
  process.env.SECRET_PASSPHRASE_SERVICE_ACCOUNT ||
  "Secret Key You Should Update";

const secretKey = crypto.scryptSync(SECRET_PASSPHRASE, SECRET_SALT, 32);

function decryptToString(secureServiceAccountEntry) {
  const encryptedData = secureServiceAccountEntry;

  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encryptedData.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(encryptedData.auth_tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.data, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

async function encryptToSecure() {
  const filePath =
    process.argv[2] || "C:/Users/$USERNAME/Downloads/service-account.json";
  const fileData = fs.readFileSync(filePath, "utf8");

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(fileData, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const result = {
    iv: iv.toString("hex"),
    auth_tag: authTag.toString("hex"),
    data: encrypted.toString("base64"),
  };

  await fs.writeFileSync(`${filePath}.secure`, JSON.stringify(result));

  console.log(`Encrypted file written to ${filePath}.secure!`);
}

module.exports = {
  decryptToString,
};
