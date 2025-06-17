function lexer(input) {
  const tokens = [];
  let cursor = 0;
  
  while (cursor < input.length) {
    let char = input[cursor];
    
    if (/\s/.test(char)) {
      cursor++;
      continue;
    }

    // Handle string literals
    if (char === '"') {
      let string = "";
      cursor++; // Skip opening quote
      if (cursor >= input.length) {
        throw new Error("Unterminated string literal");
      }
      char = input[cursor];
      while (cursor < input.length && char !== '"') {
        string += char;
        cursor++;
        if (cursor < input.length) {
          char = input[cursor];
        }
      }
      if (cursor >= input.length || char !== '"') {
        throw new Error("Unterminated string literal");
      }
      cursor++; // Skip closing quote
      tokens.push({ type: "STRING", value: string });
      continue;
    }

    // Handle identifiers and keywords
    if (/[a-zA-Z]/.test(char)) {
      let word = "";
      while (cursor < input.length && /[a-zA-Z0-9_]/.test(char)) {
        word += char;
        cursor++;
        if (cursor < input.length) {
          char = input[cursor];
        }
      }
      
      // Check for keywords
      const keywords = ["eta", "lekh", "jodi", "nahole", "chalao", "theke", "porjonto"];
      if (keywords.includes(word)) {
        tokens.push({ type: "KEYWORD", value: word });
      } else {
        tokens.push({ type: "IDENTIFIER", value: word });
      }
      continue;
    }

    // Handle numbers
    if (/[0-9]/.test(char)) {
      let number = "";
      while (cursor < input.length && /[0-9]/.test(char)) {
        number += char;
        cursor++;
        if (cursor < input.length) {
          char = input[cursor];
        }
      }
      tokens.push({ type: "NUMBER", value: parseInt(number) });
      continue;
    }

    // Handle comparison operators
    if (char === '=' && input[cursor + 1] === '=') {
      tokens.push({ type: "COMPARISON", value: "==" });
      cursor += 2;
      continue;
    }
    
    if (char === '!' && input[cursor + 1] === '=') {
      tokens.push({ type: "COMPARISON", value: "!=" });
      cursor += 2;
      continue;
    }
    
    if (char === '<' && input[cursor + 1] === '=') {
      tokens.push({ type: "COMPARISON", value: "<=" });
      cursor += 2;
      continue;
    }
    
    if (char === '>' && input[cursor + 1] === '=') {
      tokens.push({ type: "COMPARISON", value: ">=" });
      cursor += 2;
      continue;
    }
    
    if (char === '<' || char === '>') {
      tokens.push({ type: "COMPARISON", value: char });
      cursor++;
      continue;
    }

    // Handle operators
    if (/[\+\-\*\/=]/.test(char)) {
      tokens.push({ type: "OPERATOR", value: char });
      cursor++;
      continue;
    }

    // Handle brackets
    if (char === '{') {
      tokens.push({ type: "LBRACE", value: char });
      cursor++;
      continue;
    }
    
    if (char === '}') {
      tokens.push({ type: "RBRACE", value: char });
      cursor++;
      continue;
    }
    
    if (char === '(' || char === ')') {
      tokens.push({ type: "PAREN", value: char });
      cursor++;
      continue;
    }

    // Handle unknown characters
    throw new Error(`Unknown character: ${char}`);
  }
  return tokens;
}

console.log(tokens)

