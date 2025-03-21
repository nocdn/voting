<script lang="ts">
	import { createClient } from '@supabase/supabase-js';
	const supabase = createClient(
		'https://dduxgrvpsfbjilpaqyay.supabase.co',
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdXhncnZwc2ZiamlscGFxeWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDY5MzQsImV4cCI6MjA1ODA4MjkzNH0.xR5iQMZq5CyMv2xBkCQhpFf0HRNjkg_zqMooRiYyd28'
	);

	let passwordInput: string;
	let emailInput: string;

	async function supabaseLogin() {
		console.log('login pressed');

		const { data, error } = await supabase.auth.signInWithPassword({
			email: emailInput,
			password: passwordInput
		});

		if (data.session) {
			window.location.href = '/admin';
		} else if (error) {
			console.error('Login failed:', error.message);
			alert('Login failed. Please check your credentials.');
		}
	}
</script>

<container class="w-vw grid h-dvh place-items-center">
	<main class="flex flex-col gap-5 font-mono">
		<p>voting page</p>
		<form class="flex flex-col gap-1" autocomplete="off">
			<input
				type="email"
				placeholder="email@example.com"
				bind:value={emailInput}
				class="focus:outline-none"
			/>
			<input
				type="password"
				placeholder="password"
				bind:value={passwordInput}
				class="focus:outline-none"
			/>
			<button
				onclick={supabaseLogin}
				class="mt-3 w-fit cursor-pointer border border-gray-200 px-3 py-2">login</button
			>
		</form>
	</main>
</container>
