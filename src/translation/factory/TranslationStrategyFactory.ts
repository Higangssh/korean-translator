import { ITranslationStrategy } from '../strategies/ITranslationStrategy';
import { LocalTranslationStrategy } from '../strategies/LocalTranslationStrategy';
import { MyMemoryTranslationStrategy } from '../strategies/MyMemoryTranslationStrategy';
import { LibreTranslationStrategy } from '../strategies/LibreTranslationStrategy';

export type StrategyType = 'local' | 'mymemory' | 'libre';

export class TranslationStrategyFactory {
  private static instance: TranslationStrategyFactory;
  private strategies: Map<StrategyType, ITranslationStrategy> = new Map();

  private constructor() {
    this.initializeStrategies();
  }

  /**
   * Singleton 인스턴스 반환
   */
  public static getInstance(): TranslationStrategyFactory {
    if (!TranslationStrategyFactory.instance) {
      TranslationStrategyFactory.instance = new TranslationStrategyFactory();
    }
    return TranslationStrategyFactory.instance;
  }

  /**
   * 전략들 초기화
   */
  private initializeStrategies(): void {
    this.strategies.set('local', new LocalTranslationStrategy());
    this.strategies.set('mymemory', new MyMemoryTranslationStrategy());
    this.strategies.set('libre', new LibreTranslationStrategy());
  }

  /**
   * 특정 전략 반환
   */
  public getStrategy(type: StrategyType): ITranslationStrategy | undefined {
    return this.strategies.get(type);
  }

  /**
   * 모든 전략 반환 (우선순위순으로 정렬)
   */
  public getAllStrategies(): ITranslationStrategy[] {
    return Array.from(this.strategies.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * 사용 가능한 전략들만 반환 (우선순위순으로 정렬)
   */
  public getAvailableStrategies(text: string): ITranslationStrategy[] {
    return this.getAllStrategies().filter(strategy => strategy.canHandle(text));
  }

  /**
   * 전략 등록 (새로운 전략 추가용)
   */
  public registerStrategy(type: StrategyType, strategy: ITranslationStrategy): void {
    this.strategies.set(type, strategy);
  }

  /**
   * 전략 제거
   */
  public removeStrategy(type: StrategyType): void {
    this.strategies.delete(type);
  }

  /**
   * 등록된 전략 개수
   */
  public getStrategyCount(): number {
    return this.strategies.size;
  }

  /**
   * 전략 타입들 반환
   */
  public getStrategyTypes(): StrategyType[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 테스트용 인스턴스 리셋
   */
  public static resetInstance(): void {
    TranslationStrategyFactory.instance = undefined as any;
  }
} 