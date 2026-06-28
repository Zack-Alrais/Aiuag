import ar from "./ar.json";
import en from "./en.json";

const dictionaries = { ar, en } as const;

type Dictionary = typeof ar;

export function getTranslations(lang: string) {
  const dict = dictionaries[lang as keyof typeof dictionaries] ?? dictionaries.ar;

  function t(key: string): string {
    const keys = key.split(".");
    let value: unknown = dict;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  }

  return { t, dict };
}
