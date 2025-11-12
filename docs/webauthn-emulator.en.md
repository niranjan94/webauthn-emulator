# WebAuthn API Emulator - Detailed Specification for Developers

## Overview

The [WebAuthn Emulator](../src//webauthn/webauthn-emulator.ts) is a tool for simulating authentication processes based on the WebAuthn specification. It is primarily intended for testing and development purposes.

## Main Classes

### WebAuthnEmulator

A class that mimics the main functionality of the WebAuthn protocol.

#### Key Methods

**Note:** All methods are asynchronous and return Promises. Always use `await` or `.then()` when calling these methods.

1. `async getJSON(origin: string, optionsJSON: PublicKeyCredentialRequestOptionsJSON): Promise<AuthenticationResponseJSON>`

   - Processes authentication requests and returns responses in JSON format asynchronously.

2. `async createJSON(origin: string, optionsJSON: PublicKeyCredentialCreationOptionsJSON): Promise<RegistrationResponseJSON>`

   - Processes credential creation requests and returns responses in JSON format asynchronously.

3. `async getAuthenticatorInfo(): Promise<AuthenticatorInfo>`

   - Retrieves authenticator information asynchronously.

4. `async signalUnknownCredential(options: UnknownCredentialOptionsJSON): Promise<void>`

   - Signals unknown credentials and removes them from the authenticator asynchronously.

5. `async get(origin: string, options: CredentialRequestOptions): Promise<RequestPublicKeyCredential>`

   - Simulates the authentication process asynchronously.

6. `async create(origin: string, options: CredentialCreationOptions): Promise<CreatePublicKeyCredential>`
   - Simulates the process of creating new credentials asynchronously.

## Key Features

1. **Credential Creation**: Uses the `create` method to simulate the creation of new public key credentials.

2. **Authentication**: Uses the `get` method to simulate authentication processes using existing credentials.

3. **JSON Compatibility**: The `getJSON` and `createJSON` methods enable processing of requests and responses in JSON format.

4. **Authenticator Information**: The `getAuthenticatorInfo` method allows you to obtain detailed information about the Authenticator.

## Security Considerations

- Relying Party ID validation: Performs proper RPID validation and generates errors for invalid RPIDs.
- Challenge processing: Includes challenges in client data and processes them with proper hashing.

## Error Handling

The WebAuthn emulator maps internal CTAP errors to WebAuthn-facing exceptions.

- Input validation
  - Missing `publicKey` in `create`/`get`: throws `TypeError`.
  - Invalid RP ID for the given origin: throws `DOMException` with name `SecurityError`.

- CTAP to DOMException mapping (thrown by `create`/`get`/management APIs)
  - `CTAP2_ERR_CREDENTIAL_EXCLUDED` → `DOMException("NotAllowedError")`
  - `CTAP2_ERR_UNSUPPORTED_ALGORITHM` → `DOMException("NotSupportedError")`
  - `CTAP2_ERR_OPERATION_DENIED`, `CTAP2_ERR_NOT_ALLOWED`, `CTAP2_ERR_NO_CREDENTIALS` → `DOMException("NotAllowedError")`
  - `CTAP1_ERR_INVALID_PARAMETER`, `CTAP2_ERR_INVALID_CBOR` → `DOMException("DataError")`
  - Any other CTAP error → `DOMException("UnknownError")`

- Other (non-CTAP) errors thrown by the authenticator are rethrown as-is and are not converted to `DOMException`.

## Important Notes

1. This emulator is not a complete replacement for actual WebAuthn. Use only for testing and development purposes.

2. Actual implementations may require more stringent security checks and production-appropriate settings.

3. This emulator covers the basic functionality of the WebAuthn specification, but does not support all advanced features or extensions.

## Usage Example

```javascript
const emulator = new WebAuthnEmulator();

// Credential creation
const creationOptions = {
  /* ... */
};
const credential = await emulator.createJSON(origin, creationOptions);

// Authentication
const requestOptions = {
  /* ... */
};
const assertion = await emulator.getJSON(origin, requestOptions);
```

This document provides an overview of the main functionality and usage of the provided code. Actual implementations may require more detailed configuration and error handling.
