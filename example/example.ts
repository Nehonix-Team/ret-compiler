import { Interface } from 'reliant-type';

export const UserSchema = Interface({
  id: "number?",
  email: "string",
  name: "string",
  age: "int",
  role: "admin|user|guest",
  profile: {
    bio: "string",
    avatar: "url?",
  },
  tags: "string[]",
  metadata: "record<string,any>",
});


export type UserRole = "admin" | "moderator" | "user" | "guest";

export const UserRoleSchema = "admin|moderator|user|guest";


export const ProductSchema = Interface({
  id: "number",
  name: "string",
  price: "positive",
  category: "electronics|clothing|books",
  warranty: "when category === electronics *? number : any?",
  specs: "when category === electronics *? record<string,string> : any?",
  size: "when category === clothing *? S|M|L|XL : any?",
  material: "when category === clothing *? string : any?",
  organic: "when !(category === clothing) *? boolean : any?",
});


export { User, Product, UserRole };