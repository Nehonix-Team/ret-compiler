export interface User {
  id: number;
  name: string;
  age: number;
  role: admin | user | guest;
}

export const UserSchema = Interface({
  id: number(),
  name: string(),
  age: number().min(0).max(120),
  role: union([literal("admin"), literal("user"), literal("guest")]),
});


export interface Product {
  id: number;
  name: string;
  price: number;
  category: electronics | clothing | food;
}

export const ProductSchema = Interface({
  id: number(),
  name: string(),
  price: number().positive(),
  category: union([literal("electronics"), literal("clothing"), literal("food")]),
});