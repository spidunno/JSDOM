

# JSDOM
Javascript UI library similar to [React.js](https://reactjs.org/) or [Mithril.js](https://mithril.js.org/) for creating and dynamically updating UI.
----
## Installation

#### download `jsdom.js` from this repository and add this tag to your HTML
#### `<script src="../path/to/jsdom.js"></script>`

#### You should be ready to go!
---
# Getting Started
#### Go into your script and add this code
#### 
```js
const root = document.body;
let elem = j('div', [
	j('h1', 'This is an H1 heading!'),
	'This is plain text!',
	[
		j('h2', 'This is the first H2 heading!'),
		j('h2', 'This is the second H2 heading!')
	]
]);

j.render(elem, root);
```
If you've typed everything correctly, you should get this as the output: 

![enter image description here](https://user-images.githubusercontent.com/70819261/129250193-66b3f0ec-fd34-46af-9adb-11ba74f1214e.png)

Alright! Now lets go over this code:
```js
/* This just defines a constant to render our UI to */
const root = document.body;

/* Now here's the exciting part! */
/* We define "elem" as a div element, with its children as an array */
let elem = j('div', [
	/* The children can be other elements, */
	j('h1', 'This is an H1 heading!'),
	
	/* they can be plain text, */
	'This is plain text!',
	
	/* or they can be other arrays of any of these three options. */
	[
		j('h2', 'This is the first H2 heading!'),
		j('h2', 'This is the second H2 heading!')
	]
]);

/* This is the heart of your project, this one line makes everything work */
/* We simply */
j.render(/* Specify the element to render -->*/ elem, root /* <-- and where to render it */);

/* And this library will do the rest */
```
Before we go to the next section note that `j()` has three arguments, two optional:
`j(tagName<Required>, children=[""]<Optional>, attributes={}<Optional>)`
the only one here that I haven't talked about yet is `attributes`, all this argument does is add attributes to the HTML element so if you did `j('button', 'yeet', {onclick: 'console.log("yeet");'});`
it would (unsurprisingly) generate `<button onclick='console.log("yeet");'>yeet</button>`

### Alright, did you get all that? Good.
---
# Using dynamic values
#### When I say that I really am just saying "Using variables in your HTML" in a fancy way. I'm mostly gonna be glossing over this as its pretty self-explanatory
#### here's a quick example on how to do it:
```js
/* Define element to render in like before */
const root = document.body;
/* Define variable we want to use in out HTML */
let foo =  0;

/* Define the element */
let elem = j('div',  [
/* See how we use {{this syntax}} to use the variable? */
                                               /* ↓↓↓ */
	j('button', j('h1',  'The value of "foo" is {{foo}}'),  {onclick:  'foo++'})
]);

/* This syntax is changeable through the optional "parseSymbs" argument of j.render() */
/* By default it's an array with ['{{', '}}'], all this means is that its going to start evaluating any code after '{{' and stop at '}}' */

/* you could very well change this argument to any symbols */
/* ***AS LONG*** as you make sure the first set of symbols and the last set of symbols are different */
/* It ***WILL NOT*** work if both sets of symbols are the same */

         /* ↓GOOD↓ */
/* parseSymbs=['{{', '}}'] */
/* parseSymbs=['{[', ']}"] */
/* parseSymbs=['12', '13'] */

         /* ↓BAD↓ */
/* parseSymbs=['{{', '{{'] */
/* parseSymbs=['||', '||'] */
/* parseSymbs=['[[', '[['] */

/* I cannot stress this enough, do not get mad at me when it doesn't work */
/* Feel free to help improve the method used to parse this out! All help is appreciated! */

j.render(elem, root, parseSymbs=['{{',  '}}']);
                              /*↑  symbols  ↑*/
                              /*   to parse  */
```
#### Sorry about that being long-winded, it's just very important that you realize some things about how this works.

#### If you've typed everything correctly, you should be greeted with a button, click it a few times and watch the number go up:

![enter image description here](https://user-images.githubusercontent.com/70819261/129251512-c311c7ed-a9f8-48e6-9165-e0a80e41d574.png)

---
