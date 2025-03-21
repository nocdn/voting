<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { compile } from 'svelte/compiler';

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
</script>

<container class="w-vw grid h-dvh place-items-center">
	<main class="flex flex-col gap-3 font-mono">
		<a href="/" class="cursor-pointer text-blue-700" onclick={logout}>← logout</a>
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
</container>
