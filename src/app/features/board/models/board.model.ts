export type IssueType = 'story' | 'task' | 'bug' | 'epic';
export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type IssueStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type SprintStatus = 'planned' | 'active' | 'completed';

export interface BoardUser {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface IssueComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
}

export interface Issue {
  id: string;
  key: string;
  projectKey: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  reporterId: string;
  storyPoints: number | null;
  labels: string[];
  sprintId: string | null;
  rank: number;
  comments: IssueComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  projectKey: string;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate: Date | null;
  endDate: Date | null;
}

export interface Project {
  key: string;
  name: string;
  description: string;
  leadId: string;
  color: string;
}

export interface BoardColumn {
  id: IssueStatus;
  title: string;
  wipLimit?: number;
}

export interface BoardFilters {
  query: string;
  assigneeId: string;
  type: IssueType | '';
  priority: IssuePriority | '';
  onlyMine: boolean;
}

export interface NewIssue {
  projectKey: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  storyPoints: number | null;
  labels: string[];
  sprintId: string | null;
}

export interface NewProject {
  key: string;
  name: string;
  description: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress', wipLimit: 3 },
  { id: 'in-review', title: 'In Review', wipLimit: 2 },
  { id: 'done', title: 'Done' },
];

export const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug', 'epic'];
export const ISSUE_PRIORITIES: IssuePriority[] = [
  'highest',
  'high',
  'medium',
  'low',
  'lowest',
];
export const STORY_POINT_OPTIONS = [1, 2, 3, 5, 8, 13];

export const ISSUE_TYPE_META: Record<IssueType, { label: string; color: string }> = {
  story: { label: 'Story', color: '#22A06B' },
  task: { label: 'Task', color: '#1D7AFC' },
  bug: { label: 'Bug', color: '#E34935' },
  epic: { label: 'Epic', color: '#6E5DC6' },
};

export const PRIORITY_META: Record<IssuePriority, { label: string; color: string }> = {
  highest: { label: 'Highest', color: '#C9372C' },
  high: { label: 'High', color: '#E56910' },
  medium: { label: 'Medium', color: '#E2B203' },
  low: { label: 'Low', color: '#0C66E4' },
  lowest: { label: 'Lowest', color: '#626F86' },
};

export const STATUS_META: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: '#44546F', bg: '#F1F2F4' },
  'in-progress': { label: 'In Progress', color: '#0C66E4', bg: '#E9F2FF' },
  'in-review': { label: 'In Review', color: '#5E4DB2', bg: '#F3F0FF' },
  done: { label: 'Done', color: '#216E4E', bg: '#DCFFF1' },
};

export const EMPTY_FILTERS: BoardFilters = {
  query: '',
  assigneeId: '',
  type: '',
  priority: '',
  onlyMine: false,
};
