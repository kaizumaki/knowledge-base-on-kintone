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
    const APP_ID = 2644;

    const params = {
      app: APP_ID,
      query: `workflow_id = ${record.workflow_id.value}`
    };

    // return event;
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then((resp) => {

      const workflowMasterAppRecords = resp.records;

      // 同じ「業務フローID」のレコードが「業務フローマスター」アプリに存在しないときにエラーを表示
      if (workflowMasterAppRecords.length === 0) {
        window.alert('「業務フローマスター」アプリに同じ「業務フローID」のレコードがありません。');
        return event;
      }

      // シーケンス図の表示
      const sequenceText = workflowMasterAppRecords[0].sequence_input_field.value;
      const spaceElementForSequence =
        kintone.app.record.getSpaceElement('sequence-display');
      if (!!sequenceText) {
        spaceElementForSequence.innerHTML = `<pre class="mermaid">${sequenceText}</pre>`;
      }

      // ガントチャートの表示
      // 正規表現で「Note ... YYYY-MM-DD」部分を抽出し、その後のテキストも取得する
      const committeeMatch = sequenceText.match(
        /Note left of 委員:\s*([^\n]*\s(?:\d{4}-\d{2}-\d{2}|YYYY-MM-DD))/
      );

      let committeeLabel = '実施日';
      let committeeDate = record.committee_date.value || '2024-07-01';

      if (committeeMatch) {
        const matchString = committeeMatch[1].trim();
        if (matchString.includes('YYYY-MM-DD')) {
          // "YYYY-MM-DD" が含まれている場合は、"委員会開催"をラベルとして設定
          committeeLabel = matchString.replace(/\s*YYYY-MM-DD/, '');
        } else {
          // 実際の日付が含まれている場合、その日付を取得
          const dateMatch = matchString.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            committeeDate = dateMatch[0];
            committeeLabel = matchString.replace(/\s*\d{4}-\d{2}-\d{2}/, '');
          }
        }
      }

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
        workflowMasterAppRecords[0].additional_information_input_field.value;
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

    }).catch((error) => {
      // エラー表示をする
      window.alert(`エラーが起こりました。エラーメッセージ：${error.message}`);
      return event;
    });
  });
})();
