import { describe, test } from "@jest/globals";
import WebAuthnEmulator from "../../src/index";
import { WebAuthnIO } from "./webauthn-io";

describe("Passkeys Integration Test by webauthn.io", () => {
  test.skip("Registration Ceremony and Authentication Ceremony", async () => {
    const origin = "https://webauthn.io";
    const emulator = new WebAuthnEmulator();
    const webauthnIO = await WebAuthnIO.create();
    const user = webauthnIO.getUser();

    // Authenticator Information
    console.log("Authenticator Information", await emulator.getAuthenticatorInfo());

    // Create passkey.
    const creationOptions = await webauthnIO.getRegistrationOptions(user);
    console.log("Registration options", creationOptions);
    const creationCredential = await emulator.createJSON(origin, creationOptions);
    console.log("Registration credential", creationCredential);
    await webauthnIO.getRegistrationVerification(user, creationCredential);
    console.log("Registration verification completed");

    // Authenticate passkey.
    const requestOptions = await webauthnIO.getAuthenticationOptions();
    console.log("Authentication options", requestOptions);
    const requestCredential = await emulator.getJSON(origin, requestOptions);
    console.log("Authentication credential", requestCredential);
    await webauthnIO.getAuthenticationVerification(requestCredential);
    console.log("Authentication verification completed");
  }, 60000);
});
