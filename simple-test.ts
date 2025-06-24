import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🔧 SIMPLE TEST");

try {
  const schema = Interface({
    id: "string",
    feature: "when config.test.$exists() *? boolean : =false",
  }).allowUnknown();
  
  console.log("Schema created successfully");
  
  const result = schema.safeParse({
    id: "test",
    config: { test: true },
    feature: true
  });
  
  console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  
} catch (error: any) {
  console.log(`Error: ${error.message}`);
}
