import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			pages: '_dist',
			assets: '_dist',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		files:{
			lib: 'src/renderer/lib',
			routes: 'src/renderer/routes',
			appTemplate: 'src/renderer/app.html'
		}
	},
	
};

export default config;
