// Basic icon names for shared package
export const Icons = {
  // Common icons
  home: 'home',
  calendar: 'calendar',
  task: 'task',
  list: 'list',
  tag: 'tag',
  folder: 'folder',
  plus: 'plus',
  minus: 'minus',
  edit: 'edit',
  delete: 'delete',
  check: 'check',
  close: 'close',
  search: 'search',
  filter: 'filter',
  sort: 'sort',
  settings: 'settings',
  user: 'user',
  logout: 'logout',
  // Abhyasa icons
  target: 'target',
  trophy: 'trophy',
  star: 'star',
  flag: 'flag',
  FitnessIcon: 'FitnessIcon',
  BookIcon: 'BookIcon',
  MindIcon: 'MindIcon',
  WaterIcon: 'WaterIcon',
  PlanIcon: 'PlanIcon',
  HeartIcon: 'HeartIcon',
  Edit3Icon: 'Edit3Icon',
  CheckSquareIcon: 'CheckSquareIcon',
  StarIcon: 'StarIcon',
  leaf: 'leaf',
  book: 'book',
  // Dainandini icons
  pen: 'pen',
  note: 'note',
  // Kary icons
  inbox: 'inbox',
  project: 'project',
  work: 'work',
  personal: 'personal',
} as const;

export type IconName = keyof typeof Icons;
