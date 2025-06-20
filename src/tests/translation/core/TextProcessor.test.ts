const { expect } = require('chai');
import { TextProcessor } from '../../../translation/core/TextProcessor';

describe('TextProcessor', () => {
  let processor: TextProcessor;

  beforeEach(() => {
    processor = new TextProcessor();
  });

  describe('convertToSpaces', () => {
    it('should convert CONSTANT_CASE to lowercase with spaces', () => {
      expect(processor.convertToSpaces('USER_NAME')).to.equal('user name');
      expect(processor.convertToSpaces('API_ENDPOINT_URL')).to.equal('api endpoint url');
      expect(processor.convertToSpaces('S3_UPLOAD_BUCKET')).to.equal('s3 upload bucket');
    });

    it('should convert snake_case to spaces', () => {
      expect(processor.convertToSpaces('user_name')).to.equal('user name');
      expect(processor.convertToSpaces('api_endpoint')).to.equal('api endpoint');
      expect(processor.convertToSpaces('get_user_data')).to.equal('get user data');
    });

    it('should convert kebab-case to spaces', () => {
      expect(processor.convertToSpaces('user-name')).to.equal('user name');
      expect(processor.convertToSpaces('api-endpoint')).to.equal('api endpoint');
      expect(processor.convertToSpaces('get-user-data')).to.equal('get user data');
    });

    it('should convert camelCase to lowercase with spaces', () => {
      expect(processor.convertToSpaces('userName')).to.equal('user name');
      expect(processor.convertToSpaces('getUserData')).to.equal('get user data');
      expect(processor.convertToSpaces('apiEndpointUrl')).to.equal('api endpoint url');
    });

    it('should convert PascalCase to lowercase with spaces', () => {
      expect(processor.convertToSpaces('UserName')).to.equal('user name');
      expect(processor.convertToSpaces('GetUserData')).to.equal('get user data');
      expect(processor.convertToSpaces('ApiEndpointUrl')).to.equal('api endpoint url');
    });

    it('should handle consecutive uppercase letters', () => {
      expect(processor.convertToSpaces('XMLHttpRequest')).to.equal('xml http request');
      expect(processor.convertToSpaces('HTMLElement')).to.equal('html element');
      expect(processor.convertToSpaces('URLParser')).to.equal('url parser');
    });

    it('should return unchanged text for unrecognized patterns', () => {
      expect(processor.convertToSpaces('hello')).to.equal('hello');
      expect(processor.convertToSpaces('123')).to.equal('123');
      expect(processor.convertToSpaces('hello-world_test')).to.equal('hello-world_test');
    });
  });

  describe('splitWords', () => {
    it('should split CONSTANT_CASE', () => {
      expect(processor.splitWords('USER_NAME')).to.deep.equal(['USER', 'NAME']);
      expect(processor.splitWords('API_ENDPOINT_URL')).to.deep.equal(['API', 'ENDPOINT', 'URL']);
    });

    it('should split snake_case', () => {
      expect(processor.splitWords('user_name')).to.deep.equal(['user', 'name']);
      expect(processor.splitWords('api_endpoint')).to.deep.equal(['api', 'endpoint']);
    });

    it('should split kebab-case', () => {
      expect(processor.splitWords('user-name')).to.deep.equal(['user', 'name']);
      expect(processor.splitWords('api-endpoint')).to.deep.equal(['api', 'endpoint']);
    });

    it('should split camelCase and PascalCase', () => {
      expect(processor.splitWords('userName')).to.deep.equal(['user', 'Name']);
      expect(processor.splitWords('UserName')).to.deep.equal(['User', 'Name']);
      expect(processor.splitWords('getUserData')).to.deep.equal(['get', 'User', 'Data']);
    });

    it('should filter out empty words', () => {
      expect(processor.splitWords('user__name')).to.deep.equal(['user', 'name']);
      expect(processor.splitWords('user--name')).to.deep.equal(['user', 'name']);
    });

    it('should return single word for unrecognized patterns', () => {
      expect(processor.splitWords('hello')).to.deep.equal(['hello']);
      expect(processor.splitWords('123')).to.deep.equal(['123']);
    });
  });

  describe('isConvertibleCase', () => {
    it('should return true for CONSTANT_CASE', () => {
      expect(processor.isConvertibleCase('USER_NAME')).to.be.true;
      expect(processor.isConvertibleCase('API_ENDPOINT')).to.be.true;
    });

    it('should return true for snake_case', () => {
      expect(processor.isConvertibleCase('user_name')).to.be.true;
      expect(processor.isConvertibleCase('api_endpoint')).to.be.true;
    });

    it('should return true for kebab-case', () => {
      expect(processor.isConvertibleCase('user-name')).to.be.true;
      expect(processor.isConvertibleCase('api-endpoint')).to.be.true;
    });

    it('should return true for camelCase', () => {
      expect(processor.isConvertibleCase('userName')).to.be.true;
      expect(processor.isConvertibleCase('apiEndpoint')).to.be.true;
    });

    it('should return true for PascalCase', () => {
      expect(processor.isConvertibleCase('UserName')).to.be.true;
      expect(processor.isConvertibleCase('ApiEndpoint')).to.be.true;
    });

    it('should return false for unrecognized patterns', () => {
      expect(processor.isConvertibleCase('hello')).to.be.false;
      expect(processor.isConvertibleCase('123')).to.be.false;
      expect(processor.isConvertibleCase('hello-world_test')).to.be.false;
    });
  });

  describe('preprocess', () => {
    it('should preprocess convertible cases', () => {
      expect(processor.preprocess('userName')).to.equal('user name');
      expect(processor.preprocess('USER_NAME')).to.equal('user name');
      expect(processor.preprocess('user-name')).to.equal('user name');
    });

    it('should return original text for non-convertible cases', () => {
      expect(processor.preprocess('hello')).to.equal('hello');
      expect(processor.preprocess('123')).to.equal('123');
    });
  });

  describe('detectCaseType', () => {
    it('should detect CONSTANT_CASE', () => {
      expect(processor.detectCaseType('USER_NAME')).to.equal('CONSTANT_CASE');
      expect(processor.detectCaseType('API_ENDPOINT')).to.equal('CONSTANT_CASE');
    });

    it('should detect snake_case', () => {
      expect(processor.detectCaseType('user_name')).to.equal('snake_case');
      expect(processor.detectCaseType('api_endpoint')).to.equal('snake_case');
    });

    it('should detect kebab-case', () => {
      expect(processor.detectCaseType('user-name')).to.equal('kebab-case');
      expect(processor.detectCaseType('api-endpoint')).to.equal('kebab-case');
    });

    it('should detect camelCase', () => {
      expect(processor.detectCaseType('userName')).to.equal('camelCase');
      expect(processor.detectCaseType('apiEndpoint')).to.equal('camelCase');
    });

    it('should detect PascalCase', () => {
      expect(processor.detectCaseType('UserName')).to.equal('PascalCase');
      expect(processor.detectCaseType('ApiEndpoint')).to.equal('PascalCase');
    });

    it('should return unknown for unrecognized patterns', () => {
      expect(processor.detectCaseType('hello')).to.equal('unknown');
      expect(processor.detectCaseType('123')).to.equal('unknown');
    });
  });
}); 