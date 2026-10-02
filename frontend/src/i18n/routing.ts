import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es"], // expand when multilang is needed
  defaultLocale: "es",
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
