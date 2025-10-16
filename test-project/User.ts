import { Interface } from 'reliant-type';

export const User = Interface({
  id: "number",
  email: "string(^[^\s@]+@[^\s@]+\.[^\s@]+$)",
  name: "string(2,)",
  age: "positive",
  role: "admin|user|guest",
  createdAt: "date",
  isActive: "boolean",
});