const forms = document.querySelectorAll<HTMLFormElement>('form[data-web3forms]');

forms.forEach((form) => {
	const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	const status = form.querySelector<HTMLElement>('[data-form-status]');

	const setStatus = (message: string) => {
		if (!status) return;
		status.textContent = message;
		status.hidden = !message;
	};

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const accessKey = form.querySelector<HTMLInputElement>('input[name="access_key"]')?.value.trim();
		if (!accessKey) {
			setStatus(form.dataset.configurationError ?? 'Form not configured.');
			return;
		}

		submitButton?.setAttribute('disabled', '');
		submitButton?.setAttribute('aria-busy', 'true');
		setStatus(form.dataset.sending ?? 'Sending…');

		try {
			const response = await fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { Accept: 'application/json' },
			});
			const result = (await response.json()) as { success?: boolean };

			if (!response.ok || !result.success) throw new Error('Web3Forms rejected the submission.');

			form.reset();
			setStatus('');
			document.dispatchEvent(new Event('form:sent'));
		} catch {
			setStatus(form.dataset.error ?? 'The form could not be submitted.');
		} finally {
			submitButton?.removeAttribute('disabled');
			submitButton?.removeAttribute('aria-busy');
		}
	});
});
