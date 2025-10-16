import { Interface } from 'reliant-type';

export const OptionalTestSchema = Interface({
  required: "string",
  optional: "string?",
  optionalWithConstraint: "string(,100)?",
});