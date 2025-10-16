import { Interface } from 'reliant-type';

export const RegexPatternsSchema = Interface({
  zipCode: "string(/^\d{5}$/)",
  username: "string(/^[a-zA-Z0-9_]{3,20}$/)",
  hexColor: "string(/^#[0-9A-Fa-f]{6}$/)",
  email: "string(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)",
});