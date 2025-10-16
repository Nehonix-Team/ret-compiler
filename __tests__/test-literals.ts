import { Interface } from 'reliant-type';

export const LiteralValuesSchema = Interface({
  role: "=admin",
  environment: "=production",
  version: "=1",
  apiVersion: "=2",
  isEnabled: "=true",
  isLegacy: "=false",
});