import { Interface } from "./src/core/schema/mode/interfaces/Interface";
 
// Test that the extension is working properly
const TestSchema = Interface({
  // This should be valid - literal union
  role: "admin|user|guest", 
     
  // This should be invalid - unknown type
  badType: "=ed", 
    
  // This should be invalid - missing *? operator
  badConditional1: "when role=admin *? =admin : =user",
 
  // This should be invalid - missing : separator
  badConditional2: "when role=admin *? =admin :=value",
 
  //multiline syntax testing   
  badConditional3: 
    "when role=admim *? =admin :when field.in(value1,value2) *? type : type?", //multiline syntax testing

  // This should be invalid - empty union values
  badUnion: "admin||guest",

  // This should be invalid - malformed regex
  badRegex: "teststring(/[unclosed/)",

  // These should be valid
  goodString: "string",
  goodConditional: "when role=admin *? =admin_access : =limited_access",
  goodArray: "string[]",
});
 