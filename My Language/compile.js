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

    if (/[a-zA-Z]/.test(char)) {
      let word = "";
      while (cursor < input.length && /[a-zA-Z0-9_]/.test(char)) {
        word += char;
        cursor++;
        if (cursor < input.length) {
          char = input[cursor];
        }
      }
      if (word === "eta" || word === "lekh") {
        tokens.push({ type: "KEYWORD", value: word });
      } else {
        tokens.push({ type: "IDENTIFIER", value: word });
      }
      continue;
    }

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

    if (/[\+\-\*\/=]/.test(char)) {
      tokens.push({ type: "OPERATOR", value: char });
      cursor++;
      continue;
    }

    // Handle unknown characters
    throw new Error(`Unknown character: ${char}`);
  }
  return tokens;
}

function parser(tokens) {
  const ast = { type: "Program", body: [] };

  while (tokens.length > 0) {
    let token = tokens.shift();
    if (token.type === "KEYWORD" && token.value === "eta") {
      let declaration = {
        type: "Declaration",
        name: tokens.shift().value,
        value: null,
      };
      if (tokens[0] && tokens[0].type === "OPERATOR" && tokens[0].value === "=") {
        tokens.shift();
        let expression = "";
        while (tokens.length > 0 && tokens[0].type !== "KEYWORD") {
          let nextToken = tokens.shift();
          if (nextToken.type === "STRING") {
            expression += `"${nextToken.value.replace(/"/g, '\\"')}"`;
          } else if (nextToken.type === "NUMBER") {
            expression += nextToken.value;
          } else {
            expression += nextToken.value;
          }
          // Add space between tokens for proper JavaScript syntax
          if (tokens.length > 0 && tokens[0].type !== "KEYWORD") {
            expression += " ";
          }
        }
        declaration.value = expression.trim();
      }
      ast.body.push(declaration);
    }

    if (token.type === "KEYWORD" && token.value === "lekh") {
      let nextToken = tokens.shift();
      let expression;
      if (nextToken.type === "STRING") {
        expression = `"${nextToken.value}"`;
      } else {
        expression = nextToken.value;
      }
      let output = {
        type: "Print",
        expression: expression,
      };
      ast.body.push(output);
    }
  }
  return ast;
}

function codeGen(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGen).join("\n");
    case "Declaration":
      return `const ${node.name} = ${node.value};`;
    case "Print":
      return `console.log(${node.expression});`;
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
      outputs.push(args.map(arg => String(arg)).join(' '));
    };
    
    // Use Function constructor instead of eval for safer execution
    const func = new Function(input);
    func();
    
    // Restore original console.log
    console.log = originalLog;
    
    if (outputCallback) {
      outputCallback(outputs.join('\n'));
    }
  } catch (error) {
    // Restore original console.log in case of error
    console.log = console.log.originalLog || console.log;
    if (outputCallback) {
      outputCallback(`Runtime Error: ${error.message}`);
    }
  }
}

// Frontend integration functions
function executeCode() {
  const codeInput = document.getElementById('codeInput');
  const outputDiv = document.getElementById('output');
  
  if (!codeInput || !outputDiv) {
    console.error('HTML elements not found. Make sure codeInput and output elements exist.');
    return;
  }
  
  const code = codeInput.value;
  
  if (!code.trim()) {
    outputDiv.innerHTML = '<span style="color: #e74c3c;">Please enter some code to execute.</span>';
    return;
  }
  
  // Show loading state
  outputDiv.innerHTML = '<span style="color: #f39c12;">⏳ Compiling and executing...</span>';
  
  // Small delay to show loading state
  setTimeout(() => {
    const result = compiler(code);
    
    if (result.success) {
      runner(result.code, (output) => {
        if (output) {
          outputDiv.innerHTML = `<span style="color: #27ae60; font-weight: bold;">✅ Success!</span><br><pre>${output}</pre>`;
        } else {
          outputDiv.innerHTML = '<span style="color: #f39c12;">⚠️ Code executed successfully but produced no output.</span>';
        }
      });
    } else {
      outputDiv.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">❌ Compilation Error:</span><br><pre>${result.error}</pre>`;
    }
  }, 100);
}

function clearCode() {
  const codeInput = document.getElementById('codeInput');
  const outputDiv = document.getElementById('output');
  
  if (codeInput) {
    codeInput.value = '';
  }
  
  if (outputDiv) {
    outputDiv.innerHTML = 'Click "Run Code" to see the output here...';
  }
}

function runExample() {
  const codeInput = document.getElementById('codeInput');
  const exampleCode = `eta x = 10
eta y = 20
eta sum = x + y
eta message = "Hello World"

lekh sum
lekh "The result is:"
lekh message`;
  
  if (codeInput) {
    codeInput.value = exampleCode;
    executeCode();
  }
}

// Test the enhanced compiler
const testCode = `
eta x = 10
eta y = 20
eta sum = x + y
eta message = "Hello World"

lekh sum
lekh "Anything"
lekh message
`;

console.log("Testing enhanced compiler:");
const testResult = compiler(testCode);
if (testResult.success) {
  console.log("Generated JavaScript:");
  console.log(testResult.code);
  console.log("\nExecuting:");
  runner(testResult.code, (output) => console.log("Captured output:", output));
}