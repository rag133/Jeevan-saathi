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
  // Dainandini icons
  book: 'book',
  pen: 'pen',
  note: 'note',
  Edit3Icon: 'Edit3Icon',
  CheckSquareIcon: 'CheckSquareIcon',
  StarIcon: 'StarIcon',
  // Kary icons
  inbox: 'inbox',
  project: 'project',
  work: 'work',
  personal: 'personal',
} as const;

export type IconName = keyof typeof Icons;
