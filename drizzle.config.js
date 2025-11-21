import 'dotenv/config'; 
import { defineConfig } from 'drizzle-kit';

console.log('DRIZZLE: DATABASE_URL present?', !!process.env.DATABASE_URL);

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.js',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
