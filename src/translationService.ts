import axios from "axios";

export class TranslationService {
  private cache: Map<string, string> = new Map();
  private requestCount = 0;
  private lastRequestTime = 0;

  /**
   * 캐시 초기화
   */
  public clearCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    this.requestCount = 0;
    console.log(`Cache cleared! Removed ${cacheSize} entries.`);
  }

  /**
   * 캐시 상태 확인 (개발용)
   */
  public logCacheStatus(): void {
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
   * 영어 텍스트를 한국어로 번역
   * 1. 로컬 사전 → 2. MyMemory → 3. Google Translate → 4. LibreTranslate 순으로 시도
   */
  async translate(text: string): Promise<string> {
    
    // 캐시 확인
    if (this.cache.has(text)) {
      console.log(`Cache hit: "${text}" → "${this.cache.get(text)}"`);
      return this.cache.get(text)!;
    }
    
    if (!this.shouldTranslate(text)) {
      console.log(`Skipping translation for: "${text}" (not translatable)`);
      return text;
    }
    
    // 요청 제한 (1초에 1회)
    const now = Date.now();
    if (now - this.lastRequestTime < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    this.lastRequestTime = Date.now();

    try {
      // 1단계: 로컬 사전 시도
      console.log(`Trying local dictionary for: "${text}"`);
      const localTranslation = this.translateLocally(text);

      if (localTranslation !== text) {
        const hasUntranslatedWords = localTranslation.match(/[a-zA-Z]{4,}/g);

        if (!hasUntranslatedWords) {
          console.log(
            `Local translation success: "${text}" → "${localTranslation}"`
          );
          this.cache.set(text, localTranslation);
          return localTranslation;
        } else {
          console.log(
            `Partial translation: "${text}" → "${localTranslation}", trying online...`
          );
        }
      } else {
        console.log(`Local translation failed for: "${text}"`);
      }

      // 다양한 케이스를 띄어쓰기로 변환
      const spacedText = this.convertToSpaces(text);
      const textToTranslate = spacedText !== text ? spacedText : text;

      if (spacedText !== text) {
        console.log(
          `Converting "${text}" → "${spacedText}" for better online translation`
        );
      }

      // 2단계: MyMemory
      console.log(`Trying MyMemory for: "${textToTranslate}"`);
      const memoryResult = await this.translateWithMyMemory(textToTranslate);
      if (memoryResult !== textToTranslate) {
        console.log(
          `MyMemory success: "${textToTranslate}" → "${memoryResult}"`
        );
        this.cache.set(text, memoryResult);
        return memoryResult;
      }
      console.log(`MyMemory failed, trying next service...`);

      // 3단계: 구글 번역
      console.log(`Trying Google Translate for: "${textToTranslate}"`);
      const googleResult = await this.translateWithGoogleScraping(
        textToTranslate
      );
      if (googleResult !== textToTranslate) {
        console.log(
          `Google translation success: "${textToTranslate}" → "${googleResult}"`
        );
        this.cache.set(text, googleResult);
        return googleResult;
      }
      console.log(`Google translation failed, trying last service...`);

      // 4단계: LibreTranslate
      console.log(`Trying LibreTranslate for: "${textToTranslate}"`);
      const libreResult = await this.translateWithLibre(textToTranslate);
      console.log(
        `LibreTranslate result: "${textToTranslate}" → "${libreResult}"`
      );
      this.cache.set(text, libreResult);
      return libreResult;
    } catch (error) {
      console.error(`Translation completely failed for "${text}":`, error);
      return text;
    }
  }

  /**
   * 번역이 필요한 텍스트인지 판단
   */
  private shouldTranslate(text: string): boolean {

    // 빈 문자열이나 공백만 있는 경우
    if (!text || text.trim().length === 0) {
      return false;
    }

    // 숫자만 있는 경우 (정수, 소수, 음수 포함)
    if (/^-?\d+(\.\d+)?$/.test(text.trim())) {
      return false;
    }

    // 단순 기호나 특수문자만 있는 경우
    if (/^[^\w\s]+$/.test(text)) {
      return false;
    }

    // 너무 짧은 텍스트 (1-2글자)
    if (text.trim().length < 3) {
      return false;
    }

    // 이미 한글이 포함된 경우
    if (/[가-힣]/.test(text)) {
      return false;
    }

    // URL, 도메인, IP 주소 등을 더 엄격하게 필터링
    if (this.isUrlOrDomain(text)) {
      return false;
    }

    // 파일 확장자인 경우
    if (/^\.[a-z0-9]+$/i.test(text)) {
      return false;
    }

    // 색상 코드인 경우
    if (/^#[0-9a-fA-F]{3,8}$|^rgb\(|^rgba\(|^hsl\(/.test(text)) {
      return false;
    }

    // 번역이 의미없는 프로그래밍 키워드들 (확장)
    const skipWords = [
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

    if (skipWords.includes(text.toLowerCase())) {
      return false;
    }

    // 다양한 명명 케이스 패턴 확인
    const isConstantCase = /^[A-Z][A-Z0-9_]*$/.test(text); // S3_UPLOAD_BUCKET_URL
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(text); // UserAuthToken
    const isSnakeCase = /^[a-z]+(_[a-z]+)*$/.test(text); // user_auth_token
    const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(text); // userAuthToken
    const isKebabCase = /^[a-z]+(-[a-z]+)*$/.test(text); // user-auth-token

    // 영어로 시작하거나 명명 케이스 패턴 중 하나라면 번역 대상
    if (!/^[a-zA-Z]/.test(text) && !isConstantCase && !isSnakeCase && !isKebabCase) {
      return false;
    }

    // 너무 긴 텍스트 (100자 이상)
    if (text.length > 100) {
      return false;
    }

    // 단순한 약어나 축약어는 번역하지 않음 (모두 대문자이고 짧은 경우)
    if (/^[A-Z]{2,5}$/.test(text) && !this.isTranslatableAcronym(text)) {
      return false;
    }

    return true;
  }

  /**
   * URL, 도메인, IP 주소 등을 판별
   */
  private isUrlOrDomain(text: string): boolean {
    // 기본 URL 패턴
    if (/^https?:\/\/|^ftp:\/\/|^www\./i.test(text)) {
      return true;
    }

    // 도메인명 패턴 (점이 포함되고 도메인 확장자가 있는 경우)
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
   * 번역 가능한 약어인지 판별
   */
  private isTranslatableAcronym(text: string): boolean {
    const translatableAcronyms = ['API', 'URL', 'AWS', 'GCP', 'SQL', 'JWT', 'UUID'];
    return translatableAcronyms.includes(text.toUpperCase());
  }

  /**
   * 다양한 케이스를 띄어쓰기로 변환
   */
  private convertToSpaces(text: string): string {
    // CONSTANT_CASE (S3_UPLOAD_BUCKET_URL)
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return text.split('_').join(' ').toLowerCase();
    }
    
    // snake_case (user_auth_token)
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return text.split('_').join(' ');
    }
    
    // kebab-case (user-auth-token)
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return text.split('-').join(' ');
    }
    
    // camelCase, PascalCase
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .toLowerCase();
  }

  /**
   * 로컬 사전을 이용한 번역 (핵심 프로그래밍 용어)
   */
  private translateLocally(text: string): string {
    const coreDict: { [key: string]: string } = {
      // 핵심 프로그래밍 용어
      function: "함수",
      method: "메서드",
      class: "클래스",
      variable: "변수",
      constant: "상수",
      array: "배열",
      object: "객체",
      string: "문자열",
      number: "숫자",
      boolean: "불린",
      null: "널",
      undefined: "정의되지않음",
      
      // 사용자 관련
      user: "사용자",
      users: "사용자들",
      admin: "관리자",
      guest: "게스트",
      member: "회원",
      account: "계정",
      profile: "프로필",
      
      // 데이터 관련
      data: "데이터",
      info: "정보",
      information: "정보",
      name: "이름",
      value: "값",
      key: "키",
      index: "인덱스",
      length: "길이",
      size: "크기",
      count: "개수",
      total: "총합",
      
      // 동작 관련
      get: "가져오다",
      set: "설정하다",
      add: "추가하다",
      remove: "제거하다",
      create: "생성하다",
      delete: "삭제하다",
      update: "업데이트하다",
      save: "저장하다",
      load: "로드하다",
      find: "찾다",
      search: "검색하다",
      filter: "필터링하다",
      sort: "정렬하다",
      
      // 제어문
      if: "만약",
      else: "그렇지않으면",
      for: "반복",
      while: "동안",
      try: "시도",
      catch: "잡기",
      error: "오류",
      return: "반환",
      import: "가져오기",
      export: "내보내기",
      
      // 상태 관련
      new: "새로운",
      old: "오래된",
      current: "현재",
      previous: "이전",
      next: "다음",
      first: "첫번째",
      last: "마지막",
      start: "시작",
      end: "끝",
      begin: "시작하다",
      finish: "끝내다",
      
      // 불린 값
      true: "참",
      false: "거짓",
      yes: "예",
      no: "아니오",
      enable: "활성화",
      disable: "비활성화",
      show: "보이기",
      hide: "숨기기",
      
      // 클라우드/인프라 용어
      s3: "S3",
      aws: "AWS",
      azure: "Azure",
      gcp: "GCP",
      upload: "업로드",
      download: "다운로드",
      bucket: "버킷",
      storage: "저장소",
      database: "데이터베이스",
      db: "DB",
      server: "서버",
      client: "클라이언트",
      host: "호스트",
      port: "포트",
      
      // API 관련
      api: "API",
      endpoint: "엔드포인트",
      request: "요청",
      response: "응답",
      post: "POST",
      put: "PUT",
      patch: "PATCH",
      
      // 설정 관련
      config: "설정",
      configuration: "구성",
      env: "환경변수",
      environment: "환경",
      development: "개발",
      production: "운영",
      test: "테스트",
      staging: "스테이징",
      
      // 보안 관련
      auth: "인증",
      authentication: "인증",
      authorization: "권한부여",
      token: "토큰",
      secret: "비밀키",
      password: "비밀번호",
      hash: "해시",
      encrypt: "암호화",
      decrypt: "복호화",
      
      // 식별자 관련
      id: "아이디",
      uuid: "UUID",
      guid: "GUID",
      timestamp: "타임스탬프",
      date: "날짜",
      time: "시간",
      
      // 상태 코드
      success: "성공",
      fail: "실패",
      failure: "실패",
      pending: "대기중",
      loading: "로딩중",
      complete: "완료",
      cancel: "취소",
      
      // 파일 관련
      file: "파일",
      folder: "폴더",
      directory: "디렉토리",
      path: "경로",
      url: "URL",
      uri: "URI",
      link: "링크",
      
      // 로그 관련
      log: "로그",
      debug: "디버그",
      warn: "경고",
      warning: "경고",
      fatal: "치명적오류",
    };

    const lowerText = text.toLowerCase();

    // 완전 일치 확인
    if (coreDict[lowerText]) {
      return coreDict[lowerText];
    }

    // 단어 분리
    const words = this.splitWords(text);
    if (words.length > 1) {
      const translatedWords = words.map((word) => {
        const lowerWord = word.toLowerCase();
        return coreDict[lowerWord] || word;
      });

      // 적어도 하나 번역되면 결과 반환
      const hasTranslation = translatedWords.some((word, index) => {
        return coreDict[words[index].toLowerCase()] !== undefined;
      });

      if (hasTranslation) {
        return translatedWords.join(" ");
      }
    }

    return text;
  }

  /**
   * 다양한 케이스의 문자열을 단어별로 분리
   */
  private splitWords(text: string): string[] {
    // CONSTANT_CASE (S3_UPLOAD_BUCKET_URL)
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return text.split('_').filter(word => word.length > 0);
    }
    
    // snake_case (user_auth_token)
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return text.split('_').filter(word => word.length > 0);
    }
    
    // kebab-case (user-auth-token)
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return text.split('-').filter(word => word.length > 0);
    }
    
    // camelCase, PascalCase
    return text.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
  }

  /**
   * MyMemory API를 이용한 번역
   */
  private async translateWithMyMemory(text: string): Promise<string> {
    try {
      const encodedText = encodeURIComponent(text);
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`,
        { timeout: 5000 }
      );

      if (response.data.responseStatus === 200) {
        return response.data.responseData.translatedText || text;
      }
      return text;
    } catch (error: any) {
      console.log(`MyMemory failed:`, error.message);
      return text;
    }
  }

  /**
   * Google Translate API를 이용한 번역
   */
  private async translateWithGoogleScraping(text: string): Promise<string> {
    try {
      if (this.requestCount > 50) {
        console.log("Daily Google request limit reached");
        return text;
      }

      const encodedText = encodeURIComponent(text);
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodedText}`,
        {
          timeout: 3000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      this.requestCount++;

      if (response.data && response.data[0] && response.data[0][0]) {
        return response.data[0][0][0] || text;
      }
      return text;
    } catch (error: any) {
      console.log(`Google scraping failed:`, error.message);
      return text;
    }
  }

  /**
   * LibreTranslate API를 이용한 번역
   */
  private async translateWithLibre(text: string): Promise<string> {
    try {
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

      return response.data.translatedText || text;
    } catch (error: any) {
      console.log(`LibreTranslate failed:`, error.message);
      return text;
    }
  }

  /**
   * 카멜케이스 문자열을 단어별로 분리 (호환성을 위해 유지)
   */
  private splitCamelCase(text: string): string[] {
    return this.splitWords(text);
  }

  /**
   * 카멜케이스를 띄어쓰기로 변환 (호환성을 위해 유지)
   */
  private convertCamelCaseToSpaces(text: string): string {
    return this.convertToSpaces(text);
  }

  /**
   * 주석에서 영어 텍스트 추출
   */
  extractEnglishFromComment(comment: string): string {
    const cleanComment = comment
      .replace(/^\/\/\s*/, "")
      .replace(/^\/\*\*?\s*/, "")
      .replace(/\*\/\s*$/, "")
      .replace(/^\*\s*/, "")
      .trim();

    const englishPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]+$/;
    return englishPattern.test(cleanComment) ? cleanComment : "";
  }
}