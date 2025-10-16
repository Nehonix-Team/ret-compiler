import { Interface } from 'reliant-type';

export const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string",
  age: "number",
  isActive: "boolean",
  createdAt: "date",
  nickname: "string?",
  bio: "string?",
  avatar: "url?",
  username: "string(3,20)",
  password: "string(8,)",
  score: "number(0,100)",
  points: "positive",
  balance: "int",
  rating: "float",
  role: "admin|user|moderator|guest",
  status: "active|inactive|suspended",
  tags: "string[]",
  permissions: "string[]",
  scores: "number[]",
  website: "url?",
  phone: "phone?",
  ipAddress: "ip?",
  metadata: "record<string,any>",
  settings: "record<string,string>",
  zipCode: "string(/^\d{5}$/)",
  phoneNumber: "string(/^\+?[1-9]\d{1,14}$/)",
});


export const ConfigSchema = Interface({
  version: "=1",
  environment: "=production",
  apiVersion: "=2",
  isEnabled: "=true",
  isLegacy: "=false",
  defaultRole: "=user",
});


export const ProductSchema = Interface({
  id: "positive",
  sku: "string(/^[A-Z]{3}-\d{6}$/)",
  name: "string(1,100)",
  description: "string(,500)?",
  price: "number(0.01,)",
  category: "electronics|clothing|food|books",
  inStock: "boolean",
  tags: "string[]",
  metadata: "record<string,any>?",
  barcode: "string(/^\d{12,13}$/)",
  weight: "float?",
  dimensions: "record<string,number>?",
});