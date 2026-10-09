import { createApiMiddleware } from '../server/api.js';

// Preserve the multipart stream for the shared upload parser.
export const config = { api: { bodyParser: false } };

export default createApiMiddleware();
