import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, keyLength);
  return `${salt}:${key.toString("hex")}`;
};

export const verifyPassword = async (password, digest) => {
  const [salt, keyHex] = digest.split(":");
  const key = await scryptAsync(password, salt, keyLength);
  return timingSafeEqual(key, Buffer.from(keyHex, "hex"));
};
