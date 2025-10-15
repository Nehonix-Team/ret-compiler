import { Interface } from "../src";

export const settingsUpdateSchema = Interface({
  // Payment settings
  enabledPaymentMethods: "string[]?",
  
  // Withdrawal/Payout settings
  withdrawalMethod: "string?",
  withdrawalBankName: "string?",
  withdrawalAccountNumber: "string?",
  withdrawalAccountName: "string?",
  withdrawalMobileNumber: "phone?",
  withdrawalMobileProvider: "string?",
  
  // Notification settings
  notificationEmail: "email?",
  notificationPhone: "phone?",
  notifyNewOrders: "boolean?",
  notifyChatMessages: "boolean?",
  notifyLowStock: "boolean?",
  notifyWeeklyReport: "boolean?",
  
  // Store settings
  storeName: "string?",
  storeUrl: "string?",
  storeDescription: "string?",
  storeLogo: "string?",
  storeAddress: "string?",
  storeEmail: "email?",
  storePhone: "phone?",
  currency: "string?",
  language: "string?",
  timezone: "string?",
  maintenanceMode: "boolean?",
  storePublic: "boolean?",
  autoAcceptOrders: "boolean?",
  orderNotificationEmail: "email?",
  orderNotificationPhone: "phone?",
});

const data = {
  storeName: "iDevo Store",
  storeUrl: "",
  storeDescription: "This store is created in order to test the ProxiShop project...Let ProxiShop together!\n",
  storeAddress: "Abidjan",
  storeEmail: undefined,
  storePhone: "+225 0576778556",
  currency: "XOF",
  language: "fr",
  timezone: "Africa/Lagos",
  orderNotificationEmail: undefined,
  orderNotificationPhone: undefined,
}

const res = settingsUpdateSchema.safeParse(data)


console.log(res)