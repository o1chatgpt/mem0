export interface FileTemplate {
  name: string
  description: string
  content: string
}

export interface TemplateCategory {
  language: "html" | "css" | "javascript" | "markdown"
  templates: FileTemplate[]
}

export const fileTemplates: TemplateCategory[] = [
  {
    language: "html",
    templates: [
      {
        name: "Basic HTML",
        description: "A simple HTML5 document structure",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
  
</body>
</html>`,
      },
      {
        name: "HTML with CSS & JS",
        description: "HTML document with CSS and JavaScript",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a starter template with CSS and JavaScript.</p>
  
  <script>
    // Your JavaScript code here
    console.log('Hello from JavaScript!');
  </script>
</body>
</html>`,
      },
      {
        name: "Responsive Layout",
        description: "HTML with responsive layout structure",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Layout</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    header {
      background-color: #f8f9fa;
      padding: 1rem 0;
    }
    
    main {
      padding: 2rem 0;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (min-width: 1024px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    footer {
      background-color: #f8f9fa;
      padding: 1rem 0;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Responsive Layout</h1>
    </div>
  </header>
  
  <main>
    <div class="container">
      <div class="grid">
        <div>
          <h2>Section 1</h2>
          <p>This is the first section of the responsive layout.</p>
        </div>
        <div>
          <h2>Section 2</h2>
          <p>This is the second section of the responsive layout.</p>
        </div>
        <div>
          <h2>Section 3</h2>
          <p>This is the third section of the responsive layout.</p>
        </div>
      </div>
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2023 Your Name</p>
    </div>
  </footer>
</body>
</html>`,
      },
    ],
  },
  {
    language: "css",
    templates: [
      {
        name: "Basic CSS",
        description: "Simple CSS starter with variables",
        content: `/* Basic CSS Starter */

:root {
  --primary-color: #3490dc;
  --secondary-color: #ffed4a;
  --dark-color: #2d3748;
  --light-color: #f8fafc;
  --success-color: #38c172;
  --error-color: #e3342f;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background-color: var(--light-color);
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}`,
      },
      {
        name: "CSS Reset",
        description: "Modern CSS reset to normalize styles",
        content: `/* Modern CSS Reset */

/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove default margin */
body,
h1,
h2,
h3,
h4,
p,
figure,
blockquote,
dl,
dd {
  margin: 0;
}

/* Remove list styles on ul, ol elements */
ul,
ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Set core root defaults */
html:focus-within {
  scroll-behavior: smooth;
}

/* Set core body defaults */
body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* A elements that don't have a class get default styles */
a:not([class]) {
  text-decoration-skip-ink: auto;
}

/* Make images easier to work with */
img,
picture {
  max-width: 100%;
  display: block;
}

/* Inherit fonts for inputs and buttons */
input,
button,
textarea,
select {
  font: inherit;
}

/* Remove all animations, transitions and smooth scroll for people that prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  html:focus-within {
   scroll-behavior: auto;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
      },
      {
        name: "Flexbox Layout",
        description: "CSS with flexbox layout examples",
        content: `/* Flexbox Layout Examples */

/* Basic reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: #333;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Basic Flexbox Container */
.flex-container {
  display: flex;
  margin-bottom: 20px;
}

/* Flex Direction */
.flex-column {
  flex-direction: column;
}

/* Justify Content */
.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

/* Align Items */
.align-start {
  align-items: flex-start;
}

.align-end {
  align-items: flex-end;
}

.align-center {
  align-items: center;
}

.align-stretch {
  align-items: stretch;
}

/* Flex Items */
.flex-item {
  padding: 20px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  margin: 5px;
}

.flex-grow-1 {
  flex-grow: 1;
}

.flex-grow-2 {
  flex-grow: 2;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* Example usage:
<div class="flex-container justify-between align-center">
  <div class="flex-item">Item 1</div>
  <div class="flex-item flex-grow-1">Item 2</div>
  <div class="flex-item">Item 3</div>
</div>
*/`,
      },
    ],
  },
  {
    language: "javascript",
    templates: [
      {
        name: "Basic JavaScript",
        description: "Simple JavaScript starter",
        content: `// Basic JavaScript Starter

// Variables and Constants
const appName = 'My App';
let counter = 0;

// Functions
function incrementCounter() {
  counter++;
  console.log(\`Counter: \${counter}\`);
  return counter;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log(\`\${appName} initialized\`);
  
  // Example: Add event listeners to elements
  const button = document.querySelector('#myButton');
  if (button) {
    button.addEventListener('click', incrementCounter);
  }
});

// Example Class
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }
  
  getInfo() {
    return {
      name: this.name,
      email: this.email,
      createdAt: this.createdAt
    };
  }
  
  static createGuest() {
    return new User('Guest', 'guest@example.com');
  }
}

// Example of async function
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}`,
      },
      {
        name: "DOM Manipulation",
        description: "JavaScript for DOM manipulation",
        content: `// DOM Manipulation Examples

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Selecting elements
  const container = document.querySelector('.container');
  const buttons = document.querySelectorAll('.btn');
  const form = document.getElementById('myForm');
  
  // Creating elements
  const createNewElement = () => {
    const div = document.createElement('div');
    div.className = 'new-element';
    div.textContent = 'This is a new element';
    
    // Add some styling
    div.style.backgroundColor = '#f0f0f0';
    div.style.padding = '10px';
    div.style.marginTop = '10px';
    
    // Append to container
    container?.appendChild(div);
    
    return div;
  };
  
  // Event handling
  const handleClick = (event) => {
    const target = event.target;
    console.log(\`Button clicked: \${target.textContent}\`);
    
    // Toggle a class
    target.classList.toggle('active');
    
    // Create a new element when clicked
    const newElement = createNewElement();
    
    // Add event listener to the new element
    newElement.addEventListener('click', () => {
      newElement.remove(); // Remove when clicked
    });
  };
  
  // Add event listeners to all buttons
  buttons.forEach(button => {
    button.addEventListener('click', handleClick);
  });
  
  // Form handling
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent form submission
      
      // Get form data
      const formData = new FormData(form);
      const formValues = Object.fromEntries(formData.entries());
      
      console.log('Form submitted with values:', formValues);
      
      // Example validation
      const nameInput = form.querySelector('#name');
      if (nameInput && nameInput.value.trim() === '') {
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error';
        errorMessage.textContent = 'Name is required';
        errorMessage.style.color = 'red';
        
        // Insert error message after the input
        nameInput.parentNode?.insertBefore(errorMessage, nameInput.nextSibling);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      } else {
        // Success message
        const successMessage = document.createElement('p');
        successMessage.className = 'success';
        successMessage.textContent = 'Form submitted successfully!';
        successMessage.style.color = 'green';
        
        form.appendChild(successMessage);
        
        // Reset form
        form.reset();
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
      }
    });
  }
});`,
      },
      {
        name: "Modern ES6+",
        description: "JavaScript with modern ES6+ features",
        content: `// Modern JavaScript (ES6+) Features

// Arrow Functions
const add = (a, b) => a + b;
const multiply = (a, b) => {
  return a * b;
};

// Template Literals
const name = 'User';
const greeting = \`Hello, \${name}! Welcome to \${2023}.\`;

// Destructuring
const person = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  address: {
    city: 'New York',
    country: 'USA'
  }
};

const { firstName, lastName, age, address: { city } } = person;
console.log(\`\${firstName} \${lastName} is \${age} years old and lives in \${city}\`);

// Array destructuring
const colors = ['red', 'green', 'blue'];
const [primaryColor, secondaryColor, tertiaryColor] = colors;

// Spread operator
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5, 6];

const userDetails = {
  id: 1,
  username: 'johndoe',
  isActive: true
};

const extendedDetails = {
  ...userDetails,
  role: 'admin',
  lastLogin: new Date()
};

// Rest parameters
const sum = (...numbers) => numbers.reduce((total, num) => total + num, 0);
console.log(sum(1, 2, 3, 4, 5)); // 15

// Optional chaining
const user = {
  profile: {
    // address might not exist
  }
};

const userCity = user?.profile?.address?.city || 'Unknown';

// Nullish coalescing
const count = 0;
const defaultCount = count ?? 10; // 0, not 10 because 0 is not null or undefined

// Async/await with try/catch
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Modules (in actual code, these would be in separate files)
// export const helper = () => { /* ... */ };
// import { helper } from './helpers.js';

// Class with private fields (ES2022)
class Counter {
  #count = 0;
  
  increment() {
    this.#count++;
    return this.#count;
  }
  
  get value() {
    return this.#count;
  }
}

// Top-level await (ES2022, only works in modules)
// const data = await fetchUserData(1);
// console.log(data);`,
      },
    ],
  },
  {
    language: "markdown",
    templates: [
      {
        name: "Basic Markdown",
        description: "Simple Markdown starter",
        content: `# Document Title

## Introduction

This is a paragraph with **bold text** and *italic text*. You can also use [links](https://example.com) and \`inline code\`.

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3

### Ordered List

1. First item
2. Second item
3. Third item

## Code Blocks

\`\`\`javascript
// This is a code block
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Images

![Alt text](https://via.placeholder.com/150)

## Horizontal Rule

---

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.`,
      },
      {
        name: "Project README",
        description: "Template for a project README file",
        content: `# Project Name

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

A brief description of what this project does and who it's for. Explain the problem it solves and why you created it.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to the project directory
cd project-name

# Install dependencies
npm install

# Start the development server
npm start
\`\`\`

## Usage

Provide examples and code snippets showing how to use your project.

\`\`\`javascript
// Example code
import { myFunction } from 'my-project';

const result = myFunction();
console.log(result);
\`\`\`

## API Reference

### \`function1(param1, param2)\`

Description of what this function does.

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| \`param1\` | \`string\` | Description of param1 |
| \`param2\` | \`number\` | Description of param2 |

Returns: \`boolean\`

## Configuration

Explain how to configure your project.

\`\`\`json
{
  "key1": "value1",
  "key2": "value2"
}
\`\`\`

## Contributing

Contributions are always welcome!

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@example.com

Project Link: [https://github.com/username/project-name](https://github.com/username/project-name)`,
      },
      {
        name: "Documentation",
        description: "Template for technical documentation",
        content: `# Technical Documentation

## Overview

This document provides technical documentation for [Project/Feature Name].

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Installation

### Prerequisites

- Requirement 1
- Requirement 2
- Requirement 3

### Step-by-Step Installation

1. First step
   \`\`\`bash
   command to execute
   \`\`\`

2. Second step
   \`\`\`bash
   another command
   \`\`\`

3. Verify installation
   \`\`\`bash
   verification command
   \`\`\`

## Configuration

### Basic Configuration

\`\`\`json
{
  "setting1": "value1",
  "setting2": "value2"
}
\`\`\`

### Advanced Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| setting1 | string | "default" | Description of setting1 |
| setting2 | number | 0 | Description of setting2 |

## API Reference

### Endpoints

#### GET /api/resource

Retrieves a list of resources.

**Query Parameters:**

- \`limit\` (optional): Maximum number of results to return
- \`offset\` (optional): Number of results to skip

**Response:**

\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "Resource 1"
    },
    {
      "id": 2,
      "name": "Resource 2"
    }
  ],
  "total": 2
}
\`\`\`

#### POST /api/resource

Creates a new resource.

**Request Body:**

\`\`\`json
{
  "name": "New Resource",
  "description": "Description of the resource"
}
\`\`\`

**Response:**

\`\`\`json
{
  "id": 3,
  "name": "New Resource",
  "description": "Description of the resource",
  "createdAt": "2023-01-01T00:00:00Z"
}
\`\`\`

## Examples

### Example 1: Basic Usage

\`\`\`javascript
// Code example
const result = doSomething();
console.log(result);
\`\`\`

### Example 2: Advanced Usage

\`\`\`javascript
// Another code example
const options = {
  feature1: true,
  feature2: false
};
const result = doSomethingAdvanced(options);
\`\`\`

## Troubleshooting

### Common Issues

#### Issue 1: [Description of the issue]

**Cause:** Explanation of what causes this issue.

**Solution:** Steps to resolve the issue.

#### Issue 2: [Description of another issue]

**Cause:** Explanation of what causes this issue.

**Solution:** Steps to resolve the issue.

## FAQ

### Question 1?

Answer to question 1.

### Question 2?

Answer to question 2.

---

Last updated: [Date]

For more information, contact [email@example.com](mailto:email@example.com).`,
      },
    ],
  },
]

export function getTemplatesForLanguage(language: string): FileTemplate[] {
  const category = fileTemplates.find((cat) => cat.language === language)
  return category ? category.templates : []
}
