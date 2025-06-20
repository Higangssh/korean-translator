const { expect } = require('chai');
const sinon = require('sinon');
import { TranslationCache } from '../../../translation/core/TranslationCache';

describe('TranslationCache', () => {
  let cache: TranslationCache;

  beforeEach(() => {
    // 각 테스트 전에 인스턴스 리셋
    TranslationCache.resetInstance();
    cache = TranslationCache.getInstance();
  });

  afterEach(() => {
    TranslationCache.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const cache1 = TranslationCache.getInstance();
      const cache2 = TranslationCache.getInstance();
      expect(cache1).to.equal(cache2);
    });
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve values', () => {
      cache.set('hello', '안녕하세요');
      expect(cache.get('hello')).to.equal('안녕하세요');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).to.be.undefined;
    });

    it('should check if key exists', () => {
      cache.set('test', '테스트');
      expect(cache.has('test')).to.be.true;
      expect(cache.has('missing')).to.be.false;
    });

    it('should return correct cache size', () => {
      expect(cache.size()).to.equal(0);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).to.equal(2);
    });
  });

  describe('Cache Management', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).to.equal(2);
      
      cache.clear();
      expect(cache.size()).to.equal(0);
      expect(cache.has('key1')).to.be.false;
    });

    it('should reset request count when clearing', () => {
      cache.incrementRequestCount();
      cache.incrementRequestCount();
      expect(cache.getRequestCount()).to.equal(2);
      
      cache.clear();
      expect(cache.getRequestCount()).to.equal(0);
    });
  });

  describe('Request Count Management', () => {
    it('should increment request count', () => {
      expect(cache.getRequestCount()).to.equal(0);
      cache.incrementRequestCount();
      expect(cache.getRequestCount()).to.equal(1);
      cache.incrementRequestCount();
      expect(cache.getRequestCount()).to.equal(2);
    });
  });

  describe('Logging', () => {
    it('should log cache status without errors', () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      cache.set('test', '테스트');
      cache.incrementRequestCount();
      cache.logStatus();
      
      expect(consoleSpy.called).to.be.true;
      consoleSpy.restore();
    });
  });
}); 