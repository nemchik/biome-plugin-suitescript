define([], () => {
	const pageInit = () => {
		window.parent.postMessage(data, '*');
		window.parent.postMessage(data, 'https://app.example.com');
		el.innerHTML = userInput;
		el.outerHTML = html;
		el.insertAdjacentHTML('beforeend', userInput);
		document.write(userInput);
		el.innerHTML = '<b>static</b>';
		el.innerHTML = sanitize(userInput);
		el.textContent = userInput;
		localStorage.setItem('authToken', token);
		sessionStorage.setItem('userPassword', 'x');
		localStorage.setItem('pageSize', 5);
	};
	return { pageInit };
});
