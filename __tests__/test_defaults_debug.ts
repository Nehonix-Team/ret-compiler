import { Interface, Mod } from "../src/index";

console.log("🔍 Debugging defaults method");

const schema = Interface(
  {
    id: "number",
    name: "string",
    role: "string?",
  },
  { skipOptimization: true }
);

const withDefaults = Mod.defaults(schema, { role: "user" });

console.log(
  "Schema options:",
  JSON.stringify((withDefaults as any).options, null, 2)
);

const testData = { id: 1, name: "John" };
console.log("Input data:", testData);

const result = withDefaults.safeParse(testData);
console.log("Parse result:", result);
console.log("Role value:", result.data?.role);
console.log("Role type:", typeof result.data?.role);
