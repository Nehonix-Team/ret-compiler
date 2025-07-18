import { Interface } from "../src";

const schem = Interface({
  field: "record<string, number>",
});

const result = schem.safeParse({
  field: {
    key1: 1,
    key2: 2,
    key3: "3", // Should fail
  },
});

if (!result.success) {
  console.log("Errors:", result.errors);
} else {
  console.log("Data:", result.data);
}
