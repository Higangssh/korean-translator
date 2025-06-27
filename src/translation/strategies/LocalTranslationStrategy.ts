import { ITranslationStrategy } from "./ITranslationStrategy";
import { TextProcessor } from "../core/TextProcessor";

export class LocalTranslationStrategy implements ITranslationStrategy {
  public readonly name = "Local Dictionary";
  public readonly priority = 0;

  private readonly textProcessor = new TextProcessor();
  private readonly coreDict: { [key: string]: string } = {
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

  public canHandle(text: string): boolean {
    return true; // 로컬 사전은 모든 텍스트를 처리할 수 있음
  }

  public async translate(text: string): Promise<string> {
    const lowerText = text.toLowerCase();

    // 완전 일치 확인
    if (this.coreDict[lowerText]) {
      console.log(
        `Local dictionary match: "${text}" → "${this.coreDict[lowerText]}"`
      );
      return this.coreDict[lowerText];
    }

    // 단어 분리 후 번역 시도
    const words = this.textProcessor.splitWords(text);
    if (words.length > 1) {
      const translatedWords = words.map((word) => {
        const lowerWord = word.toLowerCase();
        return this.coreDict[lowerWord] || word;
      });

      // 적어도 하나 번역되면 결과 반환
      const hasTranslation = translatedWords.some((word, index) => {
        return this.coreDict[words[index].toLowerCase()] !== undefined;
      });

      if (hasTranslation) {
        const result = translatedWords.join(" ");
        console.log(`Local dictionary partial match: "${text}" → "${result}"`);
        return result;
      }
    }

    console.log(`Local dictionary no match: "${text}"`);
    return text;
  }

  /**
   * 사전에 새로운 번역 추가
   */
  public addTranslation(english: string, korean: string): void {
    this.coreDict[english.toLowerCase()] = korean;
  }

  /**
   * 사전에서 번역 제거
   */
  public removeTranslation(english: string): void {
    delete this.coreDict[english.toLowerCase()];
  }

  /**
   * 사전 크기 반환
   */
  public getDictionarySize(): number {
    return Object.keys(this.coreDict).length;
  }

  /**
   * 특정 단어가 사전에 있는지 확인
   */
  public hasTranslation(english: string): boolean {
    return this.coreDict[english.toLowerCase()] !== undefined;
  }
}
