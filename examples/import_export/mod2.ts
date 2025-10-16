import { Interface } from 'reliant-type';

export const TestSchema = Interface({
  name: "string",
});


export const ProductSchema = Interface({
  id: "uuid",
  val: "Test",
});


export const ModSchema = Interface({
  prdt: "Product",
});


export { ModSchema };