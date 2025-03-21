<script lang="ts">
	import { supabase } from '$lib/supabase';
	import Spinner from '$lib/Spinner.svelte';

	let passwordInput: string = $state('');
	let emailInput: string = $state('');
	let loading: boolean = $state(false);

	async function supabaseLogin() {
		console.log('login pressed');
		loading = true;

		const { data, error } = await supabase.auth.signInWithPassword({
			email: emailInput,
			password: passwordInput
		});

		if (data.session) {
			window.location.href = '/admin';
		} else if (error) {
			console.error('Login failed:', error.message);
			loading = false;
			alert('Login failed. Please check your credentials.');
		}
	}

	let votingCode: string = $state('');
	let codeVerified: boolean = $state(false);
	let invalidCode: boolean = $state(false);
	let alreadyVoted: boolean = $state(false);

	async function verifyCode() {
		console.log('verifyCode');
		console.log('votingCode:', votingCode);
		const { data, error } = await supabase.from('users').select('*').eq('code', votingCode);

		if (data) {
			console.log('data:', data);
			if (data.length > 0) {
				if (data[0].has_voted) {
					alreadyVoted = true;
				} else {
					codeVerified = true;
				}
			} else {
				invalidCode = true;
				setTimeout(() => {
					invalidCode = false;
				}, 2000);
			}
		} else if (error) {
			console.error('Error:', error.message);
		}
	}
</script>

<container class="w-vw grid h-dvh place-items-center">
	<voting class="flex flex-col gap-5 font-mono">
		<p>vote</p>
		<form class="flex flex-col gap-1" autocomplete="off">
			<input
				type="text"
				data-1p-ignore
				placeholder="voting code"
				bind:value={votingCode}
				class="focus:outline-none"
			/>
			<button
				onclick={verifyCode}
				class="mt-3 w-fit cursor-pointer border border-gray-200 px-3 py-2 {invalidCode
					? 'cursor-default text-red-700'
					: ''}">{invalidCode ? 'invalid code' : 'verify code'}</button
			>
		</form>
	</voting>
	<main class="flex flex-col gap-5 font-mono">
		<p>admin login</p>
		<form class="flex flex-col gap-1" autocomplete="off">
			<input
				type="email"
				data-1p-ignore
				placeholder="email@example.com"
				bind:value={emailInput}
				class="focus:outline-none"
			/>
			<input
				type="password"
				data-1p-ignore
				placeholder="password"
				bind:value={passwordInput}
				class="focus:outline-none"
			/>
			<div class="mt-3 flex w-fit items-center justify-center gap-3">
				<button
					onclick={supabaseLogin}
					class="mt-3 w-fit cursor-pointer border border-gray-200 px-3 py-2">login</button
				>
				{#if loading}
					<div class="mt-3 flex h-full w-fit flex-col items-center justify-center">
						<Spinner />
					</div>
				{/if}
			</div>
		</form>
	</main>
</container>
