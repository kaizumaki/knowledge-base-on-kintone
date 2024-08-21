export function convertToGanttChart(
  events: { note: string | null; action: string; time: string | null }[],
  committeeLabel: string,
  committeeDate: string // 具体的な日付が入る
) {
  let section = '';
  const ganttTasks: {
    section: string;
    task: string;
    start: string;
    duration: string;
  }[] = [];

  // committeeDateをDateオブジェクトに変換
  const committeeDateObj = new Date(committeeDate);

  events.forEach((event) => {
    // セクション名として「Note over」の行を含まないようにする
    if (event.note && !event.note.startsWith('over')) {
      section = event.note.split(':').pop()?.trim() || '';
    }

    if (event.action) {
      let startDate: string | null = null;

      if (section.includes('日前') || section.includes('日後')) {
        const daysMatch = section.match(/(\d+)日/);
        if (daysMatch) {
          const days = parseInt(daysMatch[1], 10);
          const eventDate = new Date(committeeDateObj);

          if (section.includes('日前')) {
            eventDate.setDate(eventDate.getDate() - days);
          } else if (section.includes('日後')) {
            eventDate.setDate(eventDate.getDate() + days);
          }

          startDate = eventDate.toISOString().split('T')[0];
        }
      }

      if (!startDate) {
        startDate = committeeDate;
      }

      ganttTasks.push({
        section,
        task: event.action,
        start: startDate,
        duration: '7d',
      });
    }
  });

  // 文字列を「当日」セクションに使用
  ganttTasks.push({
    section: committeeLabel,
    task: committeeLabel,
    start: committeeDate,
    duration: '1d',
  });

  // セクション内のタスクを日付の昇順でソート
  ganttTasks.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return ganttTasks;
}
