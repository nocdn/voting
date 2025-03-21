import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			'/api/emails': {
				target: 'http://localhost:8010',
				changeOrigin: true,
				secure: false
			}
		}
	}
});
