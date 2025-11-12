import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";

import {
  deserializeCredential,
  getRepositoryId,
  type PasskeyDiscoverableCredential,
  type PasskeysCredentialsRepository,
  serializeCredential,
} from "./credentials-repository";

const CREDENTIALS_DIR = path.join(__dirname, "./credentials");

export class PasskeysCredentialsFileRepository implements PasskeysCredentialsRepository {
  private transactionLock: Promise<void> = Promise.resolve();

  constructor(private readonly credentialsDir: string = CREDENTIALS_DIR) {
    fsSync.mkdirSync(credentialsDir, { recursive: true });
  }

  async saveCredential(credential: PasskeyDiscoverableCredential): Promise<void> {
    const id = getRepositoryId(credential);
    const filename = path.join(this.credentialsDir, `${id}.json`);
    const serialized = serializeCredential(credential);
    await fs.writeFile(filename, serialized, "utf-8");
  }

  async deleteCredential(credential: PasskeyDiscoverableCredential): Promise<void> {
    const id = getRepositoryId(credential);
    const filename = path.join(this.credentialsDir, `${id}.json`);
    try {
      await fs.unlink(filename);
    } catch {
      // Ignore errors if file doesn't exist
    }
  }

  async loadCredentials(): Promise<PasskeyDiscoverableCredential[]> {
    const files = await fs.readdir(this.credentialsDir);
    const credentials: PasskeyDiscoverableCredential[] = [];

    for (const file of files) {
      try {
        const filename = path.join(this.credentialsDir, file);
        const serialized = await fs.readFile(filename, "utf-8");
        credentials.push(deserializeCredential(serialized));
      } catch {
        // Skip files that can't be read or parsed
      }
    }

    return credentials;
  }

  async transaction<T>(fn: (repo: PasskeysCredentialsRepository) => Promise<T>): Promise<T> {
    // Queue this transaction after the previous one completes
    const previousLock = this.transactionLock;
    let releaseLock: () => void;

    // Create a new lock for the next transaction
    this.transactionLock = new Promise((resolve) => {
      releaseLock = resolve;
    });

    try {
      // Wait for the previous transaction to complete
      await previousLock;

      // Execute the transaction function with this repository
      return await fn(this);
    } finally {
      // Release the lock for the next transaction
      releaseLock!();
    }
  }
}
