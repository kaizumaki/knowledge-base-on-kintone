export function generateTaskList(sequenceDiagram: string): string {
  const taskGroups: { [actor: string]: string[] } = {}; // アクターごとのタスクリストを保持

  const arrowRegex =
    /(->>|-->>|->|\-->|-\)|--\)|-\>|\--x|-\>|->\>\+|-->>-|--x|->|--)/; // 対応するすべての矢印を正規表現で定義

  const lines = sequenceDiagram.split('\n'); // シーケンス図の行を取得

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // 無視すべき行をフィルタリング
    if (
      trimmedLine === '' ||
      trimmedLine.startsWith('title') ||
      trimmedLine.startsWith('autonumber') ||
      trimmedLine.startsWith('actor') ||
      trimmedLine.startsWith('participant') ||
      trimmedLine.startsWith('destroy') ||
      trimmedLine.startsWith('Note') ||
      trimmedLine.startsWith('loop') ||
      trimmedLine === 'end'
    ) {
      return; // 無視すべき行はスキップ
    }

    // 矢印による分割を行い、アクターとタスク内容を取得
    const arrowMatch = trimmedLine.match(arrowRegex);
    if (arrowMatch) {
      const [beforeArrow, afterArrow] = trimmedLine.split(arrowMatch[0]);
      const actor = beforeArrow.trim();
      const [target, action] = afterArrow.split(':').map((part) => part.trim());
      const arrow = arrowMatch[0];

      let taskDescription = '';

      // 矢印の種類によってタスクの形式を決定
      if (arrow.includes('>')) {
        taskDescription = `- [ ] ${target}に${action}をする`;
      } else if (arrow.includes('<') || arrow.includes('-')) {
        taskDescription = `- [ ] ${target}から${action}を受け取る`;
      }

      if (!taskGroups[actor]) {
        taskGroups[actor] = [];
      }
      taskGroups[actor].push(taskDescription);

      // 「受け取る」側のアクターに対してもタスクを追加
      if (arrow.includes('<') || arrow.includes('-')) {
        const receiveTaskDescription = `- [ ] ${actor}から${action}を受け取る`;
        if (!taskGroups[target]) {
          taskGroups[target] = [];
        }
        taskGroups[target].push(receiveTaskDescription);
      }
    }
  });

  // Markdown形式のチェックリストを生成して出力用文字列にする
  let output = 'タスクリスト\n';
  for (const actor in taskGroups) {
    output += `\n${actor}\n\n`;
    output += taskGroups[actor].join('\n') + '\n';
  }

  return output;
}
