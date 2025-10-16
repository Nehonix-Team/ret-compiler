import { Interface } from 'reliant-type';

export const User = Interface({
  age: "number(18,120)",
  email: "string(^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$)",
  username: "string(3,20)",
});