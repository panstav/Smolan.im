onReady(() => {

	// on click .help-switch
	document.querySelector('.help-switch').addEventListener('click', () => {

		var helpDiv = document.querySelector('.help');

		// show hide .help
		helpDiv.style.display = helpDiv.style.display !== 'block' ? 'block' : 'none';
	});

});

function onReady(fn){ // http://youmightnotneedjquery.com/#ready
	if (document.readyState != 'loading') return fn();
	document.addEventListener('DOMContentLoaded', fn);
}