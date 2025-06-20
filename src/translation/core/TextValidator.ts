export class TextValidator {
  private readonly skipWords = [
    // CSS 단위
    "px", "em", "rem", "vh", "vw", "%", "pt", "pc", "in", "cm", "mm",
    // 기본 키워드
    "var", "let", "const", "if", "else", "for", "while", "do", "switch", "case",
    "true", "false", "null", "undefined", "void", "typeof", "instanceof",
    // HTML 태그
    "div", "span", "img", "src", "alt", "href", "id", "class", "style",
    "input", "button", "form", "table", "tr", "td", "th", "ul", "li", "ol",
    // 파일 형식
    "css", "js", "html", "xml", "json", "svg", "png", "jpg", "jpeg", "gif",
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar",
    // 네트워크/프로토콜
    "http", "https", "ftp", "ssh", "tcp", "udp", "ip", "dns", "cdn",
    "www", "com", "org", "net", "edu", "gov", "io", "dev", "app",
    // 시스템/환경
    "localhost", "admin", "root", "user", "temp", "tmp", "bin", "lib",
    "src", "dist", "build", "node", "npm", "yarn", "git", "svn",
  ];

  private readonly translatableAcronyms = ['API', 'URL', 'AWS', 'GCP', 'SQL', 'JWT', 'UUID'];

  /**
   * 번역이 필요한 텍스트인지 판단
   */
  public isTranslatable(text: string): boolean {
    // 빈 문자열이나 공백만 있는 경우
    if (!text || text.trim().length === 0) {
      return false;
    }

    // 숫자만 있는 경우 (정수, 소수, 음수 포함)
    if (this.isNumericOnly(text)) {
      return false;
    }

    // 단순 기호나 특수문자만 있는 경우
    if (this.isSymbolOnly(text)) {
      return false;
    }

    // 너무 짧은 텍스트 (1-2글자)
    if (text.trim().length < 3) {
      return false;
    }

    // 이미 한글이 포함된 경우
    if (this.containsKorean(text)) {
      return false;
    }

    // URL, 도메인, IP 주소 등을 더 엄격하게 필터링
    if (this.isUrlOrDomain(text)) {
      return false;
    }

    // 파일 확장자인 경우
    if (this.isFileExtension(text)) {
      return false;
    }

    // 색상 코드인 경우
    if (this.isColorCode(text)) {
      return false;
    }

    // 번역이 의미없는 프로그래밍 키워드들
    if (this.isSkipWord(text)) {
      return false;
    }

    // 다양한 명명 케이스 패턴 확인
    if (!this.isValidNamingCase(text)) {
      return false;
    }

    // 너무 긴 텍스트 (100자 이상)
    if (text.length > 100) {
      return false;
    }

    // 단순한 약어나 축약어는 번역하지 않음
    if (this.isUntranslatableAcronym(text)) {
      return false;
    }

    return true;
  }

  /**
   * 숫자만 있는지 확인
   */
  private isNumericOnly(text: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(text.trim());
  }

  /**
   * 기호나 특수문자만 있는지 확인
   */
  private isSymbolOnly(text: string): boolean {
    return /^[^\w\s]+$/.test(text);
  }

  /**
   * 한글이 포함되어 있는지 확인
   */
  private containsKorean(text: string): boolean {
    return /[가-힣]/.test(text);
  }

  /**
   * 파일 확장자인지 확인
   */
  private isFileExtension(text: string): boolean {
    return /^\.[a-z0-9]+$/i.test(text);
  }

  /**
   * 색상 코드인지 확인
   */
  private isColorCode(text: string): boolean {
    return /^#[0-9a-fA-F]{3,8}$|^rgb\(|^rgba\(|^hsl\(/.test(text);
  }

  /**
   * 스킵할 단어인지 확인
   */
  private isSkipWord(text: string): boolean {
    return this.skipWords.includes(text.toLowerCase());
  }

  /**
   * 유효한 명명 케이스인지 확인
   */
  private isValidNamingCase(text: string): boolean {
    const isConstantCase = /^[A-Z][A-Z0-9_]*$/.test(text);
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(text);
    const isSnakeCase = /^[a-z]+(_[a-z]+)*$/.test(text);
    const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(text);
    const isKebabCase = /^[a-z]+(-[a-z]+)*$/.test(text);

    // 영어로 시작하거나 명명 케이스 패턴 중 하나라면 번역 대상
    return /^[a-zA-Z]/.test(text) || isConstantCase || isSnakeCase || isKebabCase;
  }

  /**
   * 번역할 수 없는 약어인지 확인
   */
  private isUntranslatableAcronym(text: string): boolean {
    // 모두 대문자이고 짧은 경우
    if (/^[A-Z]{2,5}$/.test(text)) {
      return !this.isTranslatableAcronym(text);
    }
    return false;
  }

  /**
   * 번역 가능한 약어인지 판별
   */
  private isTranslatableAcronym(text: string): boolean {
    return this.translatableAcronyms.includes(text.toUpperCase());
  }

  /**
   * URL, 도메인, IP 주소 등을 판별
   */
  private isUrlOrDomain(text: string): boolean {
    // 기본 URL 패턴
    if (/^https?:\/\/|^ftp:\/\/|^www\./i.test(text)) {
      return true;
    }

    // 도메인명 패턴
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
      return true;
    }

    // IP 주소 패턴
    if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(text)) {
      return true;
    }

    // 포트 번호가 포함된 도메인
    if (/^[a-zA-Z0-9.-]+:\d+/.test(text)) {
      return true;
    }

    // 경로나 쿼리 파라미터가 포함된 경우
    if (/[\/\?&#=]/.test(text) && text.includes('.')) {
      return true;
    }

    return false;
  }

  /**
   * 주석에서 영어 텍스트 추출
   */
  public extractEnglishFromComment(comment: string): string {
    const cleanComment = comment
      .replace(/^\/\/\s*/, "")
      .replace(/^\/\*\*?\s*/, "")
      .replace(/\*\/\s*$/, "")
      .replace(/^\*\s*/, "")
      .trim();

    const englishPattern = /^[a-zA-Z\s.,!?;:'"()-]+$/;
    return englishPattern.test(cleanComment) ? cleanComment : "";
  }
} 