function parser(tokens) {
  const ast = { type: "Program", body: [] };
  let index = 0;

  function peek(offset = 0) {
    return tokens[index + offset];
  }

  function consume() {
    return tokens[index++];
  }

  function parseExpression() {
    let expr = "";
    let parenCount = 0;
    
    while (index < tokens.length) {
      const token = peek();
      
      if (!token) break;
      
      if (token.type === "KEYWORD" || 
          (token.type === "LBRACE" && parenCount === 0) || 
          (token.type === "RBRACE" && parenCount === 0)) {
        break;
      }
      
      if (token.type === "PAREN" && token.value === "(") {
        parenCount++;
      } else if (token.type === "PAREN" && token.value === ")") {
        parenCount--;
      }
      
      const nextToken = consume();
      if (nextToken.type === "STRING") {
        expr += `"${nextToken.value.replace(/"/g, '\\"')}"`;
      } else if (nextToken.type === "NUMBER") {
        expr += nextToken.value;
      } else if (nextToken.type === "COMPARISON") {
        expr += ` ${nextToken.value} `;
      } else {
        expr += nextToken.value;
      }
      
      if (parenCount === 0 && (
          peek()?.type === "KEYWORD" || 
          peek()?.type === "LBRACE" || 
          peek()?.type === "RBRACE")) {
        break;
      }
      
      if (index < tokens.length && expr.length > 0 && 
          !expr.endsWith(" ") && peek()?.type !== "PAREN") {
        expr += " ";
      }
    }
    
    return expr.trim();
  }

  function parseBlock() {
    const body = [];
    
    if (peek()?.type === "LBRACE") {
      consume(); // consume '{'
      
      while (index < tokens.length && peek()?.type !== "RBRACE") {
        const stmt = parseStatement();
        if (stmt) body.push(stmt);
      }
      
      if (peek()?.type === "RBRACE") {
        consume(); // consume '}'
      }
    } else {
      // Single statement without braces
      const stmt = parseStatement();
      if (stmt) body.push(stmt);
    }
    
    return body;
  }

  function parseStatement() {
    const token = peek();
    if (!token) return null;

    // Variable declaration: eta name = value
    if (token.type === "KEYWORD" && token.value === "eta") {
      consume(); // consume 'eta'
      const nameToken = consume();
      
      let declaration = {
        type: "Declaration",
        name: nameToken.value,
        value: null,
      };
      
      if (peek()?.type === "OPERATOR" && peek().value === "=") {
        consume(); // consume '='
        declaration.value = parseExpression();
      }
      
      return declaration;
    }

    // Print statement: lekh expression
    if (token.type === "KEYWORD" && token.value === "lekh") {
      consume(); // consume 'lekh'
      const expression = parseExpression();
      
      return {
        type: "Print",
        expression: expression,
      };
    }

    // If statement: jodi condition { ... } nahole { ... }
    if (token.type === "KEYWORD" && token.value === "jodi") {
      consume(); // consume 'jodi'
      const condition = parseExpression();
      const thenBody = parseBlock();
      
      let elseBody = [];
      if (peek()?.type === "KEYWORD" && peek().value === "nahole") {
        consume(); // consume 'nahole'
        elseBody = parseBlock();
      }
      
      return {
        type: "IfStatement",
        condition: condition,
        then: thenBody,
        else: elseBody,
      };
    }

    // For loop: chalao variable theke start porjonto end { ... }
    if (token.type === "KEYWORD" && token.value === "chalao") {
      consume(); // consume 'chalao'
      const variable = consume().value; // loop variable
      
      if (peek()?.type === "KEYWORD" && peek().value === "theke") {
        consume(); // consume 'theke'
      }
      
      const start = parseExpression();
      
      if (peek()?.type === "KEYWORD" && peek().value === "porjonto") {
        consume(); // consume 'porjonto'
      }
      
      const end = parseExpression();
      const body = parseBlock();
      
      return {
        type: "ForLoop",
        variable: variable,
        start: start,
        end: end,
        body: body,
      };
    }

    // Skip unknown tokens
    consume();
    return null;
  }

  while (index < tokens.length) {
    const stmt = parseStatement();
    if (stmt) {
      ast.body.push(stmt);
    }
  }

  return ast;
}

function codeGen(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGen).join("\n");
      
    case "Declaration":
      if (node.value) {
        return `const ${node.name} = ${node.value};`;
      } else {
        return `let ${node.name};`;
      }
      
    case "Print":
      return `console.log(${node.expression});`;
      
    case "IfStatement":
      let code = `if (${node.condition}) {\n`;
      code += node.then.map(stmt => "  " + codeGen(stmt)).join("\n");
      code += "\n}";
      
      if (node.else.length > 0) {
        code += " else {\n";
        code += node.else.map(stmt => "  " + codeGen(stmt)).join("\n");
        code += "\n}";
      }
      
      return code;
      
    case "ForLoop":
      let forCode = `for (let ${node.variable} = ${node.start}; ${node.variable} <= ${node.end}; ${node.variable}++) {\n`;
      forCode += node.body.map(stmt => "  " + codeGen(stmt)).join("\n");
      forCode += "\n}";
      return forCode;
      
    default:
      return "";
  }
}

