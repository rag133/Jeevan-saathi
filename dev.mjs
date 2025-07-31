import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const server = await createServer({
    configFile: 'vite.config.ts',
    root: __dirname,
  });
  await server.listen();
  server.printUrls();
})();
