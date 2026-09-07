# 유지보수 · 개선 요청

이 레포는 **공통(framework) 작업용 원본**이다. 여기서 고친 공통 부분이 각 프로젝트의 `/pdk-update` 로 퍼진다.

---

## 공통 변경 배포 (유지보수자)

1. 이 원본 레포에서 공통 부분(`engine/`·`templates/`·`.claude/commands/`·`docs/`)을 수정·커밋·푸시한다.
2. 의미 있는 변경이면 [`RELEASES.md`](../RELEASES.md) 맨 위에 새 `## v<N>` 항목을 추가한다.
   - **단순 코드/레이아웃 변경** → 파일 동기화로 자동 반영되므로 **요약만** 적는다.
   - **디렉토리·설정 스키마 등 구조 변경** → `/pdk-update`(Claude)가 각 프로젝트에서 수행할
     **마이그레이션 지시**를 명확히 적는다. 없으면 "없음".
3. 각 사용자가 `/pdk-update` 를 실행하면 반영되고 변경점 요약을 보게 된다.

> 작성 형식과 규칙은 `RELEASES.md` 상단 주석에 있다. 형식을 지켜야 비개발자가 커맨드 한 번으로 적용된다.

### 배포 대상 (동기화되는 경로)

`/pdk-update` 매니페스트 — 이 경로들은 각 프로젝트에서 **덮어써진다.**

```
engine/  templates/  .claude/commands/
docs/GUIDE.md  docs/UPDATING.md  docs/MAINTAINING.md  docs/reference/  RELEASES.md
```

반대로 `config/*.js`·`index.html`·`pages/`·`assets/mockups/`·`README.md`·`custom/` 은
**사용자 것이라 절대 덮어쓰지 않는다.** 공통에 넣을 내용을 실수로 이 경로에 두지 않도록 주의한다.

---

## 개선 요청 (각 프로젝트 → 공통)

프로젝트에서 공통 부분을 개선해 보고 **모두에게 반영하고 싶다면**, 이 레포를 직접 고치는 대신:

1. 내 프로젝트의 **`custom/` 디렉토리를 압축**한다 (`custom/patches/*.patch` + `custom/README.md`).
2. 압축 파일을 **유지보수자에게 전달**한다.
3. 유지보수자가 검토 후 일반적으로 유용하면 공통(`engine/` 등)에 반영하고 `RELEASES.md`에 기록한다
   → 다음 `/pdk-update` 때 **모든 프로젝트에 전파**된다.
   (반영되면 그 프로젝트는 해당 patch가 더 이상 필요 없다.)

> 리뷰가 빠르도록 `custom/README.md` 에 **대상 파일 / 변경 요약 / 변경 이유 / 일반·프로젝트 한정 여부**를
> 적어 주세요. patch만으로도 내용은 읽히지만, 설명이 있으면 반영 판단이 정확해집니다.
