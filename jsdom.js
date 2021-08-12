class Component {
  constructor(tagName, children = [""], attributes = {}) {
    this.tagName = tagName;
    this.children = (children instanceof Array ? children : [children]);
    this.attributes = {};
    this.elem = document.createElement(this.tagName);
    if (attributes !== null) {
      for (var i in this.elem.attributes) {
        this.attributes[i] = this.elem.attributes[i];
        for (var j in attributes) {
          this.attributes[j] = attributes[j];
        }
      }
      for (var i in this.attributes) {
        this.elem.setAttribute(i, this.attributes[i]);
      };
    }
  }
}

var jsdomTemporaryExpressionHandler = {
    getFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1)+sub1.length;
        var string1 = this.string.substr(0,SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP,TP);
    },
    removeFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
        this.string = this.string.replace(removal,this.uuid);
    },
		uuidv4: function() {
    	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 	function (c) {
      	var r = Math.random() * 16 | 0,
        	v = c == 'x' ? r : (r & 0x3 | 0x8);
      	return v.toString(16);
    	});
  	},
    getAllResults:function (sub1,sub2) {
        // first check to see if we do have both substrings
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) this.results = {"exprs": [], "map": [], "str": this.string};

        // find one result
				this.uuid = this.uuidv4();
        var result = this.getFromBetween(sub1,sub2);
        // push it to the results array
				this.removeFromBetween(sub1,sub2);
        this.results["exprs"].push(result);
				this.results["str"] = (this.string);
				this.results["map"].push(this.uuid);
        // remove the most recently found one from the string

        // if there's more substrings
        if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1,sub2);
						// this.results[this.results.length - 1]["key"] = this.string
						this.results.str = this.string;
        }
        else return;
    },
    parse:function (string,sub=["{{", "}}"]) {
        this.results = {"exprs": [], "map": [], "str": ""};
        this.string = string;
        this.getAllResults(sub[0], sub[1]);
        return this.results;
    },
		evalReplace:function (obj) {
			let returnStr = obj["str"];
			for (var i in obj["map"]) {
				returnStr = returnStr.replace(obj["map"][i], eval(obj["exprs"][i]))
			}
			return returnStr;
		}
};

class JsDom {
  /* Stop rendering interval */
  static haltRender() {
    clearInterval(this.interval);
  }
  /* Start rendering interval */
  static render(component, renderElem = document.body, parseSymbs = ["{{", "}}"]) {
    /* Set variable to interval to stop later */
    this.interval = setInterval(function () {
      /* Convert component into HTML element */
      let elem = JsDom.toElem(component);
      /* loop through component's children */
      for (var i in component.children) {
        /* Only update element if contents are not equal */
        if (jsdomTemporaryExpressionHandler.evalReplace(jsdomTemporaryExpressionHandler.parse(elem.innerHTML, parseSymbs)) !== jsdomTemporaryExpressionHandler.evalReplace(jsdomTemporaryExpressionHandler.parse(renderElem.innerHTML, parseSymbs))) {
          /* If so, update HTML */
          renderElem.innerHTML = jsdomTemporaryExpressionHandler.evalReplace(jsdomTemporaryExpressionHandler.parse(elem.innerHTML, parseSymbs));
        }
      }
    }, 2.5);
  }
  /* Convert a string containing HTML into a component/components */
  static html(html, enable=false) {
    if (enable) {
      var template = document.createElement('template');
      let toReturn = [];
      template.innerHTML = html;
      console.log(Array.from(template.content.children))
      console.log(Array.from(template.content.children)[0]  instanceof HTMLElement);
      let arr = Array.from(template.content.children);
      for (var i in arr) {
        toReturn.push(new Component(arr[i].localName, arr[i]  .innerHTML, arr[i].attributes));
      }
      return arr
    }
    console.log("WARNING: THIS IS EXTREMELY EXPERIEMENTAL AND WILL NOT WORK\nUSE AT YOUR OWN RISK");
  }
  /* UUID function for use in parsing text; Taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid */
  static uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /* Evaluate and replace text returned from parse() function */
  static evalReplace(obj) {
    /* get the str from obj */
    let newStr = obj["str"];
    /* Loop through all expressions used in the text */
    for (var i in obj["exprs"]) {
      /* replace all of the uuids with the output their respective expressions */
      newStr = newStr.replace(obj["map"][i], eval(obj["exprs"][i]));
    }
    /* return the string */
    return newStr;
  }
  /* createElement Function */
  static createElement(tagName, children = [""], attributes = {}) {
    return new Component(tagName, children, attributes);
  }
  /* convert objects of class Component into HTML Elements */
  static toElem(component) {
    /* instantiate elem variable to set later */
    let elem;
    /* check if component is an instance of the Component class */
    if (component instanceof Component) {
      /* if so set elem to an HTML element with a tagName of the component tagName */
      elem = document.createElement(component.tagName);
      /* loop through all of the components attributes and set the HTML element's attributes to that */
      for (var i in component.attributes) {
        elem.setAttribute(i, component.attributes[i])
      }
      /* loop through all of the children of the component */
      for (var i in component.children) {
        /* if child is a string, append it to the element */
        if (typeof component.children[i] === "string") {
          elem.append(component.children[i]);
        }
        /* if the child is an array, run this function again with a component with its children set to the array, and append that to the element */
        else if (component.children[i] instanceof Array) {
          elem.append(JsDom.toElem(new Component("div", component.children[i])));
        }
        /* if the child is another component, run this function again with said component, and append that to the element */
        else if (component.children[i] instanceof Component) {
          elem.append(JsDom.toElem(component.children[i]));
        }
      }
    }
    /* if the component is an array run this function again with a component whos children is said array, and append that to the element */
    else if (component instanceof Array) {
      for (var i in component) {
        elem = document.createElement('div');
        elem.append = JsDom.toElem(component[i]);
      }
    }
    /* if the component is a string, append a new text node to the element */
    else if (typeof component === "string") {
      for (var i in component) {
        elem = document.createTextNode(component[i]);
      }
    }
    // /* check if component is an HTMLElement */
    // else if (component instanceof HTMLElement) {
    //   /* if so, append component to elem */
    //   elem.append(component);
    // }
    /* return the element */
    return elem
  }

