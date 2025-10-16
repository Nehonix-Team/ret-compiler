import { Interface } from 'reliant-type';

export const AddressSchema = Interface({
  street: "string",
  city: "string",
  zipCode: "string(/^\d{5}$/)",
});


export const ContactSchema = Interface({
  email: "email",
  phone: "phone?",
});


export const UserSchema = Interface({
  id: "uuid",
  username: "string",
  contact: "Contact",
  address: "Address",
  role: "admin|user|guest",
  adminLevel: "when role === admin *? number(1,10) : any?",
});


export { User };