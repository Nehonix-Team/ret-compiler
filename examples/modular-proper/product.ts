import { Interface } from 'reliant-type';

export const ProductSchema = Interface({
  id: "uuid",
  name: "string",
  price: "positive",
});


export { Product };