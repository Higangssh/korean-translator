# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2025-06-29

### Added

- **Cursor IDE Support**: Full compatibility with Cursor AI-powered code editor
  - Added Cursor engine to package.json engines field
  - Enhanced README with Cursor installation instructions
  - Added Cursor-specific keywords for better discoverability
  - Cursor compatibility badge in documentation

### Changed

- **Documentation Updates**: Updated all references to support both VS Code and Cursor
  - Modified title to "Korean Code Translator for VS Code & Cursor"
  - Added Cursor installation methods in README
  - Updated system requirements to include Cursor ≥ 0.1.0
  - Enhanced marketplace discoverability with cursor-related keywords

### Improved

- **Cross-platform IDE Support**: Extension now officially supports both VS Code and Cursor
- **Installation Experience**: Clear installation instructions for both IDEs
- **Developer Experience**: Seamless functionality across both platforms

## [1.1.0] - 2025-06-27

### 새로운 기능

- **GPT 번역 전략**: OpenAI GPT-4o-mini 통합으로 고품질 번역 지원
  - 우선순위 기반 번역 시스템: 로컬 사전 → GPT → MyMemory → LibreTranslate
  - 선택 가능한 GPT 모델: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
  - 스마트 API 키 검증 및 오류 처리
- **향상된 설정 UI**: GPT 설정 경험 개선
  - API 키 설정에 직접 설정 링크 제공
  - 원클릭 GPT 설정 완료 및 재시작
  - 명확한 API 키 설정 가이드
- **고급 오류 처리**: API 문제 발생 시 사용자 경험 개선
  - 할당량 초과 시 도움이 되는 링크와 함께 오류 메시지 제공
  - 다른 번역 전략으로 자동 대체
  - 사용자 친화적인 오류 알림

### 변경사항

- **번역 우선순위 시스템**: 로컬 사전 우선, 그 다음 GPT로 우선순위 조정
- **디바운싱 설정**: 사용자 설정에서 동적으로 읽어오도록 변경
- **문서화**: 포괄적인 GPT 설정 가이드 및 문제 해결 방법 추가

### 개선사항

- **API 요청 최적화**: 불필요한 요청을 최소화하는 향상된 디바운싱 및 캐싱
- **사용자 경험**: 시각적 가이드와 함께 간소화된 GPT 설정 과정
- **비용 효율성**: API 비용을 줄이는 스마트 요청 관리

### 새로운 명령어

- `korean-translator.setupGPT` - GPT 설정 완료 및 확장 프로그램 재시작

## [1.0.8] - 2025-06-20

### Removed

- **Google Translation Strategy**: Google 내부 API 사용으로 인한 ToS 위반 가능성 제거
- **불안정한 번역 서비스**: 문제 발생 가능한 비공식 API들 제거

### Changed

- **3단계 번역 파이프라인**: 안정적이고 합법적인 서비스들로만 구성
  - **Stage 1**: Local Dictionary (129개 핵심 프로그래밍 용어)
  - **Stage 2**: MyMemory API (공식 번역 메모리 서비스)
  - **Stage 3**: LibreTranslate (오픈소스 번역 엔진)

### Improved

- **안정성 향상**: 모든 번역 전략이 공식 API 또는 허가된 서비스 사용
- **법적 안전성**: 서비스 약관 위반 없는 깨끗한 구현
- **신뢰성 증대**: 예고 없는 서비스 중단 위험 최소화

## [1.0.6] - 2025-06-20

### Added

- Enhanced 6-stage translation pipeline: Extended from 4-stage to comprehensive 6-stage system

- **Stage 1**: Local dictionary (70+ programming terms)
- **Stage 2**: Compound word splitting with naming convention recognition
- **Stage 3**: MyMemory API (professional translation memory)
- **Stage 4**: Google Translate (high accuracy)
- **Stage 5**: Lingva Translate (multiple instances)
- **Stage 6**: FreeTranslate & LibreTranslate (open source backup)

## [1.0.0] - 2025-06-19

### Added

- Initial release of Korean Translator extension
- **Hover translation**: Translate English text on mouse hover
- **Keyboard shortcut**: `Ctrl+Shift+T` for quick translation
- **Multi-engine translation system**:
  - Local dictionary (instant response)
  - MyMemory API (translation memory)
  - Google Translate (high quality)
  - LibreTranslate (open source fallback)
- **Smart text filtering**: Skip numbers, URLs, color codes, and programming keywords
- **Intelligent caching**: Prevent duplicate API calls and improve performance
- **CamelCase support**: `userCredentials` → `user credentials` → `사용자 로그인 정보`
- **Language support**: JavaScript, TypeScript, Python, Java, Go, Rust, C/C++, C#, PHP, Ruby, Swift, Kotlin

### Features

- Inline translation display (shows result for 3 seconds)
- Status bar notifications
- Configurable settings:
  - Enable/disable hover translation
  - Auto-translate comments
  - Auto-translate variable names
  - Minimum word length
  - Hover delay timing

### Commands

- `korean-translator.translateSelection` - Translate selected text
- `korean-translator.toggle` - Toggle translation feature
- `korean-translator.clearCache` - Clear translation cache (dev)
- `korean-translator.cacheStatus` - Show cache status (dev)

### Configuration

```json
{
  "korean-translator.enabled": true,
  "korean-translator.autoTranslateComments": true,
  "korean-translator.autoTranslateVariables": true,
  "korean-translator.minimumWordLength": 3,
  "korean-translator.debounceDelay": 300
}
```

### Requirements

- VS Code 1.101.0 or higher
- Node.js 20.x or higher
- Internet connection for online translation services
