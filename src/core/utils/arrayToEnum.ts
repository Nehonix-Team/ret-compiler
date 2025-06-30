// Even better version - simpler and more reliable
export const createTypeSafeEnum = <T extends readonly string[]>(arr: T) => {
  const enumObj = {} as any;

  arr.forEach((item) => {
    // Create uppercase key
    const key = item
      .toUpperCase()
      .replace(/[.\-\s]/g, "_")
      .replace(/[^A-Z0-9_]/g, "");

    enumObj[key] = item;
  });

  // Simple but effective type assertion
  return enumObj as {
    readonly [K in T[number] as K extends string
      ? Uppercase<
          K extends `${string}.${infer Rest}` ? Rest : K
        > extends infer UpperKey
        ? UpperKey extends string
          ? UpperKey extends `${string}_${string}`
            ? UpperKey
            : UpperKey extends Uppercase<string>
              ? UpperKey
              : never
          : never
        : never
      : never]: K;
  } & {
    // Add index signature to prevent access to non-existent keys
    [key: string]: T[number] | undefined;
  };
};

// Most practical version - keeps it simple but effective
export const createEnum = <T extends readonly string[]>(arr: T) => {
  const enumObj = {} as Record<string, T[number]>;

  arr.forEach((item) => {
    const key = item
      .toUpperCase()
      .replace(/[.\-\s]/g, "_")
      .replace(/[^A-Z0-9_]/g, "");

    enumObj[key] = item;
  });

  return enumObj as {
    readonly [K in T[number] as K extends string
      ? Uppercase<K extends `${string}.${infer U}` ? U : K> extends infer UK
        ? UK extends string
          ? UK
          : never
        : never
      : never]: K;
  };
};

// clean version with perfect type inference
export const makeEnum = <T extends readonly string[]>(arr: T) => {
  type ToUpperSnake<S extends string> = S extends `${infer A}.${infer B}`
    ? Uppercase<B> extends `${infer C}`
      ? C extends string
        ? C
        : Uppercase<S>
      : Uppercase<S>
    : Uppercase<S>;

  type EnumKeys = {
    [K in T[number]]: ToUpperSnake<K> extends string ? ToUpperSnake<K> : never;
  }[T[number]];

  const enumObj = {} as Record<EnumKeys, T[number]>;

  arr.forEach((item) => {
    const key = (
      item.includes(".")
        ? item.split(".").pop()!.toUpperCase()
        : item.toUpperCase()
    ).replace(/[^A-Z0-9]/g, "_") as EnumKeys;

    enumObj[key] = item;
  });

  return enumObj;
};

export const createEnumFromArray = createEnum;
