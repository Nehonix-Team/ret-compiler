import { Interface } from "./src/core/schema/mode/interfaces/Interface";

// Test VSCode extension syntax highlighting for URL args
const TestSchema = Interface({
  // Basic URL validation
  website: "url",

  // URL args should now be properly highlighted
  secureApi: "url.https",
  legacyEndpoint: "url.http",
  publicWebsite: "url.web",
  devServer: "url.dev",
  fileServer: "url.ftp",

  // Optional URL args
  optionalSecure: "url.https?",
  optionalDev: "url.dev?",

  // URL arg arrays
  apiEndpoints: "url.https[]",
  devServers: "url.dev[](1,5)",

  // Mixed with other types
  email: "email",
  id: "uuid",
  name: "string(2,50)",
  active: "boolean",
});

console.log("✅ VSCode syntax test file created");
console.log("Check if URL args are properly highlighted in VSCode!");
