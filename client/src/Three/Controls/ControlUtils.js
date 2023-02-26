
export function parseControllerId(str) {
    try {
      // Xbox One Wired Controller (STANDARD GAMEPAD Vendor: 045e Product: 02ea)
      var normalRegex = /Vendor: ([a-f0-9]{1,4}) Product: ([a-f0-9]{1,4})/;
  
      // 0810-0001-Twin USB Joystick
      var shorterRegex = /^([a-f0-9]{1,4})-([a-f0-9]{1,4})/;
  
      var match = str.match(normalRegex);
  
      if (!match) {
        match = str.match(shorterRegex);
      }
  
      var [_ignore, vendorCode, productCode] = match || ([]); //eslint-disable-line
  
      let knownController = KNOWN_CONTROLLERS.find((matcher) =>
        matcher.match(str, vendorCode, productCode),
      );
  
      return {
        vendorCode,
        productCode,
        combined: vendorCode + "_" + productCode,
        knownController,
        vendor: vendorCode && knownVendors[vendorCode],
        // product: knownProducts[productCode],
      };
    } catch (e) {
      return { vendorCode: "?", productCode: "?", combined: "?" };
    }
  }
  