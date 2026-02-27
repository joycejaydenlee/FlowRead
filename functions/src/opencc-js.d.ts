declare module "opencc-js" {
  type Locale = "cn" | "hk" | "tw" | "twp" | "jp";
  interface ConverterOptions {
    from: Locale;
    to: Locale;
  }
  export function Converter(options: ConverterOptions): (text: string) => string;
}
