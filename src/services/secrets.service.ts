import { readFileSync } from "fs";

export class SecretsService {
    getSecretByKey(key: string) {
        const secretsString = readFileSync('/secrets/vetrina/secrets.json', { flag: 'r', encoding: 'utf-8' });
        let secrets: Record<string, any>;
        try {
            secrets = JSON.parse(secretsString);
        } catch(e) {
            return null;
        }

        return secrets[key];
    }
}