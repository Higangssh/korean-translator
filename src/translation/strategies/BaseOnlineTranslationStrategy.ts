import { ITranslationStrategy } from './ITranslationStrategy';

export abstract class BaseOnlineTranslationStrategy implements ITranslationStrategy {
  public abstract readonly name: string;
  public abstract readonly priority: number;

  protected requestCount = 0;
  protected lastRequestTime = 0;
  protected maxRequestsPerDay = 100;
  protected readonly requestDelay = 1000; // 1초

  public canHandle(text: string): boolean {
    return this.requestCount < this.maxRequestsPerDay;
  }

  public abstract translate(text: string): Promise<string>;

  /**
   * 요청 제한 처리 (1초에 1회)
   */
  protected async handleRateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRequestTime < this.requestDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.requestDelay));
    }
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * 요청 횟수 반환
   */
  public getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * 요청 횟수 리셋
   */
  public resetRequestCount(): void {
    this.requestCount = 0;
  }

  /**
   * 번역 결과가 유효한지 검증
   */
  protected isValidTranslation(original: string, translated: string): boolean {
    if (!translated || translated === original) {
      return false;
    }

    // 너무 짧거나 길지 않은지 확인
    if (translated.length < 1 || translated.length > original.length * 10) {
      return false;
    }

    return true;
  }
} 