import HandleIcon from 'assets/images/icons/handle.svg?react';
import { NODE_HEIGHT } from 'constants/gantt';
import {
  useGanttBarDrag,
  useGanttBarLeftHandleDrag,
  useGanttBarRightHandleDrag,
} from 'hooks/useGanttBarDrag';
import { RenderedDependency, Task, TaskTransformed } from 'types/task';
import { getSmartGanttPath } from 'utils/arrowPath';

interface GanttBarProps {
  allTasks: TaskTransformed[];
  currentTask: TaskTransformed;
  onTasksChange?: (updatedTask: Task[]) => void;
}

function GanttBar({ allTasks, currentTask, onTasksChange }: GanttBarProps) {
  const { onDragStart: onBarDragStart } = useGanttBarDrag(
    currentTask,
    onTasksChange,
  );
  const { onDragStart: onLeftDragStart } = useGanttBarLeftHandleDrag(
    currentTask,
    onTasksChange,
  );
  const { onDragStart: onRightDragStart } = useGanttBarRightHandleDrag(
    currentTask,
    onTasksChange,
  );

  const renderLeftHandle = () => (
    <button
      type="button"
      onMouseDown={onLeftDragStart}
      className="absolute top-0 flex h-full cursor-w-resize items-center justify-center opacity-0 hover:opacity-100"
      style={{ left: '-1.15rem', width: '2rem', height: '100%' }}
    >
      <HandleIcon className="fill-base-500 size-6" />
    </button>
  );

  const renderRightHandle = () => (
    <button
      type="button"
      onMouseDown={onRightDragStart}
      className="absolute top-0 flex h-full cursor-w-resize items-center justify-center opacity-0 hover:opacity-100"
      style={{ right: '-1.15rem', width: '2rem', height: '100%' }}
    >
      <HandleIcon className="fill-base-500 size-6" />
    </button>
  );

  const renderedDependencies: RenderedDependency[] = (
    currentTask.dependencies || []
  )
    .map((dep) => {
      const dependencyNode = allTasks.find((t) => t.id === dep.targetId);
      if (!dependencyNode) return null;

      const rowHeightInPx = NODE_HEIGHT;

      // Y positions (center of task row)
      const fromY =
        (dependencyNode.order - 1) * rowHeightInPx + rowHeightInPx / 2;
      const toY = (currentTask.order - 1) * rowHeightInPx + rowHeightInPx / 2;

      let fromX: number;
      let toX: number;

      switch (dep.type) {
        case 'FS': {
          // From dependency's FINISH ➝ to current's START
          fromX = dependencyNode.barLeft + dependencyNode.barWidth;
          toX = currentTask.barLeft;
          break;
        }

        case 'SS': {
          // From dependency's START ➝ to current's START
          fromX = dependencyNode.barLeft;
          toX = currentTask.barLeft;
          break;
        }

        case 'FF': {
          // From dependency's FINISH ➝ to current's FINISH
          fromX = dependencyNode.barLeft + dependencyNode.barWidth;
          toX = currentTask.barLeft + currentTask.barWidth;
          break;
        }

        case 'SF': {
          // From dependency's START ➝ to current's FINISH
          fromX = dependencyNode.barLeft;
          toX = currentTask.barLeft + currentTask.barWidth;
          break;
        }

        default: {
          console.warn(`Unknown dependency type: ${dep.type}`);
          return null;
        }
      }

      return {
        ...dep,
        fromX,
        fromY,
        toX,
        toY,
      };
    })
    .filter(Boolean) as RenderedDependency[];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="bg-base-400 relative flex items-center"
        onMouseDown={onBarDragStart}
        style={{
          marginLeft: `${currentTask.barLeft}px`,
          width: `${currentTask.barWidth}px`,
          height: `1rem`,
        }}
      >
        {renderLeftHandle()}
        {renderRightHandle()}
      </div>
      <svg className="pointer-events-none absolute top-0 left-0 z-10 size-full">
        <g>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5.25"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill="#00C8C2" />
            </marker>
          </defs>
          {renderedDependencies.map((dep, index) => (
            <path
              key={index}
              d={getSmartGanttPath(
                dep.type,
                dep.fromX,
                dep.fromY,
                dep.toX,
                dep.toY,
              )}
              fill="none"
              markerEnd="url(#arrowhead)"
              style={{ stroke: 'rgb(0, 200, 194)', strokeWidth: 0.75 }}
            />
          ))}
        </g>
      </svg>
    </>
  );
}

export default GanttBar;
