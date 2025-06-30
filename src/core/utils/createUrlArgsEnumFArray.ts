export const createUrlArgsEnumFromArray = <T extends readonly string[]>(arr: T) => {
  const enumObj: Record<string, string> = {};
  arr.forEach((item) => {
    const key = item.split(".")[1];
    enumObj[key] = item;
  });
  return enumObj as {
    [K in T[number] as K extends `${string}.${infer U}` ? U : never]: K;
  };
};

