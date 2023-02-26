export const KNOWN_CONTROLLERS = [
    // ms
    {
      name: "Xbox One Controller",
      match: (id, v, p) => v === "045e" && p === "02ea",
    },
    {
      name: "Xbox 360 Controller",
      match: (id, v, p) => v === "045e" && p === "028e",
    },
    {
      name: "Xbox Wireless Controller",
      match: (id, v, p) => v === "045e" && p === "02e0",
    },
  
    // nintendo
    {
      name: "Switch Pro Controller",
      match: (id, v, p) => v === "057e" && p === "2009",
    },
    {
      name: "Joy-Con L+R",
      match: (id, v, p) => v === "057e" && p === "200e",
    },
    {
      name: "Sony PS4 Dualshock",
      match: (id, v, p) => v === "054c" && p === "05c4",
    },
    {
      name: "Sony PS4 Dualshock", // ? why diff code
      match: (id, v, p) => v === "054c" && p === "09cc",
    },
  
    // sony
    {
      name: "Sony PS3 Dualshock",
      match: (id, v, p) => v === "054c" && p === "0268",
    },
  
    // google
    {
      name: "Google Stadia Controller",
      match: (id, v, p) => v === "18d1" && p === "9400",
    },
  
    // misc. less confident ones if we don't have a vendor/product match
    {
      name: "Xbox Controller",
      match: (id) => /Xbox/.test(id),
    },
  ];
  
  export function buttonValue(b) {
    return typeof b == "number" ? b : b.value;
  }
  