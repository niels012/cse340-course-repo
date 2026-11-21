// app.js - Importing specific functions from math.js
import { add, subtract, multiply, divide } from './math.js';

console.log("Addition:", add(2, 3));            // Output: 5
console.log("Subtraction:", subtract(5, 2));    // Output: 3
console.log("Multiplication:", multiply(3, 4)); // Output: 12
console.log("Division:", divide(10, 2));        // Output: 5
console.log("Division by zero:", divide(5, 0)); // Output: Cannot divide by zero