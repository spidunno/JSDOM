const root = document.body;
let foo = 0;

let elem = j('div', [
	j('button', j('h1', 'The value of "foo" is {{foo}}'), {onclick: 'foo++'})
]);

j.render(elem, root, parseSymbs=['{{', '}}']);