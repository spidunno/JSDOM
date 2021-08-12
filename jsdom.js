class Component {
	constructor(tagName, children = [""], attributes = {}) {
		this.tagName = tagName;
		this.children = (children instanceof Array ? children : [children]);
		this.attributes = {};
		this.elem = document.createElement(this.tagName);
    if (attributes !== null) {
		for(var i in this.elem.attributes) {
			this.attributes[i] = this.elem.attributes[i];
			for(var j in attributes) {
				this.attributes[j] = attributes[j];
			}
		}
		for(var i in this.attributes) {
			this.elem.setAttribute(i, this.attributes[i]);
		};
	}
  }
}

// function toElem(component) {
//   let elem = document.createElement(component.tagName);
//   for (var i in component.children) {
//     if (typeof component.children[i] === "string") {
//       elem.append(component.children[i]);
//     }
//     else if (component.children[i] instanceof Component) {
//       elem.append(toElem(component.children[i]));
//     }
//   }
//   return elem
// }

class JsDom {
	static extend(func, props) {
		for(var prop in props) {
			if(props.hasOwnProperty(prop)) {
				func[prop] = props[prop];
			}
		}
		return func;
	}
}

var j = JsDom.extend(function(tagName, children = [""], attributes = {}) {
	return new Component(tagName, children, attributes);
}, {
  jsx: function(tagName, attributes = {}, children = [""],) {
    
	return new Component(...[tagName, children, attributes]);
},
	toElem: function(component) {
    let elem;
    if (component instanceof Component) {
      elem = document.createElement(component.tagName);
		  for(var i in component.attributes) {
		  	elem.setAttribute(i, component.attributes[i])
		  }
		  for(var i in component.children) {
		  	if(typeof component.children[i] === "string") {
		  		elem.append(component.children[i]);
		  	} 
        else if (component.children[i] instanceof Array) {
          elem.append(j.toElem(new Component("div", component.children[i])));
        }
        else if(component.children[i] instanceof Component) {
		  		elem.append(j.toElem(component.children[i]));
		  	}
		  }
    }
    else if (component instanceof Array) {
      elem = j.toElem(new Component("div", component));
    }
    else if (typeof component === "string") {
      for (var i in component) {
        elem = document.createTextNode(component[i]);
      }
    }
		return elem
	},
	parse: function(str, identifiers = ["{{", "}}"]) {
		/* Define misc variables */
		var currentUUID = "";
		let exprIndex = 0;
		let parsedStr = [];
		let keys = [];
		let strNoExpr = "";
		let indexes = [];
		let inExpr = false;
		let skipNextChar = 0;
		let nextArr = [];

		/* Main loop */
		for(var i = 0; i < str.length; i++) {
			if(inExpr === false) {
				if(skipNextChar > 0) {
					skipNextChar--;
					continue
				}
				/* Check if string matches characters */
				if(str.substring(i, i + (identifiers[0].length)) === identifiers[0]) {
					nextArr = [];
					/* continue loop if skipping next character in string */
					/* Define the UUID for this loop and add that to the keys array for use after the function returns */
					currentUUID = j.uuidv4();
					keys[exprIndex] = currentUUID;
					/* Push loop value to array for use in formatting string later */
					nextArr.push(i);
					/* Specify that loop is currently inside an expression and to skip next character */
					inExpr = true;
					skipNextChar = identifiers[0].length - 1;
				}
			} else if(inExpr === true) {
				if(skipNextChar > 0) {
					skipNextChar--;
					continue
				}
				if(str.substring(i, i + identifiers[1].length) === identifiers[1]) {
					nextArr.push(i + 2);
					indexes.push(nextArr);
					inExpr = false;
					skipNextChar = identifiers[1].length - 1;
					exprIndex++;
				} else if(inExpr === true && skipNextChar === 0) {
					parsedStr[exprIndex] = [parsedStr[exprIndex], str[i]].join("");
				}
			}
		}
		strNoExpr = str;
		let lastKeyLength = 0;
		for(var i in indexes) {
			// console.log(lastKeyLength)
			// console.log((parseInt(indexes[i][0]) + parseInt(lastKeyLength)) + " " + (parseInt(indexes[i][1]) + parseInt(lastKeyLength)))
			// console.log(indexes[i][0], indexes[i][1])
			strNoExpr = strNoExpr.substring(0, (indexes[i][0]) + (lastKeyLength)) + keys[i] + strNoExpr.substring((indexes[i][1]) + (lastKeyLength));
			lastKeyLength += keys[i].length - (indexes[i][1] - indexes[i][0]);
			// console.log(indexes[i][1] - indexes[i][0])
		}
		return {
			"str": strNoExpr,
			"map": keys,
			"exprs": parsedStr
		}
	},
	evalReplace: function(obj) {
		let newStr = obj["str"];
		for(var i in obj["exprs"]) {
			newStr = newStr.replace(obj["map"][i], eval(obj["exprs"][i]));
		}
		return newStr;
	},
	uuidv4: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},
	html: function(html) {
    let parsed = new DOMParser().parseFromString(html, 'text/html').body.childNodes;
    let comp = [];
    for (var i in parsed) {
      comp.push(new Component(parsed[i].localName, parsed[i], parsed[i][0]));
    }
    return new Component("div", comp);
  },
	render: function(component, renderElem = document.body, parseSymbs = ["{{", "}}"]) {
		let interval = setInterval(function() {
			let elem = j.toElem(component);
			for(var i in component.children) {
				if(j.evalReplace(j.parse(elem.innerHTML, identifiers = parseSymbs)) !== j.evalReplace(j.parse(renderElem.innerHTML, identifiers = parseSymbs))) {
					renderElem.innerHTML = j.evalReplace(j.parse(elem.innerHTML, identifiers = parseSymbs));
				}
			}
		}, 2.5);
    this.interval = interval;
	},
  haltRender: function() {
    clearInterval(this.interval);
  }
});
