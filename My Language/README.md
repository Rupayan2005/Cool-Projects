# "Boishaak" --A Bengali Theme Based Programming Language

A Bengali-themed programming language designed to make coding more accessible and intuitive for Bengali speakers. Boishaak combines familiar Bengali terminology with modern programming concepts.

## 🌟 Features

- **Bengali-Inspired Syntax**: Uses familiar Bengali words for programming constructs
- **Simple Variable Declaration**: Use `eta` keyword for declaring variables
- **Output Statements**: Use `lekh` keyword for printing/displaying values
- **Type Inference**: Automatic type detection for variables
- **Web-based IDE**: Run Boishaak code directly in your browser
- **Real-time Execution**: Instant feedback and results
- **Beginner Friendly**: Designed for ease of learning and use

## 📖 Language Syntax

### Variable Declaration

Variables are declared using the `eta` keyword:

```boishaak
eta variableName = value
```

### Output Statements

Use the `lekh` keyword to display values:

```boishaak
lekh variableName
lekh "string literal"
```

### Data Types

Boishaak supports various data types:

- **Numbers**: Integers and floating-point numbers
- **Strings**: Text enclosed in double quotes
- **Boolean**: True/false values
- **Arrays**: Collections of values

## 🚀 Example Code

```Boishaak
eta x = 10
eta y = 20
eta sum = x + y
eta message = "Hello World"

lekh sum
lekh "The result is:"
lekh message
```

**Output:**

```
30
The result is:
Hello World
```

## 🛠️ Installation & Usage

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Running Boishaak Code

## 🏗️ Architecture

The Boishaak interpreter consists of three main components:

### Frontend (HTML/CSS)

- Clean, responsive user interface
- Code editor with syntax highlighting
- Output display area
- Error reporting system

### Parser & Lexer (JavaScript)

- Tokenizes Boishaak source code
- Builds Abstract Syntax Tree (AST)
- Handles syntax error detection

### Interpreter Engine (JavaScript)

- Executes parsed Boishaak code
- Manages variable scope and memory
- Handles runtime operations and built-in functions

## 📚 Language Reference

### Keywords

- `eta` - Variable declaration
- `lekh` - Output/print statement

### Operators

- `+` - Addition
- `-` - Subtraction
- `*` - Multiplication
- `/` - Division
- `=` - Assignment

### Comments

```boishaak
# This is a comment
eta x = 5  # This is also a comment
```

## 🔧 Development

### Project Structure

```
boishaak/
├── index.html          # Main application interface
├── styles.css          # UI styling and themes
├── compile.js          # Whole Backend Logic
```

### Building from Source

1. Clone the repository
2. Open `index.html` in a web browser
3. Start coding in Boishaak!

## 🤝 Contributing

We welcome contributions to make Boishaak better! Here's how you can help:

1. **Bug Reports**: Found a bug? Please open an issue with details
2. **Feature Requests**: Have an idea? We'd love to hear it
3. **Code Contributions**: Submit pull requests for improvements
4. **Documentation**: Help improve our docs and examples
5. **Testing**: Try Boishaak and share your experience

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation for any changes
- Ensure cross-browser compatibility

## 🐛 Known Issues

- Complex expressions may need parentheses for proper evaluation
- String concatenation syntax under development
- Limited built-in function library

## 👥 Authors

- **[Rupayan]** - _Initial work and language design_

## 🙏 Acknowledgments

- Inspired by the rich Bengali language and culture
- Built with modern web technologies
- Thanks to the open-source community for tools and libraries

## 📞 Support

If you have questions or need help:

- Open an issue on GitHub

---

**Boishaak** - Making programming accessible in Bengali | বাংলায় প্রোগ্রামিং
