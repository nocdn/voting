<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import Spinner from '$lib/Spinner.svelte';

	let emails: string = $state('');
	let usersCreated: boolean = $state(false);

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

	async function submitEmails() {
		console.log('submitEmails');
		const emailList = emails
			.split('\n')
			.map((email) => email.trim())
			.filter((email) => email);
		console.log('Email List:', emailList);

		const emailData = emailList.map((email) => {
			const code = Math.random().toString(36).slice(-8);
			return { email, code, has_voted: false, agreed_candidates: false };
		});

		console.log('emailData:', emailData);

		const { data, error } = await supabase.from('users').insert(emailData).select();

		if (data) {
			console.log('data:', data);
			usersCreated = true;
		} else if (error) {
			console.error('Error:', error.message);
		}
	}

	async function resetEmails() {
		console.log('resetEmails');
		const { data, error } = await supabase.from('users').delete().neq('id', 0);

		if (data) {
			console.log('data:', data);
		} else if (error) {
			console.error('Error:', error.message);
		}
	}

	async function sendEmailsWithCodes() {
		console.log('sendEmailsWithCodes');
		const { data, error } = await supabase.from('users').select('email, code');

		if (data) {
			console.log('data:', data);
		} else if (error) {
			console.error('Error:', error.message);
		}

		console.log('passing emails and codes to backend');

		const backendResponse = await fetch('/api/emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then((response) => response.json())
			.then((data) => {
				console.log('data:', data);
				return data;
			})
			.catch((error) => {
				console.error('Error:', error);
			});

		if (backendResponse) {
			console.log('Backend response:', backendResponse);
		} else {
			console.error('No response from backend');
		}
	}

	let loadingResults: boolean = $state(false);
	let agreedUsers: Array<string> = $state([]);
	let disagreedUsers: Array<string> = $state([]);

	async function seeResults() {
		console.log('seeResults');
		loadingResults = true;
		agreedUsers = [];
		disagreedUsers = [];
		const { data, error } = await supabase
			.from('users')
			.select('email, code, has_voted, agreed_candidates');

		if (data) {
			console.log('results data:', data);
			data.forEach((user) => {
				if (user.agreed_candidates) {
					agreedUsers.push(user.email);
				} else {
					disagreedUsers.push(user.email);
				}
			});
			loadingResults = false;
			console.log('agreedUsers:', agreedUsers);
			console.log('disagreedUsers:', disagreedUsers);
		} else if (error) {
			console.error('Error:', error.message);
		}
	}
</script>

<container class="w-vw flex h-dvh flex-col place-items-start gap-10 p-24 font-mono">
	<main class="flex flex-col gap-3">
		<a href="/" class="cursor-pointer text-blue-700" onclick={logout}>← logout</a>
		<p>enter emails to send codes to</p>
		<textarea
			data-1p-ignore
			class="field-sizing-content max-h-48 min-h-36 min-w-96 border border-gray-200 px-2 py-1.5 focus:outline-none"
			name="emails"
			id="emails"
			bind:value={emails}
			placeholder="email@example.com
bob@example.com
alice@example.com"
		></textarea>
		<div class="flex w-fit items-center justify-center gap-3">
			<button onclick={submitEmails} class="w-fit cursor-pointer border border-gray-200 px-3 py-2"
				>generate codes</button
			>
			{#if usersCreated}
				<button
					onclick={sendEmailsWithCodes}
					class="w-fit cursor-pointer border border-gray-200 px-3 py-2"
					>send emails with codes</button
				>
			{/if}
		</div>
		<button onclick={resetEmails} class="w-fit cursor-pointer border border-gray-200 px-3 py-2"
			>reset table</button
		>
	</main>
	<results class="flex flex-col gap-3">
		<div class="flex w-fit items-center justify-center gap-3">
			<button onclick={seeResults} class="w-fit cursor-pointer border border-gray-200 px-3 py-2"
				>see results</button
			>
			{#if loadingResults}
				<Spinner />
			{/if}
		</div>
		<div class="pl-0.5">
			{#if agreedUsers.length > 0}
				<p class="mb-2 font-semibold">agreed users:</p>
			{/if}
			{#each agreedUsers as email}
				<p>{email}</p>
			{/each}
			{#if disagreedUsers.length > 0}
				<p class="mb-2 font-semibold">disagreed users:</p>
			{/if}
			{#each disagreedUsers as email}
				<p>{email}</p>
			{/each}
		</div>
	</results>
</container>
