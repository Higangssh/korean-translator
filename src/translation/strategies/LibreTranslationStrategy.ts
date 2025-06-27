import axios from "axios";
import { BaseOnlineTranslationStrategy } from "./BaseOnlineTranslationStrategy";

export class LibreTranslationStrategy extends BaseOnlineTranslationStrategy {
  public readonly name = "LibreTranslate";
  public readonly priority = 3;

  public async translate(text: string): Promise<string> {
    try {
      await this.handleRateLimit();

      const response = await axios.post(
        "https://libretranslate.de/translate",
        {
          q: text,
          source: "en",
          target: "ko",
          format: "text",
        },
        {
          timeout: 3000,
          headers: { "Content-Type": "application/json" },
        }
      );

      const translatedText = response.data.translatedText;

      if (this.isValidTranslation(text, translatedText)) {
        console.log(`LibreTranslate success: "${text}" → "${translatedText}"`);
        return translatedText;
      }

      console.log(`LibreTranslate failed for: "${text}"`);
      return text;
    } catch (error: any) {
      console.log(`LibreTranslate error for "${text}":`, error.message);
      return text;
    }
  }

  public canHandle(text: string): boolean {
    return super.canHandle(text) && text.length <= 1000;
  }
}
