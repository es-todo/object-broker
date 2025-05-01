import { createSign } from "crypto";

export function create_sign(privateKeyPem: string) {
  function sign(message: string): string {
    // 1) Create a Sign object, specifying the hash algorithm
    const signer = createSign("RSA-SHA256");

    // 2) Push the message data into the signer
    signer.update(message, "utf8");
    signer.end();

    // 3) Compute the signature in base64
    const signature = signer.sign(privateKeyPem, "base64");
    return signature;
  }
  return sign;
}
