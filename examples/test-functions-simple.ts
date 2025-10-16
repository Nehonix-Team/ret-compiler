import { Interface } from 'reliant-type';

export const Product = Interface({
  price: "number(0,10000)",
  quantity: "number(0,1000)",
});