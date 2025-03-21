<script>
	import { onMount } from 'svelte';
	import { createClient } from '@supabase/supabase-js';
	const supabase = createClient(
		'https://dduxgrvpsfbjilpaqyay.supabase.co',
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdXhncnZwc2ZiamlscGFxeWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDY5MzQsImV4cCI6MjA1ODA4MjkzNH0.xR5iQMZq5CyMv2xBkCQhpFf0HRNjkg_zqMooRiYyd28'
	);

	onMount(async () => {
		try {
			const {
				data: { user },
				error
			} = await supabase.auth.getUser();

			if (error || !user) {
				console.log('User not authenticated, logging out');
				await logout();
			} else {
				console.log('User is authenticated:', user);
			}
		} catch (error) {
			console.error('Authentication check failed:', error);
			await logout();
		}
	});

	async function logout() {
		console.log('logout');
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			window.location.href = '/';
		} catch (error) {
			console.error('Error logging out:', error);
		}
	}
</script>

<container class="w-vw grid h-dvh place-items-center">
	<main class="flex flex-col gap-3 font-mono">
		<p>this is the admin page</p>
		<a href="/" class="cursor-pointer text-blue-700" onclick={logout}>log out</a>
	</main>
</container>
