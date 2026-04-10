import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
