const UrlArg = [
  "url.https",
  "url.http",
  "url.web",
  "url.dev",
  "url.ftp",
] as const;

export type UrlArgType = (typeof UrlArg)[number];

export interface UrlValidationOptions {
  match: {
    protocols: string[];
    allowLocalhost: boolean;
    allowPrivateIPs: boolean;
    maxLength: number;
    requireTLD: boolean;
    allowDataUrls: boolean;
    allowIPAddresses: boolean;
  };
}

export type UrlArgsValidation = Record<UrlArgType, UrlValidationOptions>;

export type UrlArg = (typeof UrlArg)[number];

export class UrlArgs {
  private static args: UrlArgsValidation = {
    "url.https": {
      match: {
        protocols: ["https"],
        allowLocalhost: false,
        allowPrivateIPs: false,
        maxLength: 2048,
        requireTLD: true,
        allowDataUrls: false,
        allowIPAddresses: false,
      },
    },
    "url.http": {
      match: {
        protocols: ["http"],
        allowLocalhost: false,
        allowPrivateIPs: false,
        maxLength: 2048,
        requireTLD: true,
        allowDataUrls: false,
        allowIPAddresses: false,
      },
    },
    "url.web": {
      match: {
        protocols: ["http", "https"],
        allowLocalhost: false,
        allowPrivateIPs: false,
        maxLength: 2048,
        requireTLD: true,
        allowDataUrls: false,
        allowIPAddresses: false,
      },
    },
    "url.dev": {
      match: {
        protocols: ["http", "https", "ftp", "ws", "wss", "file"],
        allowLocalhost: true,
        allowPrivateIPs: true,
        maxLength: 2048,
        requireTLD: false,
        allowDataUrls: true,
        allowIPAddresses: true,
      },
    },
    "url.ftp": {
      match: {
        protocols: ["ftp"],
        allowLocalhost: false,
        allowPrivateIPs: false,
        maxLength: 2048,
        requireTLD: true,
        allowDataUrls: false,
        allowIPAddresses: false,
      },
    },
  };

  static selectArg(urlArg: UrlArgType): UrlValidationOptions {
    return this.getSpecificArg(urlArg) || this.args["url.web"];
  }

  private static getSpecificArg(str: string): UrlValidationOptions | undefined {
    return this.args[str as UrlArgType];
  }

  static isCorrectArg(str: string): {
    isValid: boolean;
    argsValue?: UrlValidationOptions;
    error?: string;
  } {
    const rgx = /^url\./;

    if (!rgx.test(str)) {
      return {
        isValid: false,
        error: "Invalid url arg. Argument must start with 'url.'",
      };
    }

    const args = this.getSpecificArg(str as UrlArgType);
    if (!args) {
      return {
        isValid: false,
        error: "Invalid url arg. Argument not found",
      };
    }
    return {
      isValid: true,
      argsValue: args,
    };
  }
}
