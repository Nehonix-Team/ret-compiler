import { Interface, Mod } from "../src/index";

console.log("🔍 Testing strict and passthrough functionality");

// ===== TEST STRICT =====
console.log("\n1. Testing strict()");
const schema = Interface(
  {
    id: "number",
    name: "string",
  },
  { skipOptimization: true }
);

const strictSchema = Mod.strict(schema);

console.log(
  "Strict schema options:",
  JSON.stringify((strictSchema as any).options, null, 2)
);

const strictResult = strictSchema.safeParse({
  id: 1,
  name: "John",
  extra: "should be rejected",
});

console.log("Strict result (should fail):", strictResult.success);
if (!strictResult.success) {
  console.log(
    "Errors:",
    strictResult.errors.map((e) => e.message)
  );
}

// ===== TEST PASSTHROUGH =====
console.log("\n2. Testing passthrough()");
const passthroughSchema = Mod.passthrough(schema);

console.log(
  "Passthrough schema options:",
  JSON.stringify((passthroughSchema as any).options, null, 2)
);

const passthroughResult = passthroughSchema.safeParse({
  id: 1,
  name: "John",
  extra: "should be allowed",
  another: "also allowed",
});

console.log("Passthrough result (should succeed):", passthroughResult.success);
if (passthroughResult.success) {
  console.log("Data:", passthroughResult.data);
}

// ===== TEST DEFAULT BEHAVIOR =====
console.log("\n3. Testing default behavior (should ignore extra properties)");
const defaultResult = schema.safeParse({
  id: 1,
  name: "John",
  extra: "should be ignored",
});

console.log("Default result (should succeed):", defaultResult.success);
if (defaultResult.success) {
  console.log("Data:", defaultResult.data);
}
