import { Interface } from 'reliant-type';

export const Mod = Interface({
  prdt: {
    id: "uuid",
    val: {
      name: "string",
      id: "uuid",
      createdAt: "date",
      updatedAt: "date",
      deletedAt: "date",
      deleted: "boolean",
      isActive: "boolean",
      status: "active",
      status: "inactive",
    },
  },
});