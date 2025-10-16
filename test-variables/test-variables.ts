import { Interface } from 'reliant-type';

export const User = Interface({
  age: "number(18,120)",
  name: "string",
});