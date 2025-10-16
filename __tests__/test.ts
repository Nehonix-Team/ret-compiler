import { Interface } from 'reliant-type';

export const UserSchema = Interface({
  id: "number",
  name: "string",
  age: "number(0,120)",
  role: "admin|user|guest",
});


export const ProductSchema = Interface({
  id: "number",
  name: "string",
  price: "positive",
  category: "electronics|clothing|food",
});