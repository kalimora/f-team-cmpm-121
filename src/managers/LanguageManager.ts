// src/managers/LanguageManager.ts
import en from "../../languages/en.json" assert { type: "json" };
import es from "../../languages/es.json" assert { type: "json" };
import ar from "../../languages/ar.json" assert { type: "json" };
import zh from "../../languages/zh.json" assert { type: "json" };

type Language = "en" | "es" | "ar" | "zh";

class LanguageManager {
  private static instance: LanguageManager;
  private currentLanguage: Language = "en";
  private translations: Record<string, string> = en;

  private constructor() {}

  public static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  public setLanguage(language: Language): void {
    this.currentLanguage = language;
    switch (language) {
      case "es":
        this.translations = es;
        break;
      case "ar":
        this.translations = ar;
        break;
      case "zh":
        this.translations = zh;
        break;
      default:
        this.translations = en;
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  public t(key: string): string {
    return this.translations[key] || key;
  }
}

export default LanguageManager;
