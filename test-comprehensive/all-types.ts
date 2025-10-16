import { Interface } from 'reliant-type';

export const BasicTypesSchema = Interface({
  name: "string",
  age: "number",
  isActive: "boolean",
  createdAt: "date",
  metadata: "any",
  data: "object",
});


export const ConstrainedTypesSchema = Interface({
  username: "string(3,20)",
  password: "string(8,)",
  score: "number(0,100)",
  count: "integer",
  id: "positive",
  debt: "negative",
  temperature: "float",
});


export const FormatTypesSchema = Interface({
  email: "email",
  website: "url",
  userId: "uuid",
  mobile: "phone",
  server: "ip",
  config: "json",
  color: "hexcolor",
  encodedData: "base64",
  authToken: "jwt",
  appVersion: "semver",
  urlSlug: "slug",
});


export const UnionTypesSchema = Interface({
  status: "active|inactive|pending",
  role: "admin|user|guest",
});


export const ArrayTypesSchema = Interface({
  tags: "string[]",
  scores: "number[]",
  flags: "boolean[]",
});


export const OptionalTypesSchema = Interface({
  nickname: "string?",
  bio: "string?",
  avatar: "url?",
  rating: "number?",
  verified: "boolean?",
});


export const ComplexSchemaSchema = Interface({
  id: "uuid",
  email: "email",
  username: "string(3,30)",
  displayName: "string?",
  bio: "string(,500)?",
  age: "number(18,120)",
  score: "positive",
  role: "admin|user|moderator",
  status: "active|inactive|suspended",
  tags: "string[]",
  permissions: "string[]",
  website: "url?",
  phone: "phone?",
});