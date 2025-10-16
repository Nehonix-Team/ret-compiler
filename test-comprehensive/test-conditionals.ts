import { Interface } from 'reliant-type';

export const ConditionalExampleSchema = Interface({
  role: "admin|user|guest",
  age: "number",
  accountType: "free|premium|enterprise",
  adminToken: "when role === admin *? string : any?",
  permissions: "when role === admin *? string[] : any?",
  canVote: "when age >= 18 *? boolean : any?",
  adultContent: "when age >= 18 *? boolean : any?",
});