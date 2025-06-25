// ====================================================================
// TEST ORIGINAL FAILING CASE
// ====================================================================

import { Interface } from "../core/schema/mode/interfaces/Interface";

// more complex nested object
const MethodSchema = Interface({
  // Base properties that conditionals reference
  fields: "string[]?",
  email: "email?",
  tags: "string[]?",
  profile: {
    bio: "string?",
    avatar: "url?",
    preferences: "string[]?",
    deepNested: {
      deep: {
        deeper: {
          deepest: "string",
          moreNested: {
            level1: {
              level2: {
                level3: {
                  level4: {
                    level5: {
                      level6: {
                        level7: {
                          level8: {
                            level9: {
                              level10: {
                                level11: {
                                  level12: {
                                    level13: {
                                      level14: {
                                        level15: {
                                          level16: {
                                            level17: {
                                              level18: {
                                                level19: {
                                                  level20: {
                                                    value: "string[]",
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Conditional fields - using proper conditional syntax
  hasFields: "when fields.$exists() *? boolean : =false",

  emailRequired: "when email.$exists() *? string : string?",

  tagsCount: "when tags.$exists() *? int : =0",

  bioLength: "when profile.bio.$exists() *? int : =0",

  hasAvatar: "when profile.avatar.$exists() *? boolean : =false",

  prefCount: "when profile.preferences.$exists() *? int : =0",
});

const result = MethodSchema.safeParse({
  tags: ["tag1", "tag2"],
  profile: {
    bio: "Hello world",
    avatar: "https://example.com/avatar.jpg",
    preferences: ["pref1", "pref2"],
    deepNested: {
      deep: {
        deeper: {
          deepest: "Hello world",
          moreNested: {
            level1: {
              level2: {
                level3: {
                  level4: {
                    level5: {
                      level6: {
                        level7: {
                          level8: {
                            level9: {
                              level10: {
                                level11: {
                                  level12: {
                                    level13: {
                                      level14: {
                                        level15: {
                                          level16: {
                                            level17: {
                                              level18: {
                                                level19: {
                                                  level20: {
                                                    value:
                                                      "bingo!!! You found me ! 😎🤣😂 What a journey! 🏆 My name's deepest nesting property. You deserve a cookie! 🍪😛😜😝🤣😂",
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  bioLength: 12,
  hasAvatar: true,
  prefCount: 2,
  hasFields: true,
  emailRequired: "test@example.com",
  tagsCount: 2,
  email: "test@example.com",
  fields: ["field1", "field2"],
});

if (result.success) {
  console.log("✅ Result:", result.data);
} else {
  console.log("👹 To fix, just change the typeof 'value' property in level20 from 'string[]' to 'string'");
  console.log("❌ Errors:", result.errors);
}
