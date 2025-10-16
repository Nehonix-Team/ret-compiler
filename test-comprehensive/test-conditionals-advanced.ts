import { Interface } from 'reliant-type';

export const UserPermissionsSchema = Interface({
  userId: "uuid",
  username: "string",
  role: "admin|user|moderator|guest",
  age: "number",
  isPremium: "boolean",
  adminPanel: "when role === admin *? boolean : any?",
  systemSettings: "when role === admin *? record<string,any> : any?",
  allPermissions: "when role === admin *? string[] : any?",
  moderationTools: "when role === moderator *? boolean : any?",
  bannedUsers: "when role === moderator *? string[] : any?",
  adultContent: "when age >= 18 *? boolean : any?",
  canVote: "when age >= 18 *? boolean : any?",
  drinkingAge: "when age >= 18 *? boolean : any?",
  premiumFeatures: "when isPremium === true *? string[] : any?",
  adFree: "when isPremium === true *? boolean : any?",
  prioritySupport: "when isPremium === true *? boolean : any?",
});