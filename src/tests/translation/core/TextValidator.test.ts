const { expect } = require('chai');
import { TextValidator } from '../../../translation/core/TextValidator';

describe('TextValidator', () => {
  let validator: TextValidator;

  beforeEach(() => {
    validator = new TextValidator();
  });

  describe('isTranslatable', () => {
    it('should return false for empty or whitespace-only strings', () => {
      expect(validator.isTranslatable('')).to.be.false;
      expect(validator.isTranslatable('   ')).to.be.false;
      expect(validator.isTranslatable('\t\n')).to.be.false;
    });

    it('should return false for numeric values', () => {
      expect(validator.isTranslatable('123')).to.be.false;
      expect(validator.isTranslatable('12.34')).to.be.false;
      expect(validator.isTranslatable('-56')).to.be.false;
      expect(validator.isTranslatable('-78.90')).to.be.false;
    });

    it('should return false for symbols only', () => {
      expect(validator.isTranslatable('!@#$')).to.be.false;
      expect(validator.isTranslatable('+++')).to.be.false;
      expect(validator.isTranslatable('***')).to.be.false;
    });

    it('should return false for short text (less than 3 characters)', () => {
      expect(validator.isTranslatable('a')).to.be.false;
      expect(validator.isTranslatable('ab')).to.be.false;
    });

    it('should return false for text containing Korean characters', () => {
      expect(validator.isTranslatable('hello 안녕')).to.be.false;
      expect(validator.isTranslatable('한글 text')).to.be.false;
    });

    it('should return false for file extensions', () => {
      expect(validator.isTranslatable('.js')).to.be.false;
      expect(validator.isTranslatable('.txt')).to.be.false;
      expect(validator.isTranslatable('.json')).to.be.false;
    });

    it('should return false for color codes', () => {
      expect(validator.isTranslatable('#ffffff')).to.be.false;
      expect(validator.isTranslatable('#123')).to.be.false;
      expect(validator.isTranslatable('rgb(255,255,255)')).to.be.false;
      expect(validator.isTranslatable('rgba(255,255,255,0.5)')).to.be.false;
    });

    it('should return false for programming keywords', () => {
      expect(validator.isTranslatable('var')).to.be.false;
      expect(validator.isTranslatable('const')).to.be.false;
      expect(validator.isTranslatable('function')).to.be.false;
      expect(validator.isTranslatable('null')).to.be.false;
      expect(validator.isTranslatable('undefined')).to.be.false;
    });

    it('should return false for URLs and domains', () => {
      expect(validator.isTranslatable('https://google.com')).to.be.false;
      expect(validator.isTranslatable('www.example.com')).to.be.false;
      expect(validator.isTranslatable('192.168.1.1')).to.be.false;
      expect(validator.isTranslatable('localhost:3000')).to.be.false;
    });

    it('should return false for very long text (over 100 characters)', () => {
      const longText = 'a'.repeat(101);
      expect(validator.isTranslatable(longText)).to.be.false;
    });

    it('should return false for untranslatable acronyms', () => {
      expect(validator.isTranslatable('HTML')).to.be.false;
      expect(validator.isTranslatable('CSS')).to.be.false;
      expect(validator.isTranslatable('JS')).to.be.false;
    });

    it('should return true for translatable acronyms', () => {
      expect(validator.isTranslatable('API')).to.be.true;
      expect(validator.isTranslatable('URL')).to.be.true;
      expect(validator.isTranslatable('AWS')).to.be.true;
    });

    it('should return true for valid English words', () => {
      expect(validator.isTranslatable('hello')).to.be.true;
      expect(validator.isTranslatable('world')).to.be.true;
      expect(validator.isTranslatable('translate')).to.be.true;
    });

    it('should return true for camelCase variables', () => {
      expect(validator.isTranslatable('userName')).to.be.true;
      expect(validator.isTranslatable('getUserData')).to.be.true;
      expect(validator.isTranslatable('apiEndpoint')).to.be.true;
    });

    it('should return true for PascalCase', () => {
      expect(validator.isTranslatable('UserName')).to.be.true;
      expect(validator.isTranslatable('ApiService')).to.be.true;
    });

    it('should return true for snake_case', () => {
      expect(validator.isTranslatable('user_name')).to.be.true;
      expect(validator.isTranslatable('api_endpoint')).to.be.true;
    });

    it('should return true for CONSTANT_CASE', () => {
      expect(validator.isTranslatable('USER_NAME')).to.be.true;
      expect(validator.isTranslatable('API_ENDPOINT')).to.be.true;
    });

    it('should return true for kebab-case', () => {
      expect(validator.isTranslatable('user-name')).to.be.true;
      expect(validator.isTranslatable('api-endpoint')).to.be.true;
    });
  });

  describe('extractEnglishFromComment', () => {
    it('should extract clean text from single-line comments', () => {
      expect(validator.extractEnglishFromComment('// This is a comment')).to.equal('This is a comment');
      expect(validator.extractEnglishFromComment('//   Spaced comment   ')).to.equal('Spaced comment');
    });

    it('should extract clean text from multi-line comments', () => {
      expect(validator.extractEnglishFromComment('/* This is a comment */')).to.equal('This is a comment');
      expect(validator.extractEnglishFromComment('/** JSDoc comment */')).to.equal('JSDoc comment');
      expect(validator.extractEnglishFromComment('* Line in multi-line comment')).to.equal('Line in multi-line comment');
    });

    it('should return empty string for non-English comments', () => {
      expect(validator.extractEnglishFromComment('// 한글 주석')).to.equal('');
      expect(validator.extractEnglishFromComment('/* 123456 */')).to.equal('');
      expect(validator.extractEnglishFromComment('// @#$%^&')).to.equal('');
    });

    it('should handle punctuation in English comments', () => {
      expect(validator.extractEnglishFromComment('// Hello, world!')).to.equal('Hello, world!');
      expect(validator.extractEnglishFromComment('/* TODO: Fix this bug. */')).to.equal('TODO: Fix this bug.');
    });
  });
}); 