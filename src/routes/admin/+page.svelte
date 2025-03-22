<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import Spinner from '$lib/Spinner.svelte';
	import Check from '$lib/Check.svelte';
	import type { List } from 'lucide-svelte';

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

	let invalidEmails: Array<string> = $state([]);
	async function submitEmails() {
		console.log('submitEmails');
		const emailList = emails
			.split('\n')
			.map((email) => email.trim())
			.filter((email) => email);
		console.log('Email List:', emailList);

		invalidEmails = [];
		const validEmails: Array<string> = [];
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		emailList.forEach((email) => {
			if (emailRegex.test(email)) {
				validEmails.push(email);
			} else {
				invalidEmails.push(email);
			}
		});

		console.log('Valid Emails:', validEmails);
		console.log('Invalid Emails:', invalidEmails);

		if (validEmails.length === 0) {
			console.warn('No valid emails to insert.');
			return;
		}

		const emailData = validEmails.map((email) => {
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

	let resetCheckShown: boolean = $state(false);
	async function resetEmails() {
		console.log('resetEmails');
		const { data, error } = await supabase.from('users').delete().neq('id', 0);
		resetCheckShown = true;
		setTimeout(() => {
			resetCheckShown = false;
		}, 2000);

		if (data) {
			console.log('data:', data);
		} else if (error) {
			console.error('Error:', error.message);
		}
	}

	let backendUrl: string = $state('');
	let noBackendUrl: boolean = $state(false);
	async function sendEmailsWithCodes() {
		console.log('sendEmailsWithCodes');
		const { data, error } = await supabase.from('users').select('email, code');

		if (data) {
			console.log('data:', data);
		} else if (error) {
			console.error('Error:', error.message);
		}

		console.log('passing emails and codes to backend');
		if (backendUrl === '') {
			noBackendUrl = true;
			setTimeout(() => {
				noBackendUrl = false;
			}, 2000);
			return;
		}

		const backendResponse = await fetch(backendUrl, {
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
	let notVotedUsers: Array<string> = $state([]);
	let totalUsers: number = $state(0);

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
				} else if (user.has_voted && !user.agreed_candidates) {
					disagreedUsers.push(user.email);
				} else if (!user.has_voted) {
					notVotedUsers.push(user.email);
				}
			});
			loadingResults = false;
			console.log('agreedUsers:', agreedUsers);
			console.log('disagreedUsers:', disagreedUsers);
			totalUsers = agreedUsers.length + disagreedUsers.length;
			console.log('totalUsers:', totalUsers);
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
				>generate codes in database</button
			>
		</div>
		{#if invalidEmails.length > 0}
			<p class="text-red-700">invalid emails:</p>
			<div>
				{#each invalidEmails as email}
					<p>{email}</p>
				{/each}
			</div>
		{/if}
		<div>
			<p class="mt-6 mb-1.5">backend url:</p>
			<input
				class="w-80 border border-gray-200 px-2.5 py-1.5 focus:outline-none {noBackendUrl
					? 'outline-2 outline-red-700'
					: ''}"
				type="text"
				bind:value={backendUrl}
				placeholder="134.123.123.123:8010/api/emails"
			/>
		</div>
		<div class="flex w-fit items-center justify-center gap-3">
			<button onclick={resetEmails} class="w-fit cursor-pointer border border-gray-200 px-3 py-2"
				>reset table</button
			>
			{#if usersCreated}
				<button
					onclick={sendEmailsWithCodes}
					class="w-fit cursor-pointer border border-gray-200 px-3 py-2 {noBackendUrl
						? 'cursor-default font-semibold text-red-700'
						: ''}"
					>{#if noBackendUrl}backend url required{:else}send emails with codes{/if}</button
				>
			{/if}
			{#if resetCheckShown}
				<Check />
			{/if}
		</div>
	</main>
	<results class="mb-8 flex flex-col gap-3">
		<div class="flex w-fit items-center justify-center gap-3">
			<button onclick={seeResults} class="w-fit cursor-pointer border border-gray-200 px-3 py-2"
				>see results</button
			>
			{#if loadingResults}
				<Spinner />
			{/if}
		</div>
		{#if totalUsers > 0}
			<div class="grid grid-cols-3 gap-x-8 pl-0.5">
				<div class="border border-gray-200 px-2.5 py-2">
					{#if agreedUsers.length > 0}
						<p class="mb-2 font-semibold">agreed users:</p>
					{/if}
					{#each agreedUsers as email}
						<p>{email}</p>
					{/each}
				</div>
				<div class="border border-gray-200 px-2.5 py-2">
					{#if disagreedUsers.length > 0}
						<p class="mb-2 font-semibold">disagreed users:</p>
					{/if}
					{#each disagreedUsers as email}
						<p>{email}</p>
					{/each}
				</div>
				<div class="border border-gray-200 px-2.5 py-2">
					{#if notVotedUsers.length > 0}
						<p class="mb-2 font-semibold">not voted users:</p>
					{/if}
					{#each notVotedUsers as email}
						<p>{email}</p>
					{/each}
				</div>
			</div>
		{/if}
	</results>
</container>
