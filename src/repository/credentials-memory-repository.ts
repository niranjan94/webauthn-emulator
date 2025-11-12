import {
  deserializeCredential,
  getRepositoryId,
  type PasskeyDiscoverableCredential,
  type PasskeysCredentialsRepository,
  serializeCredential,
} from "./credentials-repository";

export class PasskeysCredentialsMemoryRepository implements PasskeysCredentialsRepository {
  private readonly credentials: Map<string, string> = new Map();
  private transactionLock: Promise<void> = Promise.resolve();

  async saveCredential(credential: PasskeyDiscoverableCredential): Promise<void> {
    const id = getRepositoryId(credential);
    const serialized = serializeCredential(credential);
    this.credentials.set(id, serialized);
  }

  async deleteCredential(credential: PasskeyDiscoverableCredential): Promise<void> {
    const id = getRepositoryId(credential);
    this.credentials.delete(id);
  }

  async loadCredentials(): Promise<PasskeyDiscoverableCredential[]> {
    return Array.from(this.credentials.values()).map((serialized) => deserializeCredential(serialized));
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
