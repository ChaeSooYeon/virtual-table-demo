# 대량 데이터 가상 테이블 데모

고정 높이 테이블 viewport에서 대량 row를 다룰 때, `useMemo` 최적화와 가상 스크롤링의 차이를 비교하는 포트폴리오용 데모입니다.

## 실행화면
<img width="1759" height="846" alt="스크린샷 2026-05-11 20 48 04" src="https://github.com/user-attachments/assets/81c696ac-705f-480e-9586-e220b4cbe501" />


## 데모 구성

- `Plain`: 일반 Ant Design Table 렌더링
- `useMemo`: row/column 계산 결과를 메모이징한 비교군
- `Virtual`: `react-window` 기반으로 화면에 보이는 cell만 렌더링하는 가상 테이블

## 문제 해결 포인트

- `useMemo`는 데이터 계산 재사용에는 효과가 있지만, 이미 만들어진 대량 DOM 렌더링 비용은 줄이지 못합니다.
- 가상 테이블은 고정 높이 viewport 안에서 실제로 보이는 row만 DOM에 올려 렌더링 병목을 직접 줄입니다.
- 컬럼 수는 16개, viewport 높이는 고정하고 데이터 수를 바꿔가며 렌더링 범위와 예상 DOM cell 수를 비교할 수 있게 구성했습니다.
- 기존 운영 코드의 가상 스크롤 아이디어를 데모 환경에 맞춰 독립 실행 가능한 구조로 재작성했습니다.

## 측정 지표

- 전체 데이터 수: 테이블에 전달한 전체 row 개수
- 컬럼 수: 현재 표시 중인 column 개수
- 렌더링 row 수: 실제 화면 렌더링 대상이 된 row 개수
- 예상 cell 수: 렌더링 row 수에 컬럼 수를 곱한 예상 DOM cell 개수
- 반영 시간: 옵션 변경 후 다음 frame까지 걸린 대략적인 UI 반영 시간

## 실행

```bash
npm install
npm run dev
```
