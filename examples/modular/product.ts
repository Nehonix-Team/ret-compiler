import { Interface } from 'reliant-type';

export const BaseEntitySchema = Interface({
  id: "uuid",
  createdAt: "date",
  updatedAt: "date",
});


export { BaseEntity };
export const UserSchema = Interface({
  id: "uuid",
  createdAt: "date",
  updatedAt: "date",
  email: "email",
  username: "string",
  role: "admin|user|moderator|guest",
  adminToken: "when role === admin *? string : any?",
  permissions: "when role === admin *? string[] : any?",
});


export { User };
export const ProductSchema = Interface({
  id: "uuid",
  name: "string",
  price: "positive",
  category: "electronics|clothing|books",
  ownerId: "uuid",
  warranty: "when category === electronics *? number : any?",
  specs: "when category === electronics *? record<string,string> : any?",
  size: "when category === clothing *? S|M|L|XL : any?",
  material: "when category === clothing *? string : any?",
});


export { Product };