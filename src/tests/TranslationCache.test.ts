import { TranslationCache } from '../translation/core/TranslationCache';

describe('TranslationCache', () => {
  let cache: TranslationCache;

  beforeEach(() => {
    // 각 테스트 전에 인스턴스를 리셋하여 캐시를 깨끗하게 만듭니다
    TranslationCache.resetInstance();
    cache = TranslationCache.getInstance();
  });

  afterEach(() => {
    TranslationCache.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('항상 동일한 인스턴스를 반환한다', () => {
      const cache1 = TranslationCache.getInstance();
      const cache2 = TranslationCache.getInstance();
      expect(cache1).toBe(cache2);
    });
  });

  describe('Cache Operations', () => {
    it('캐시에 값을 저장하고 조회할 수 있다', () => {
      cache.set('hello', '안녕');
      expect(cache.get('hello')).toBe('안녕');
    });

    it('존재하지 않는 키는 undefined를 반환한다', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('키 존재 여부를 확인할 수 있다', () => {
      cache.set('test', '테스트');
      expect(cache.has('test')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('캐시 크기를 확인할 수 있다', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    it('캐시를 초기화할 수 있다', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });

    it('동일한 키에 다른 값을 저장하면 덮어쓴다', () => {
      cache.set('key', 'value1');
      expect(cache.get('key')).toBe('value1');
      
      cache.set('key', 'value2');
      expect(cache.get('key')).toBe('value2');
      expect(cache.size()).toBe(1);
    });
  });

  describe('Request Counter', () => {
    it('요청 횟수를 추적한다', () => {
      expect(cache.getRequestCount()).toBe(0);
      
      cache.incrementRequestCount();
      expect(cache.getRequestCount()).toBe(1);
      
      cache.incrementRequestCount();
      expect(cache.getRequestCount()).toBe(2);
    });

    it('캐시 초기화 시 요청 횟수도 초기화된다', () => {
      cache.incrementRequestCount();
      cache.incrementRequestCount();
      expect(cache.getRequestCount()).toBe(2);
      
      cache.clear();
      expect(cache.getRequestCount()).toBe(0);
    });
  });

  describe('Cache Status', () => {
    it('캐시 상태를 반환한다', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.incrementRequestCount();
      cache.incrementRequestCount();
      cache.incrementRequestCount();

      const status = {
        size: cache.size(),
        requestCount: cache.getRequestCount()
      };

      expect(status.size).toBe(2);
      expect(status.requestCount).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열 키도 저장할 수 있다', () => {
      cache.set('', 'empty key');
      expect(cache.get('')).toBe('empty key');
      expect(cache.has('')).toBe(true);
    });

    it('null이나 undefined 값도 저장할 수 있다', () => {
      cache.set('null', null as any);
      cache.set('undefined', undefined as any);
      
      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
      expect(cache.has('null')).toBe(true);
      expect(cache.has('undefined')).toBe(true);
    });

    it('특수 문자가 포함된 키도 처리할 수 있다', () => {
      const specialKey = 'key with spaces and 특수문자!@#$%';
      cache.set(specialKey, 'special value');
      expect(cache.get(specialKey)).toBe('special value');
    });
  });
}); 