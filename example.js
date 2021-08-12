const root = document.body;
let foo = 0;

let elem = j('div', [
  "test1",
  [
    "test2:1",
    "<br>",
    "test2:2"
  ]
]);

j.render(elem, root, parseSymbs=['{{', '}}']);