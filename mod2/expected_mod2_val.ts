import { Interface } from "reliant-type";

export const Mod = Interface({ // ProductSchema (don't add schema at the end just export or use like the devs declared: the given name)
    prdt: {
        id: "uuid",
        val: {
            name: "string",
          } // typeof/valueof Test
      }, // typeof/valueof Product
  });
  
// no second export 
// much cleaner and readable