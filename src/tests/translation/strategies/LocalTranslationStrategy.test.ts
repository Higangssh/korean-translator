const { expect } = require('chai');
const sinon = require('sinon');
import { LocalTranslationStrategy } from '../../../translation/strategies/LocalTranslationStrategy';

describe('LocalTranslationStrategy', () => {
  let strategy: LocalTranslationStrategy;

  beforeEach(() => {
    strategy = new LocalTranslationStrategy();
  });

  describe('Basic Properties', () => {
    it('should have correct name and priority', () => {
      expect(strategy.name).to.equal('Local Dictionary');
      expect(strategy.priority).to.equal(1);
    });

    it('should be able to handle any text', () => {
      expect(strategy.canHandle('any text')).to.be.true;
      expect(strategy.canHandle('')).to.be.true;
      expect(strategy.canHandle('123')).to.be.true;
    });
  });

  describe('Dictionary Translation', () => {
    it('should translate basic programming terms', async () => {
      expect(await strategy.translate('function')).to.equal('함수');
      expect(await strategy.translate('variable')).to.equal('변수');
      expect(await strategy.translate('class')).to.equal('클래스');
      expect(await strategy.translate('object')).to.equal('객체');
    });

    it('should translate user-related terms', async () => {
      expect(await strategy.translate('user')).to.equal('사용자');
      expect(await strategy.translate('admin')).to.equal('관리자');
      expect(await strategy.translate('account')).to.equal('계정');
    });

    it('should translate data-related terms', async () => {
      expect(await strategy.translate('data')).to.equal('데이터');
      expect(await strategy.translate('name')).to.equal('이름');
      expect(await strategy.translate('value')).to.equal('값');
    });

    it('should be case-insensitive', async () => {
      expect(await strategy.translate('USER')).to.equal('사용자');
      expect(await strategy.translate('User')).to.equal('사용자');
      expect(await strategy.translate('uSeR')).to.equal('사용자');
    });

    it('should return original text for unknown words', async () => {
      expect(await strategy.translate('unknownword')).to.equal('unknownword');
      expect(await strategy.translate('randomtext')).to.equal('randomtext');
    });
  });

  describe('Compound Word Translation', () => {
    it('should translate camelCase variables', async () => {
      expect(await strategy.translate('userName')).to.equal('사용자 이름');
      expect(await strategy.translate('userData')).to.equal('사용자 데이터');
      expect(await strategy.translate('userAccount')).to.equal('사용자 계정');
    });

    it('should translate snake_case variables', async () => {
      expect(await strategy.translate('user_name')).to.equal('사용자 이름');
      expect(await strategy.translate('user_data')).to.equal('사용자 데이터');
      expect(await strategy.translate('user_account')).to.equal('사용자 계정');
    });

    it('should translate CONSTANT_CASE variables', async () => {
      expect(await strategy.translate('USER_NAME')).to.equal('사용자 이름');
      expect(await strategy.translate('USER_DATA')).to.equal('사용자 데이터');
    });

    it('should translate kebab-case variables', async () => {
      expect(await strategy.translate('user-name')).to.equal('사용자 이름');
      expect(await strategy.translate('user-data')).to.equal('사용자 데이터');
    });

    it('should handle partial translations', async () => {
      expect(await strategy.translate('userUnknown')).to.equal('사용자 Unknown');
      expect(await strategy.translate('unknownUser')).to.equal('unknownUser 사용자');
    });

    it('should not translate if no words are in dictionary', async () => {
      expect(await strategy.translate('unknownUnknown')).to.equal('unknownUnknown');
      expect(await strategy.translate('randomVariable')).to.equal('randomVariable');
    });
  });

  describe('Dictionary Management', () => {
    it('should add new translations', () => {
      strategy.addTranslation('test', '테스트');
      expect(strategy.hasTranslation('test')).to.be.true;
    });

    it('should use newly added translations', async () => {
      strategy.addTranslation('custom', '커스텀');
      expect(await strategy.translate('custom')).to.equal('커스텀');
    });

    it('should remove translations', () => {
      strategy.addTranslation('temp', '임시');
      expect(strategy.hasTranslation('temp')).to.be.true;
      
      strategy.removeTranslation('temp');
      expect(strategy.hasTranslation('temp')).to.be.false;
    });

    it('should return dictionary size', () => {
      const initialSize = strategy.getDictionarySize();
      strategy.addTranslation('new1', '새로운1');
      strategy.addTranslation('new2', '새로운2');
      expect(strategy.getDictionarySize()).to.equal(initialSize + 2);
    });

    it('should check if translation exists', () => {
      expect(strategy.hasTranslation('user')).to.be.true;
      expect(strategy.hasTranslation('nonexistent')).to.be.false;
    });
  });

  describe('Logging', () => {
    it('should log translation attempts', async () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      await strategy.translate('user');
      await strategy.translate('unknownword');
      
      expect(consoleSpy.called).to.be.true;
      consoleSpy.restore();
    });
  });
}); 