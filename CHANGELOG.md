# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2025-06-20

### Removed
- **Google Translation Strategy**: Google 내부 API 사용으로 인한 ToS 위반 가능성 제거
- **불안정한 번역 서비스**:  문제 발생 가능한 비공식 API들 제거

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
