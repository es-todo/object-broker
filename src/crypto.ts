import { sha256 } from "js-sha256";

export function gen_password(password: string) {
  const salt = sha256(new Date().toISOString() + Math.random().toString());
  const derived = sha256(`${salt}$${password}`);
  return `${salt}$${derived}`;
}

export function verify_password(password: string, hashed: string) {
  const [salt, pass_str] = hashed.split("$");
  const derived = sha256(`${salt}$${password}`);
  return derived === pass_str;
}
