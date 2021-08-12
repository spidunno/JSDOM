const foo = "world!";
let elem = j("div", ["Hello, ", j("h1", "{{foo}}")]);

j.render(elem, document.body, parseSymbs=["{{", "}}"]);