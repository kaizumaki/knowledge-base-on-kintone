export function generateTaskList(sequenceDiagram: string): string {
  const taskGroups: { [actor: string]: string[] } = {}; // アクターごとのタスクリストを保持

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

    let actor: string, target: string, action: string;

    if (trimmedLine.includes('-->>')) {
      // 受信タスクの解析 (例: target -->> actor: action)
      const [targetRaw, actorAction] = trimmedLine.split('-->>');
      [actor, action] = actorAction.split(':');
      target = targetRaw.trim();
      actor = actor.trim();
      action = action.trim();
      const taskDescription = `- [ ] ${target}から${action}を受け取る`;

      if (!taskGroups[actor]) {
        taskGroups[actor] = [];
      }
      taskGroups[actor].push(taskDescription);
    } else if (trimmedLine.includes('->>')) {
      // 送信タスクの解析 (例: actor ->> target: action)
      const [actorRaw, targetAction] = trimmedLine.split('->>');
      [target, action] = targetAction.split(':');
      actor = actorRaw.trim();
      target = target.trim();
      action = action.trim();
      const taskDescription = `- [ ] ${target}に${action}する`;

      if (!taskGroups[actor]) {
        taskGroups[actor] = [];
      }
      taskGroups[actor].push(taskDescription);
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
