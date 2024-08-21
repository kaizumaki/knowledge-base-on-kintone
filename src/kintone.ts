import { marked } from 'marked';
import mermaid from 'mermaid';
import { generateTaskList } from './utils/taskGenerator';
import { parseSequenceDiagram } from './utils/parseSequenceDiagram';
import { convertToGanttChart } from './utils/convertToGanttChart';
import { generateGanttChart } from './utils/generateGanttChart';

(() => {
  'use strict';

  mermaid.initialize({ startOnLoad: false });

  marked.setOptions({
    breaks: true,
  });

  // レコード追加・編集画面表示後イベント
  kintone.events.on(['app.record.detail.show'], async (event) => {
    const record = event.record;

    // シーケンス図の表示
    const sequenceText = record.sequence_input_field.value;
    const spaceElementForSequence =
      kintone.app.record.getSpaceElement('sequence-display');
    if (!!sequenceText) {
      spaceElementForSequence.innerHTML = `<pre class="mermaid">${sequenceText}</pre>`;
    }

    // ガントチャートの表示
    // 「Note」から始まる行で、「YYYY-MM-DD」を含む行からラベルと日付を抽出
    const committeeMatch = sequenceText.match(
      /Note.*?(.*\s+)(\d{4}-\d{2}-\d{2})/
    );
    const committeeLabel = committeeMatch ? committeeMatch[1].trim() : '実施日';
    const committeeDate =
      committeeMatch && committeeMatch[2].trim() !== 'YYYY-MM-DD'
        ? committeeMatch[2].trim()
        : '2024-07-01';

    // シーケンスダイアグラムのタイトルを抽出
    const titleMatch = sequenceText.match(/title:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Gantt Chart';

    const events = parseSequenceDiagram(sequenceText, committeeLabel);
    const ganttTasks = convertToGanttChart(
      events,
      committeeLabel,
      committeeDate
    );
    const ganttChart = generateGanttChart(ganttTasks, title);
    const spaceElementForGantt =
      kintone.app.record.getSpaceElement('gantt-display');
    if (!!ganttChart) {
      spaceElementForGantt.innerHTML = `<pre class="mermaid">${ganttChart}</pre>`;
    }

    // 補足事項の表示
    const additionalInformationText =
      record.additional_information_input_field.value;
    const spaceElementForAdditionalInformation =
      kintone.app.record.getSpaceElement('additional-information-display');
    spaceElementForAdditionalInformation.classList.add('markdown-body');
    if (!!additionalInformationText) {
      spaceElementForAdditionalInformation.innerHTML = marked.parse(
        additionalInformationText
      );
    }

    const spaceElementForTaskList =
      kintone.app.record.getSpaceElement('task-list-display');
    if (!!sequenceText) {
      // タスクリストを生成
      const taskListMarkdown: string = generateTaskList(sequenceText);
      // タスクリストの表示
      spaceElementForTaskList.innerHTML = marked.parse(taskListMarkdown);
    }

    mermaid.run({
      querySelector: '.mermaid',
    });

    return event;
  });
})();
