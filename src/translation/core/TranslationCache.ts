export class TranslationCache {
  private static instance: TranslationCache;
  private cache: Map<string, string> = new Map();
  private requestCount = 0;

  private constructor() {}

  /**
   * Singleton 인스턴스 반환
   */
  public static getInstance(): TranslationCache {
    if (!TranslationCache.instance) {
      TranslationCache.instance = new TranslationCache();
    }
    return TranslationCache.instance;
  }

  /**
   * 캐시에서 번역 결과 조회
   */
  public get(key: string): string | undefined {
    return this.cache.get(key);
  }

  /**
   * 캐시에 번역 결과 저장
   */
  public set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  /**
   * 캐시에 해당 키가 있는지 확인
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 캐시 전체 초기화
   */
  public clear(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    this.requestCount = 0;
    console.log(`Cache cleared! Removed ${cacheSize} entries.`);
  }

  /**
   * 캐시 크기 반환
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * 요청 횟수 증가
   */
  public incrementRequestCount(): void {
    this.requestCount++;
  }

  /**
   * 요청 횟수 반환
   */
  public getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * 캐시 상태 로깅 (개발용)
   */
  public logStatus(): void {
    console.log(
      `Cache entries: ${this.cache.size}, Requests: ${this.requestCount}`
    );
    if (this.cache.size > 0) {
      this.cache.forEach((value, key) => {
        console.log(`"${key}" → "${value}"`);
      });
    }
  }

  /**
   * 테스트용 인스턴스 리셋
   */
  public static resetInstance(): void {
    if (TranslationCache.instance) {
      TranslationCache.instance.clear();
      TranslationCache.instance = undefined as any;
    }
  }
} 