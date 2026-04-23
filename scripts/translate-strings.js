const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(appPath, 'utf-8');

// 교체 규칙들
const replacements = [
  { from: /(\s+)Daily Briefing(\s)/g, to: "$1오늘의 브리핑$2" },
  { from: /(\s+)Command summary(\s)/g, to: "$1요약$2" },
  { from: />Close</g, to: ">닫기<" },
  { from: />Upcoming</g, to: ">예정<" },
  { from: />Open tasks</g, to: ">할 일<" },
  { from: /'Live now'/g, to: "'현재 진행'" },
  { from: /'Plan pending\.'/g, to: "'이동 계획 미정'" },
];

// 각 교체 실행
replacements.forEach(({ from, to }) => {
  const beforeLength = (content.match(from) || []).length;
  content = content.replace(from, to);
  if (beforeLength > 0) {
    console.log(`✓ '${from.source}' → ${to} (${beforeLength}개 변경)`);
  }
});

// 수정된 내용 저장
fs.writeFileSync(appPath, content, 'utf-8');
console.log('\n✓ App.jsx 파일이 성공적으로 업데이트되었습니다.');
