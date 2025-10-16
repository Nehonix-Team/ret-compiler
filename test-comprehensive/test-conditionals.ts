import { Interface } from 'reliant-type';

export const ConditionalExampleSchema = Interface({
  role: "admin|user|guest",
  age: "number",
  accountType: "free|premium|enterprise",
  // Conditional block: when role === admin { ... }
  // Conditional block: when age >= 18 { ... }
});