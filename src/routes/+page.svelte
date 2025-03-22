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
	let doneVoting: boolean = $state(false);
	let voteCheckLoading: boolean = $state(false);

	async function verifyCode() {
		console.log('verifyCode');
		console.log('votingCode:', votingCode);
		voteCheckLoading = true;
		const { data, error } = await supabase.from('users').select('*').eq('code', votingCode);

		if (data) {
			console.log('data:', data);
			if (data.length > 0) {
				if (data[0].has_voted) {
					alreadyVoted = true;
					voteCheckLoading = false;

					setTimeout(() => {
						alreadyVoted = false;
					}, 2000);
				} else {
					codeVerified = true;
				}
			} else {
				invalidCode = true;
				voteCheckLoading = false;
				setTimeout(() => {
					invalidCode = false;
				}, 2000);
			}
		} else if (error) {
			console.error('Error:', error.message);
		}
	}

	let loadingAgree: boolean = $state(false);
	async function agreeCandidates() {
		console.log('agreeCandidates');
		loadingAgree = true;
		const { data, error } = await supabase
			.from('users')
			.update({ agreed_candidates: true, has_voted: true })
			.eq('code', votingCode);

		doneVoting = true;
		loadingAgree = false;
		window.location.href = '/thankyou';
		if (error) {
			console.error('Error:', error.message);
		}
	}
</script>

<container class="w-vw grid h-dvh place-items-start p-24">
	<voting class="flex flex-col gap-5 font-mono">
		<a
			role="button"
			tabindex="0"
			href="/"
			onclick={() => {
				if (codeVerified) {
					window.location.reload();
				}
			}}
			class="font-semibold {codeVerified ? 'cursor-pointer text-blue-800' : ''}"
		>
			{#if codeVerified}← back{:else}vote{/if}
		</a>
		{#if !codeVerified}
			<form class="flex flex-col gap-1" autocomplete="off">
				<input
					type="text"
					data-1p-ignore
					placeholder="voting code"
					bind:value={votingCode}
					class="focus:outline-none"
				/>
				<div class="mt-3 flex w-fit items-center justify-center gap-3">
					<button
						onclick={verifyCode}
						class="w-fit cursor-pointer border border-gray-200 px-3 py-2 {invalidCode ||
						alreadyVoted
							? 'cursor-default font-semibold text-red-700'
							: ''}"
						>{#if invalidCode}invalid code{:else if alreadyVoted}code already used{:else}verify code{/if}</button
					>
					{#if voteCheckLoading}
						<Spinner />
					{/if}
				</div>
			</form>
		{:else}
			<div class="flex max-w-lg flex-col gap-4">
				<p>
					due to lack of competition for positions, you only need to say if you agree with the
					candidates:
				</p>
				<candidates>
					<p><span class="font-semibold">President</span> - Daniel Irwin</p>
					<p><span class="font-semibold">Treasurer</span> - Ed Dixon</p>
					<p><span class="font-semibold">Secretary</span> - Beth Oglivie</p>
					<p><span class="font-semibold">Events coordinator</span> - Ellie Doran</p>
					<p><span class="font-semibold">Publicity officer</span> - Ruby Evans</p>
					<p><span class="font-semibold">Inclusivity and equality officer</span> - Kira Thomas</p>
				</candidates>
				<div class="mt-3 flex w-fit items-center justify-center gap-3">
					<button
						onclick={agreeCandidates}
						class="w-fit cursor-pointer border border-gray-200 px-3 py-2">agree</button
					>
					{#if loadingAgree}
						<Spinner />
					{/if}
				</div>
			</div>
		{/if}
	</voting>
	{#if !codeVerified}
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
	{/if}
</container>
