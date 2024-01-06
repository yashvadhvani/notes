import { config } from 'dotenv';
import * as fs from 'fs';

export function loadEnvConfig() {
  const envFile = '.env';

  if (fs.existsSync(envFile)) {
    config({ path: envFile });
  }
}
