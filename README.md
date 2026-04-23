# 가족 여행 지휘 센터

> 가족 여행을 마치 작전처럼 관리하는 Palantir 스타일 대시보드

여러 가족이 같은 목적지로 이동하는 것을 "시스템 문제"로 바라봅니다. 도착 경로, 이동 시뮬레이션, 식사 물류, 가족별 체크리스트, 비용 정산을 하나의 다크 커맨드 센터 UI로 통합합니다.

![대시보드 전체 화면](docs/dashboard-overview.png)

## 주요 기능

- 여러 출발지에서 출발하는 가족들의 이동 상황 추적
- 이동 경로, 타임라인 재생, 일자별 시뮬레이션
- 일정 / 숙소 / 식사 / 활동 / 비용 / 가족 탭으로 구성
- 노션 데이터베이스 연동으로 실시간 데이터 동기화

## 화면 구성

### 미션 런치 오버레이

![미션 런치 오버레이](docs/mission-launch.png)

### 활동 계획 화면

![활동 계획 화면](docs/activity-board.png)

### 식사 물류 화면

![식사 계획 화면](docs/meals-planner.png)

## 기술 스택

- React 19 + Vite
- Tailwind CSS
- Google Maps JavaScript API
- Lucide 아이콘
- Framer Motion

## 로컬 실행 방법

```bash
npm install
cp .env.example .env
npm run dev
```

브라우저에서 아래 주소로 접속하세요:

```
http://localhost:5173
```

> **주의:** `127.0.0.1:5173`은 작동하지 않을 수 있습니다. 반드시 `localhost:5173`을 사용하세요.

## 환경 변수 설정 (`.env`)

Google Maps 지도를 사용하려면 `.env` 파일에 API 키를 추가하세요:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_browser_maps_key_here
```

선택 사항 (스타일 맵):

```bash
VITE_GOOGLE_MAP_ID=1acb6d30005c9e1b53cf0828
```

API 키 없이도 앱 UI는 정상 작동하지만 Google 지도 레이어는 초기화되지 않습니다.

## 노션 데이터베이스 연동

앱 내 왼쪽 사이드바의 **데이터베이스 아이콘(⊞)** 을 클릭하면 단계별 연동 튜토리얼이 실행됩니다.

연동 절차 요약:

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) 에서 인테그레이션 생성 후 API 키 복사
2. 노션에서 새 데이터베이스 생성 (이름, 출발지, 준비도, 상태 속성 포함)
3. 데이터베이스에 인테그레이션 공유 권한 부여
4. 앱 튜토리얼 패널에서 API 키 + 데이터베이스 ID 입력 후 연결 테스트

> **CORS 안내:** 브라우저에서 Notion API를 직접 호출하면 CORS 오류가 발생합니다. 실서비스에서는 백엔드 프록시 서버가 필요합니다. 로컬 테스트는 브라우저 확장 프로그램(예: CORS Unblock)으로 우회 가능합니다.

## 데이터 / 개인정보

이 저장소의 여행 데이터는 공개 데모용으로 가공된 샘플입니다.

- 가족 이름은 예시 이름입니다.
- 숙소 주소는 일반화되었습니다.
- 출입 정보, Wi-Fi 비밀번호, 호스트 연락처 등 민감 정보는 제거되었습니다.

Google Maps API 키를 직접 발급해 사용하는 경우, 사용량은 본인의 Google Cloud 프로젝트에 과금됩니다.

## 상태 관리

- 모든 상태는 브라우저 `localStorage`에 자동 저장됩니다.
- 노션 연동 설정(API 키, DB ID)도 로컬에 저장됩니다.
- 대시보드는 데스크탑 대형 화면에 최적화되어 있습니다.

## 코드 탐색 가이드

| 파일 | 역할 |
|------|------|
| `src/App.jsx` | 메인 쉘, 타임라인, 오버레이 |
| `src/CommandMap.jsx` | 경로 렌더링, 재생, 지도 동작 |
| `src/tripModel.js` | 여행 데이터 모델 및 헬퍼 로직 |
| `src/tripData.js` | 초기 여행 데이터 (가족, 일정, 장소) |
| `src/NotionSetupTutorial.jsx` | 노션 연동 단계별 튜토리얼 |
| `src/useNotionSync.js` | 노션 API 연동 훅 |
| `src/OnboardingGuide.jsx` | 첫 방문 마이크로액션 가이드 |