function compiler(input) {
  try {
    const tokens = lexer(input);
    const ast = parser(tokens);
    const executable = codeGen(ast);
    return { success: true, code: executable };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function runner(input, outputCallback) {
  try {
    // Override console.log to capture output
    const originalLog = console.log;
    const outputs = [];
    console.log = (...args) => {
      outputs.push(args.map((arg) => String(arg)).join(" "));
    };

    // Use Function constructor instead of eval for safer execution
    const func = new Function(input);
    func();

    // Restore original console.log
    console.log = originalLog;

    if (outputCallback) {
      outputCallback(outputs.join("\n"));
    }
  } catch (error) {
    // Restore original console.log in case of error
    console.log = originalLog;
    if (outputCallback) {
      outputCallback(`Runtime Error: ${error.message}`);
    }
  }
}

// Enhanced Frontend integration functions
function executeCode() {
  const codeInput = document.getElementById("codeInput");
  const outputDiv = document.getElementById("output");
  const jsOutputDiv = document.getElementById("jsOutput");

  if (!codeInput || !outputDiv) {
    console.error("HTML elements not found. Make sure codeInput and output elements exist.");
    return;
  }

  const code = codeInput.value;

  if (!code.trim()) {
    outputDiv.innerHTML = '<span style="color: #e74c3c;">⚠️ Please enter some Bengali code to execute.</span>';
    if (jsOutputDiv) jsOutputDiv.innerHTML = '';
    return;
  }

  // Show loading state
  outputDiv.innerHTML = '<span style="color: #f39c12;">⏳ Compiling and executing...</span>';
  if (jsOutputDiv) jsOutputDiv.innerHTML = '<span style="color: #f39c12;">⏳ Generating JavaScript...</span>';

  // Small delay to show loading state
  setTimeout(() => {
    const result = compiler(code);

    if (result.success) {
      // Show generated JavaScript if element exists
      if (jsOutputDiv) {
        jsOutputDiv.innerHTML = `<span style="color: #3498db; font-weight: bold;">📄 Generated JavaScript:</span><br><pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; overflow-x: auto;"><code>${escapeHtml(result.code)}</code></pre>`;
      }
      
      // Execute and show output
      runner(result.code, (output) => {
        if (output) {
          outputDiv.innerHTML = `<span style="color: #27ae60; font-weight: bold;">✅ Success!</span><br><pre style="background: #d5edda; padding: 15px; border-radius: 5px; margin-top: 10px; color: #155724;">${escapeHtml(output)}</pre>`;
        } else {
          outputDiv.innerHTML = '<span style="color: #f39c12;">⚠️ Code executed successfully but produced no output.</span>';
        }
      });
    } else {
      outputDiv.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">❌ Compilation Error:</span><br><pre style="background: #f8d7da; padding: 15px; border-radius: 5px; margin-top: 10px; color: #721c24;">${escapeHtml(result.error)}</pre>`;
      if (jsOutputDiv) jsOutputDiv.innerHTML = '';
    }
  }, 100);
}

function clearCode() {
  const codeInput = document.getElementById("codeInput");
  const outputDiv = document.getElementById("output");
  const jsOutputDiv = document.getElementById("jsOutput");

  if (codeInput) {
    codeInput.value = "";
  }

  if (outputDiv) {
    outputDiv.innerHTML = '🚀 Click "Run Code" to see the output here...';
  }

  if (jsOutputDiv) {
    jsOutputDiv.innerHTML = '📄 Generated JavaScript will appear here...';
  }
}

function runExample(exampleType) {
    const codeInput = document.getElementById("codeInput");
    let exampleCode = "";
    
    switch (exampleType) {
    case 'basic':
	exampleCode = `eta naam = "Kolkata"
eta boyos = 25
eta message = "Hello from Bengali!"

lekh naam
lekh "Age: "
lekh boyos
lekh message`;
	break;

    case 'condition':
	exampleCode = `eta x = 15
eta y = 10

jodi x > y {
  lekh "x is greater than y"
  lekh x
} nahole {
  lekh "y is greater or equal"
  lekh y
}

lekh "Condition check complete"`;
	break;

    case 'chalao':
	exampleCode = `eta start = 1
eta end = 5

lekh "Counting from 1 to 5:"

chalao i theke start porjonto end {
  lekh "Count: "
  lekh i
}

lekh "Loop complete!"`;
	break;

    case 'complex':
	exampleCode = `eta limit = 10

lekh "Finding special numbers:"

chalao num theke 1 porjonto limit {
  jodi num == 5 {
    lekh "Found five!"
  } nahole {
    jodi num > 7 {
      lekh "Big number: "
      lekh num
    }
  }
}

lekh "Program finished"`;
	break;

    default:
	exampleCode = `eta x = 10
eta y = 20
eta sum = x + y

lekh "Sum is: "
lekh sum`;
    }

  if (codeInput) {
    codeInput.value = exampleCode;
    executeCode();
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-execute on page load if there's example code
document.addEventListener('DOMContentLoaded', function() {
  const codeInput = document.getElementById("codeInput");
  if (codeInput && codeInput.value.trim()) {
    executeCode();
  }
});
