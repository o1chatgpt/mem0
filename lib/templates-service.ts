"use client"

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

// Define the template interface
export interface FileTemplate {
  id: string
  name: string
  description: string
  fileType: string
  extension: string
  content: string
  icon?: string
  isCustom?: boolean
  createdAt?: string
  updatedAt?: string
}

// Create a collection of templates for different file types
export const fileTemplates: FileTemplate[] = [
  // HTML Templates
  {
    id: "html-basic",
    name: "Basic HTML",
    description: "A simple HTML5 template with basic structure",
    fileType: "html",
    extension: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello, World!</h1>
  
</body>
</html>`,
  },
  {
    id: "html-responsive",
    name: "Responsive HTML",
    description: "HTML template with responsive meta tags and CSS",
    fileType: "html",
    extension: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Responsive Website</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    header {
      background: #f4f4f4;
      padding: 1rem;
    }
    @media (max-width: 768px) {
      .container {
        padding: 0 10px;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Responsive Website</h1>
    </div>
  </header>
  <main class="container">
    <section>
      <h2>Welcome</h2>
      <p>This is a responsive website template.</p>
    </section>
  </main>
</body>
</html>`,
  },
  {
    id: "html-bootstrap",
    name: "Bootstrap HTML",
    description: "HTML template with Bootstrap 5",
    fileType: "html",
    extension: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bootstrap Template</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="#">Brand</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link active" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Services</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8">
        <h1>Welcome to Bootstrap</h1>
        <p class="lead">This is a Bootstrap 5 template.</p>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Sidebar</h5>
            <p class="card-text">Some quick example text for the sidebar.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`,
  },

  // CSS Templates
  {
    id: "css-reset",
    name: "CSS Reset",
    description: "A modern CSS reset to provide a clean baseline",
    fileType: "css",
    extension: "css",
    content: `/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

body, h1, h2, h3, h4, p, figure, blockquote, dl, dd {
  margin: 0;
}

ul, ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

html:focus-within {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

a {
  text-decoration: none;
  color: inherit;
}

img, picture {
  max-width: 100%;
  display: block;
}

input, button, textarea, select {
  font: inherit;
}

@media (prefers-reduced-motion: reduce) {
  html:focus-within {
   scroll-behavior: auto;
  }
  
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
  },
  {
    id: "css-flexbox",
    name: "Flexbox Layout",
    description: "Common flexbox patterns and utilities",
    fileType: "css",
    extension: "css",
    content: `/* Flexbox Layout Utilities */

/* Basic Flex Container */
.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

/* Flex Direction */
.flex-row {
  flex-direction: row;
}

.flex-row-reverse {
  flex-direction: row-reverse;
}

.flex-col {
  flex-direction: column;
}

.flex-col-reverse {
  flex-direction: column-reverse;
}

/* Flex Wrap */
.flex-wrap {
  flex-wrap: wrap;
}

.flex-nowrap {
  flex-wrap: nowrap;
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

.justify-evenly {
  justify-content: space-evenly;
}

/* Align Items */
.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.items-baseline {
  align-items: baseline;
}

.items-stretch {
  align-items: stretch;
}

/* Align Content */
.content-start {
  align-content: flex-start;
}

.content-end {
  align-content: flex-end;
}

.content-center {
  align-content: center;
}

.content-between {
  align-content: space-between;
}

.content-around {
  align-content: space-around;
}

.content-stretch {
  align-content: stretch;
}

/* Flex Item Properties */
.flex-1 {
  flex: 1 1 0%;
}

.flex-auto {
  flex: 1 1 auto;
}

.flex-initial {
  flex: 0 1 auto;
}

.flex-none {
  flex: none;
}

/* Common Layouts */
.center-all {
  display: flex;
  justify-content: center;
  align-items: center;
}

.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stack {
  display: flex;
  flex-direction: column;
}`,
  },
  {
    id: "css-grid",
    name: "CSS Grid Layout",
    description: "Common CSS Grid patterns and utilities",
    fileType: "css",
    extension: "css",
    content: `/* CSS Grid Layout Utilities */

/* Basic Grid Container */
.grid {
  display: grid;
}

.inline-grid {
  display: inline-grid;
}

/* Common Grid Templates */
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-cols-12 {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.grid-rows-2 {
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.grid-rows-3 {
  grid-template-rows: repeat(3, minmax(0, 1fr));
}

/* Auto Columns and Rows */
.auto-cols-auto {
  grid-auto-columns: auto;
}

.auto-cols-min {
  grid-auto-columns: min-content;
}

.auto-cols-max {
  grid-auto-columns: max-content;
}

.auto-cols-fr {
  grid-auto-columns: minmax(0, 1fr);
}

.auto-rows-auto {
  grid-auto-rows: auto;
}

.auto-rows-min {
  grid-auto-rows: min-content;
}

.auto-rows-max {
  grid-auto-rows: max-content;
}

.auto-rows-fr {
  grid-auto-rows: minmax(0, 1fr);
}

/* Gap */
.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

/* Responsive Grid */
@media (min-width: 640px) {
  .sm\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* Common Grid Layouts */
.grid-layout-sidebar {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
}

.grid-layout-dashboard {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr 1fr auto;
  min-height: 100vh;
}

.grid-area-header {
  grid-area: header;
}

.grid-area-sidebar {
  grid-area: sidebar;
}

.grid-area-main {
  grid-area: main;
}

.grid-area-footer {
  grid-area: footer;
}`,
  },

  // JavaScript Templates
  {
    id: "js-basic",
    name: "Basic JavaScript",
    description: "A simple JavaScript file with basic structure",
    fileType: "javascript",
    extension: "js",
    content: `// Basic JavaScript Template

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document is ready!');
  
  // Your code here
  init();
});

/**
 * Initialize the application
 */
function init() {
  // Add event listeners
  setupEventListeners();
  
  // Initial setup
  console.log('Application initialized');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Example: Add click event to a button
  const button = document.querySelector('#myButton');
  if (button) {
    button.addEventListener('click', handleButtonClick);
  }
}

/**
 * Handle button click event
 * @param {Event} event - The click event
 */
function handleButtonClick(event) {
  console.log('Button clicked!', event);
  // Add your button click logic here
}

/**
 * Example utility function
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 */
function sum(a, b) {
  return a + b;
}

// Export functions if using modules
// export { init, sum };`,
  },
  {
    id: "js-module",
    name: "ES6 Module",
    description: "JavaScript ES6 module template",
    fileType: "javascript",
    extension: "js",
    content: `// ES6 Module Template

/**
 * Main class for the module
 */
class MyModule {
  /**
   * Create a new instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      debug: false,
      version: '1.0.0',
      ...options
    };
    
    this.initialized = false;
    
    if (this.options.debug) {
      console.log('MyModule created with options:', this.options);
    }
  }
  
  /**
   * Initialize the module
   * @returns {boolean} Success status
   */
  init() {
    if (this.initialized) {
      console.warn('Module already initialized');
      return false;
    }
    
    try {
      // Initialization logic here
      this.initialized = true;
      
      if (this.options.debug) {
        console.log('Module initialized successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Example method
   * @param {string} data - Input data
   * @returns {string} Processed data
   */
  process(data) {
    if (!this.initialized) {
      throw new Error('Module not initialized');
    }
    
    // Process the data
    return data.toUpperCase();
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Clean up logic here
    this.initialized = false;
    
    if (this.options.debug) {
      console.log('Module destroyed');
    }
  }
}

// Helper functions
const helpers = {
  /**
   * Format a date
   * @param {Date} date - The date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },
  
  /**
   * Generate a random ID
   * @returns {string} Random ID
   */
  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
};

// Export the module and helpers
export default MyModule;
export { helpers };`,
  },
  {
    id: "js-fetch",
    name: "Fetch API",
    description: "JavaScript template with Fetch API examples",
    fileType: "javascript",
    extension: "js",
    content: `// Fetch API Template

/**
 * API client for making HTTP requests
 */
class ApiClient {
  /**
   * Create a new API client
   * @param {string} baseUrl - Base URL for API requests
   */
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
  
  /**
   * Set authorization token
   * @param {string} token - Auth token
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = \`Bearer \${token}\`;
  }
  
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  }
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
  
  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    
    const fetchOptions = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      if (!response.ok) {
        throw new ApiError(response.status, data, response);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(0, { message: error.message }, null);
      }
    }
  }
}

/**
 * Custom API error
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} status - HTTP status code
   * @param {Object} data - Error data
   * @param {Response} response - Original response
   */
  constructor(status, data, response) {
    super(data.message || 'API request failed');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.response = response;
  }
}

// Example usage
async function fetchData() {
  const api = new ApiClient('https://api.example.com');
  
  try {
    // Get users
    const users = await api.get('/users');
    console.log('Users:', users);
    
    // Create a user
    const newUser = await api.post('/users', {
      name: 'John Doe',
      email: 'john@example.com'
    });
    console.log('New user:', newUser);
    
    // Update a user
    const updatedUser = await api.put(\`/users/\${newUser.id}\`, {
      name: 'John Updated'
    });
    console.log('Updated user:', updatedUser);
    
    // Delete a user
    await api.delete(\`/users/\${newUser.id}\`);
    console.log('User deleted');
    
  } catch (error) {
    console.error('API Error:', error.status, error.message);
  }
}

// Export the classes
export { ApiClient, ApiError };`,
  },

  // Markdown Templates
  {
    id: "md-basic",
    name: "Basic Markdown",
    description: "A simple Markdown template with common elements",
    fileType: "markdown",
    extension: "md",
    content: `# Document Title

## Introduction

This is a paragraph with **bold text** and *italic text*. You can also use ~~strikethrough~~ if needed.

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

## Links and Images

[Link to Google](https://www.google.com)

![Alt text for image](https://via.placeholder.com/150)

## Code

Inline \`code\` can be added with backticks.

\`\`\`javascript
// Code block with syntax highlighting
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Horizontal Rule

---

## Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

`,
  },
  {
    id: "md-readme",
    name: "README.md",
    description: "A template for project README files",
    fileType: "markdown",
    extension: "md",
    content: `# Project Name

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description

A brief description of what this project does and who it's for.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project.git

# Navigate to the project directory
cd project

# Install dependencies
npm install
\`\`\`

## Usage

\`\`\`javascript
// Example code showing how to use the project
import { myFunction } from 'my-project';

const result = myFunction();
console.log(result);
\`\`\`

## API Reference

### \`myFunction(param1, param2)\`

Description of what the function does.

**Parameters:**
- \`param1\` (string): Description of param1
- \`param2\` (number): Description of param2

**Returns:**
- (boolean): Description of return value

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- List any resources, libraries, or tools that you've used or been inspired by
- Credit collaborators or mentors
`,
  },

  // React Templates
  {
    id: "react-component",
    name: "React Component",
    description: "A React functional component template",
    fileType: "jsx",
    extension: "jsx",
    content: `import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MyComponent.css';

/**
 * MyComponent - A reusable React component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const MyComponent = ({ title, description, items = [], onItemClick }) => {
  // State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    // Component mount effect
    console.log('Component mounted');
    
    // Cleanup function (runs on unmount)
    return () => {
      console.log('Component will unmount');
    };
  }, []);
  
  useEffect(() => {
    // Run when title changes
    document.title = title;
  }, [title]);
  
  // Event handlers
  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };
  
  // Render helpers
  const renderItems = () => {
    if (items.length === 0) {
      return <p className="empty-message">No items available</p>;
    }
    
    return (
      <ul className="item-list">
        {items.map((item) => (
          <li 
            key={item.id} 
            className={selectedItem?.id === item.id ? 'selected' : ''}
            onClick={() => handleItemClick(item)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    );
  };
  
  // Main render
  return (
    <div className="my-component">
      <h2 className="title">{title}</h2>
      {description && <p className="description">{description}</p>}
      
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        renderItems()
      )}
      
      {selectedItem && (
        <div className="selected-item-details">
          <h3>Selected: {selectedItem.name}</h3>
          <p>{selectedItem.description}</p>
        </div>
      )}
    </div>
  );
};

// PropTypes for type checking
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string
    })
  ),
  onItemClick: PropTypes.func
};

export default MyComponent;
`,
  },
  {
    id: "react-hook",
    name: "React Custom Hook",
    description: "A template for creating custom React hooks",
    fileType: "jsx",
    extension: "jsx",
    content: `import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for fetching data
 * 
 * @param {string} url - The URL to fetch data from
 * @param {Object} options - Fetch options
 * @returns {Object} The fetch state and control functions
 */
const useFetch = (url, options = {}) => {
  // State for storing the fetch results and status
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Refs for tracking mounted state and abort controller
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);
  
  // Function to fetch data
  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = options) => {
    // Don't proceed if no URL
    if (!fetchUrl) return;
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! Status: \${response.status}\`);
      }
      
      const result = await response.json();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      // Only update state if component is still mounted and not aborted
      if (isMounted.current && err.name !== 'AbortError') {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [url, options]);
  
  // Function to manually refetch data
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Function to cancel the current=>{
    return fetchData();
  }, [fetchData]);
  
  // Function to cancel the current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  // Effect to fetch data on mount or when dependencies change
  useEffect(() => {
    fetchData();
    
    // Cleanup function to run on unmount or before re-running effect
    return () => {
      isMounted.current = false;
      cancel();
    };
  }, [fetchData, cancel]);
  
  return { data, error, loading, refetch, cancel };
};

export default useFetch;

/**
 * Example usage:
 * 
 * function MyComponent() {
 *   const { data, error, loading, refetch } = useFetch('https://api.example.com/data');
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       <button onClick={refetch}>Refresh Data</button>
 *       <pre>{JSON.stringify(data, null, 2)}</pre>
 *     </div>
 *   );
 * }
 */
`,
  },

  // Next.js Templates
  {
    id: "nextjs-page",
    name: "Next.js Page",
    description: "A template for a Next.js page component",
    fileType: "jsx",
    extension: "jsx",
    content: `import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Page.module.css';

/**
 * Example Next.js page component
 * 
 * @param {Object} props - Component props from getServerSideProps or getStaticProps
 * @returns {JSX.Element} Rendered page
 */
export default function Page({ data }) {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div className={styles.container}>
      <Head>
        <title>My Next.js Page</title>
        <meta name="description" content="Description of my Next.js page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.tabs}>
          <button 
            className={\`\${styles.tab} \${activeTab === 'tab1' ? styles.active : ''}\`}
            onClick={() => setActiveTab('tab1')}
          >
            Tab 1
          </button>
          <button 
            className={\`\${styles.tab} \${activeTab === 'tab2' ? styles.active : ''}\`}
            onClick={() => setActiveTab('tab2')}
          >
            Tab 2
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'tab1' && (
            <div>
              <h2>Tab 1 Content</h2>
              <p>This is the content for tab 1.</p>
              {data && (
                <ul className={styles.list}>
                  {data.map((item) => (
                    <li key={item.id} className={styles.listItem}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {activeTab === 'tab2' && (
            <div>
              <h2>Tab 2 Content</h2>
              <p>This is the content for tab 2.</p>
              <div className={styles.imageContainer}>
                <Image
                  src="/placeholder.jpg"
                  alt="Placeholder"
                  width={500}
                  height={300}
                  layout="responsive"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <Link href="/">
          <a>Back to Home</a>
        </Link>
      </footer>
    </div>
  );
}

/**
 * Get server-side props for this page
 * 
 * @param {Object} context - Next.js context
 * @returns {Object} Props for the page component
 */
export async function getServerSideProps(context) {
  // Fetch data from an API
  try {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();
    
    return {
      props: { data }, // Will be passed to the page component as props
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    
    return {
      props: { data: [] }, // Return empty data on error
    };
  }
}

/**
 * Alternative: Get static props for this page
 * Uncomment to use instead of getServerSideProps
 */
/*
export async function getStaticProps() {
  // Fetch data from an API
  try {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();
    
    return {
      props: { data }, // Will be passed to the page component as props
      revalidate: 60, // Regenerate page every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    
    return {
      props: { data: [] }, // Return empty data on error
      revalidate: 60,
    };
  }
}
*/
`,
  },
]

// Storage key for custom templates
const CUSTOM_TEMPLATES_STORAGE_KEY = "custom-templates"

// Function to get templates by file type
export function getTemplatesByType(fileType: string): FileTemplate[] {
  const builtInTemplates = fileTemplates.filter((template) => template.fileType === fileType)
  const customTemplates = getCustomTemplates().filter((template) => template.fileType === fileType)
  return [...customTemplates, ...builtInTemplates]
}

// Function to get a template by ID
export function getTemplateById(id: string): FileTemplate | undefined {
  // First check custom templates
  const customTemplate = getCustomTemplates().find((template) => template.id === id)
  if (customTemplate) return customTemplate

  // Then check built-in templates
  return fileTemplates.find((template) => template.id === id)
}

// Function to get all available templates
export function getAllTemplates(): FileTemplate[] {
  return [...getCustomTemplates(), ...fileTemplates]
}

// Function to get file type from extension
export function getFileTypeFromExtension(extension: string): string {
  const extensionMap: Record<string, string> = {
    html: "html",
    htm: "html",
    css: "css",
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    md: "markdown",
    json: "json",
    txt: "text",
  }

  return extensionMap[extension.toLowerCase()] || "text"
}

// Function to get custom templates from storage
export function getCustomTemplates(): FileTemplate[] {
  if (typeof window === "undefined") return []

  try {
    const storedTemplates = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY)
    if (!storedTemplates) return []

    return JSON.parse(storedTemplates) as FileTemplate[]
  } catch (error) {
    console.error("Error loading custom templates:", error)
    return []
  }
}

// Function to save custom templates to storage
export function saveCustomTemplates(templates: FileTemplate[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error("Error saving custom templates:", error)
  }
}

// Function to add a new custom template
export function addCustomTemplate(
  template: Omit<FileTemplate, "id" | "isCustom" | "createdAt" | "updatedAt">,
): FileTemplate {
  if (!isBrowser) {
    // Return a dummy template when not in browser
    return {
      ...template,
      id: "dummy-id",
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const customTemplates = getCustomTemplates()

  const newTemplate: FileTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  customTemplates.push(newTemplate)
  saveCustomTemplates(customTemplates)

  return newTemplate
}

// Function to update an existing custom template
export function updateCustomTemplate(
  id: string,
  updates: Partial<Omit<FileTemplate, "id" | "isCustom" | "createdAt">>,
): FileTemplate | null {
  if (!isBrowser) return null

  const customTemplates = getCustomTemplates()
  const index = customTemplates.findIndex((template) => template.id === id)

  if (index === -1) return null

  const updatedTemplate: FileTemplate = {
    ...customTemplates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  customTemplates[index] = updatedTemplate
  saveCustomTemplates(customTemplates)

  return updatedTemplate
}

// Function to delete a custom template
export function deleteCustomTemplate(id: string): boolean {
  if (!isBrowser) return false

  const customTemplates = getCustomTemplates()
  const filteredTemplates = customTemplates.filter((template) => template.id !== id)

  if (filteredTemplates.length === customTemplates.length) {
    return false // No template was removed
  }

  saveCustomTemplates(filteredTemplates)
  return true
}

// Interface for template export file
export interface TemplateExportFile {
  version: string
  exportDate: string
  templates: FileTemplate[]
}

// Function to export templates to a JSON file
export function exportTemplates(templateIds?: string[]): string {
  if (!isBrowser) return JSON.stringify({ version: "1.0", exportDate: "", templates: [] })

  const customTemplates = getCustomTemplates()

  // Filter templates if specific IDs are provided
  const templatesToExport = templateIds
    ? customTemplates.filter((template) => templateIds.includes(template.id))
    : customTemplates

  // Create export object
  const exportData: TemplateExportFile = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    templates: templatesToExport,
  }

  // Convert to JSON string
  return JSON.stringify(exportData, null, 2)
}

// Function to import templates from a JSON string
export function importTemplates(jsonData: string): {
  success: boolean
  imported: number
  skipped: number
  error?: string
} {
  if (!isBrowser) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      error: "Cannot import templates on the server",
    }
  }

  try {
    // Parse the JSON data
    const importData = JSON.parse(jsonData) as TemplateExportFile

    // Validate the import data
    if (!importData.version || !importData.templates || !Array.isArray(importData.templates)) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        error: "Invalid template file format",
      }
    }

    // Get existing templates
    const existingTemplates = getCustomTemplates()
    const existingIds = new Set(existingTemplates.map((t) => t.id))

    // Track import statistics
    let imported = 0
    let skipped = 0

    // Process each template
    const newTemplates = [...existingTemplates]

    for (const template of importData.templates) {
      // Validate required fields
      if (!template.name || !template.description || !template.fileType || !template.extension || !template.content) {
        skipped++
        continue
      }

      // Generate a new ID to avoid conflicts
      const newId = `custom-import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Create a new template object
      const newTemplate: FileTemplate = {
        ...template,
        id: newId,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to the templates array
      newTemplates.push(newTemplate)
      imported++
    }

    // Save the updated templates
    if (imported > 0) {
      saveCustomTemplates(newTemplates)
    }

    return {
      success: true,
      imported,
      skipped,
    }
  } catch (error) {
    console.error("Error importing templates:", error)
    return {
      success: false,
      imported: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : "Unknown error during import",
    }
  }
}
