import { Interface } from 'reliant-type';

export const LiteralTestSchema = Interface({
  version: "number",
  environment: "string",
  isEnabled: "boolean",
});