  /* function to parse out expressions from a string */
  static parse(str, identifiers = ["{{", "}}"]) {
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
    for (var i = 0; i < str.length; i++) {
      /* if not in an expression already check if in an expression */
      if (inExpr === false) {
        /* if skipNextChar is > 0, subtract one from it and skip this loop */
        if (skipNextChar > 0) {
          skipNextChar--;
          continue
        }
        /* Check if string matches characters */
        if (str.substring(i, i + (identifiers[0].length)) === identifiers[0]) {
          nextArr = [];
          /* continue loop if skipping next character in string */
          /* Define the UUID for this loop and add that to the keys array for use after the function returns */
          currentUUID = this.uuidv4();
          keys[exprIndex] = currentUUID;
          /* Push loop value to array for use in formatting string later */
          nextArr.push(i);
          /* Specify that loop is currently inside an expression and to skip next characters */
          inExpr = true;
          skipNextChar = identifiers[0].length - 1;
        }
      }
      /* if already in an expression */
      else if (inExpr === true) {
        /* check if skipNextChar is > 0, if so subtract one and skip this loop */
        if (skipNextChar > 0) {
          skipNextChar--;
          continue
        }
        /* perform the same check as before except for the closing characters */
        if (str.substring(i, i + identifiers[1].length) === identifiers[1]) {
          /* push the position in the string + 2 to the array to use to format string later */
          nextArr.push(i + 2);
          /* push all of nextArr to indexes to format string with */
          indexes.push(nextArr);
          /* leave current expression */
          inExpr = false;
          /* skip next few characters */
          skipNextChar = identifiers[1].length - 1;
          /* increase the index of the expression we're on by one */
          exprIndex++;
        }
        /* if in expression and skipNextChar is 0 */
        else if (inExpr === true && skipNextChar === 0) {
          /* what the fuck */
          parsedStr[exprIndex] = [parsedStr[exprIndex], str[i]].join("");
        }
      }
    }
    /* set the string with expressions removed to the input string */
    strNoExpr = str;
    /* set lastKeyLength to 0 */
    let lastKeyLength = 0;
    /* loop through all indexes of expressions */
    for (var i in indexes) {
      /* strip out all expressions and replace with the respective uuid */
      strNoExpr = strNoExpr.substring(0, (indexes[i][0]) + (lastKeyLength)) + keys[i] + strNoExpr.substring((indexes[i][1]) + (lastKeyLength));
      /* set lastKeyLength to the last used uuid to shift the indexes by */
      lastKeyLength += keys[i].length - (indexes[i][1] - indexes[i][0]);
    }
    /* return all needed data */
    return {
      "str": strNoExpr,
      "map": keys,
      "exprs": parsedStr
    }
  }
  /* extend function for allowing "j" to be both a function and an object, taken from https://stackoverflow.com/questions/4906675/javascript-function-have-sub-functions-variables */
  static extend(func, props) {
    for (var prop in props) {
      if (props.hasOwnProperty(prop)) {
        func[prop] = props[prop];
      }
    }
    return func;
  }
}

/* define "j" using JsDom.extend() */
var j = JsDom.extend(JsDom.createElement, {
  render: JsDom.render,
  haltRender: JsDom.haltRender,
  html: JsDom.html,

});