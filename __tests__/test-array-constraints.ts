import { Interface } from 'reliant-type';

export const ArrayConstraintsSchema = Interface({
  tags: "string[](1,)",
  categories: "string[](,10)",
  scores: "number[](3,5)",
  permissions: "string[](1,20)?",
});