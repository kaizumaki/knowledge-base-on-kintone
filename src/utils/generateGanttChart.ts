export function generateGanttChart(
  ganttTasks: {
    section: string;
    task: string;
    start: string;
    duration: string;
  }[],
  title: string
) {
  const ganttChart = `gantt\ntitle ${title}\ndateFormat YYYY-MM-DD\n`;

  const sections = new Map<
    string,
    { section: string; task: string; start: string; duration: string }[]
  >();

  ganttTasks.forEach((task) => {
    if (!sections.has(task.section)) {
      sections.set(task.section, []);
    }
    sections.get(task.section)?.push(task);
  });

  let ganttChartContent = '';
  sections.forEach((tasks, section) => {
    ganttChartContent += `section ${section}\n`;
    tasks.forEach((task) => {
      ganttChartContent += `${task.task}: ${task.start}, ${task.duration}\n`;
    });
  });

  return ganttChart + ganttChartContent;
}
