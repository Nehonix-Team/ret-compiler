import { Interface, Mod } from "../src/index";

console.log("🔍 Debugging Mod.makeOptional with nested objects");

const schema = Interface({
  id: "number",
  name: "string",
  preferences: {
    theme: "light|dark",
    notifications: "boolean",
  },
}, { skipOptimization: true });

console.log("Original schema definition:", JSON.stringify((schema as any).definition, null, 2));

const flexibleSchema = Mod.makeOptional(schema, ["preferences"]);

console.log("Modified schema definition:", JSON.stringify((flexibleSchema as any).definition, null, 2));

const result1 = flexibleSchema.safeParse({
  id: 1,
  name: "John",
  // preferences is optional
});

const result2 = flexibleSchema.safeParse({
  id: 1,
  name: "John",
  preferences: {
    theme: "dark",
    notifications: true,
  },
});

console.log("Result 1 (without preferences):", result1);
console.log("Result 2 (with preferences):", result2);
