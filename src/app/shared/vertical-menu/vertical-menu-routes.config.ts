import { RouteInfo } from './vertical-menu.metadata';

//Sidebar menu Routes and data
export const ROUTES: RouteInfo[] = [

  {
    Path: '', Title: 'Dashboard', Icon: 'ft-home', Class: 'has-sub', Badge: '2', BadgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', IsExternalLink: false, Submenu: [
      { Path: '/dashboard/dashboard1', Title: 'Dashboard 1', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/dashboard/dashboard2', Title: 'Dashboard 2', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
    ]
  },
  { Path: '/inbox', Title: 'Email', Icon: 'ft-mail', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
  { Path: '/chat', Title: 'Chat', Icon: 'ft-message-square', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
  { Path: '/chat-ngrx', Title: 'Chat NgRx', Icon: 'ft-message-square', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
  { Path: '/taskboard', Title: 'Task Board', Icon: 'ft-file-text', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
  { Path: '/taskboard-ngrx', Title: 'Task Board NgRx', Icon: 'ft-file-text', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
  { Path: '/calendar', Title: 'Calendar', Icon: 'ft-calendar', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
  {
    Path: '', Title: 'UI Kit', Icon: 'ft-aperture', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
    Submenu: [
      { Path: '/uikit/grids', Title: 'Grid', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/uikit/typography', Title: 'Typography', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/uikit/syntaxhighlighter', Title: 'Syntax Highlighter', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/uikit/helperClasses', Title: 'Helper Classes', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/uikit/textutilities', Title: 'Text Utilities', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/uikit/colorpalettes', Title: 'Color Palette', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },

      {
        Path: '', Title: 'Icons', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [
          { Path: '/uikit/feather', Title: 'Feather Icon', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/uikit/font-awesome', Title: 'Font Awesome Icon', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/uikit/simple-line', Title: 'Simple Line Icon', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
        ]
      },
    ]
  },
  {
    Path: '', Title: 'Components', Icon: 'ft-box', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
    Submenu: [
      {
        Path: '', Title: 'Bootstrap', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [
          { Path: '/components/buttons', Title: 'Buttons', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/ng-buttons', Title: 'NG Buttons', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/alerts', Title: 'Alerts', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/badges', Title: 'Badges', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/dropdowns', Title: 'Dropdowns', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/media', Title: 'Media Objects', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/pagination', Title: 'Pagination', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/progress', Title: 'Progress Bars', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/models', Title: 'Modals', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/collapse', Title: 'Collapse', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/lists', Title: 'List', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/accordion', Title: 'Accordion', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/carousel', Title: 'Carousel', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/popover', Title: 'Popover', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/rating', Title: 'Rating', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/navs', Title: 'Navs', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/tooltip', Title: 'Tooltip', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/typeahead', Title: 'Typeahead', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] }
        ]
      },
      {
        Path: '', Title: 'Extra', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [
          { Path: '/components/sweetalerts', Title: 'Sweet Alert', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/toastr', Title: 'Toastr', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/nouislider', Title: 'NoUI Slider', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/upload', Title: 'Upload', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/dragndrop', Title: 'Drag and Drop', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/tour', Title: 'Tour', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/cropper', Title: 'Image Cropper', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/avatar', Title: 'Avatar', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/components/swiper', Title: 'Swiper', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] }
        ]
      },
    ]
  },
  {
    Path: '', Title: 'Forms', Icon: 'ft-edit', Class: 'has-sub', Badge: 'New', BadgeClass: 'badge badge-pill badge-primary float-right mr-1 mt-1', IsExternalLink: false,
    Submenu: [
      {
        Path: '', Title: 'Elements', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
        Submenu: [
          { Path: '/forms/inputs', Title: 'Inputs', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/input-groups', Title: 'Input Groups', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/radio', Title: 'Radio', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/checkbox', Title: 'Checkbox', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/switch', Title: 'Switch', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/select', Title: 'Select', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/editor', Title: 'Editor', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/tags', Title: 'Input Tags', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/datepicker', Title: 'Datepicker', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/forms/timepicker', Title: 'Timepicker', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
        ]
      },
      { Path: '/forms/layout', Title: 'Layouts', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/forms/validation', Title: 'Validation', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/forms/archwizard', Title: 'Wizard', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] }
    ]
  },
  {
    Path: '', Title: 'Tables', Icon: 'ft-grid', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
    Submenu: [
      { Path: '/tables/basic', Title: 'Basic', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/tables/extended', Title: 'Extended', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/tables/tables', Title: 'Angular', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] }
    ]
  },
  {
    Path: '/datatables', Title: 'Data Tables', Icon: 'ft-layout', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: []
  },
  {
    Path: '', Title: 'Cards', Icon: 'ft-layers', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [
      { Path: '/cards/basic', Title: 'Basic Cards', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/cards/advanced', Title: 'Advanced Cards', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
    ]
  },
  {
    Path: '', Title: 'Maps', Icon: 'ft-map', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
    Submenu: [
      { Path: '/maps/google', Title: 'Google Map', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/maps/fullscreen', Title: 'Full Screen Map', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
    ]
  },
  {
    Path: '', Title: 'Charts', Icon: 'ft-bar-chart-2', Class: 'has-sub', Badge: '2', BadgeClass: 'badge badge-pill badge-success float-right mr-1 mt-1', IsExternalLink: false,
    Submenu: [
      { Path: '/charts/chartjs', Title: 'ChartJs', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/charts/chartist', Title: 'Chartist', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/charts/apex', Title: 'Apex', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/charts/ngx', Title: 'NGX', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
    ]
  },
  {
    Path: '', Title: 'Pages', Icon: 'ft-copy', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
    Submenu: [
      {
        Path: '', Title: 'Authentication', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
        Submenu: [
          { Path: '/pages/forgotpassword', Title: 'Forgot Password', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
          { Path: '/pages/login', Title: 'Login', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
          { Path: '/pages/register', Title: 'Register', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
          { Path: '/pages/lockscreen', Title: 'Lock Screen', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
        ]
      },
      { Path: '/pages/horizontaltimeline', Title: 'Horizontal Timeline', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },

      {
        Path: '', Title: 'Vertical Timeline', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
        Submenu: [
          { Path: '/pages/timeline-vertical-center', Title: 'Center', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/pages/timeline-vertical-left', Title: 'Left', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/pages/timeline-vertical-right', Title: 'Right', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] }
        ]
      },
      {
        Path: '', Title: 'Users', Icon: 'ft-arrow-right submenu-icon', Class: 'has-sub', Badge: '', BadgeClass: '', IsExternalLink: false,
        Submenu: [
          { Path: '/pages/users-list', Title: 'List', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/pages/users-view', Title: 'View', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
          { Path: '/pages/users-edit', Title: 'Edit', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] }
        ]
      },
      { Path: '/pages/account-settings', Title: 'Account Settings', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/pages/profile', Title: 'User Profile', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/pages/invoice', Title: 'Invoice', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/pages/error', Title: 'Error', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
      { Path: '/pages/comingsoon', Title: 'Coming Soon', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
      { Path: '/pages/maintenance', Title: 'Maintenance', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
      { Path: '/pages/gallery', Title: 'Gallery', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/pages/search', Title: 'Search', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/pages/faq', Title: 'FAQ', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
      { Path: '/pages/kb', Title: 'Knowledge Base', Icon: 'ft-arrow-right submenu-icon', Class: '', Badge: '', BadgeClass: '', IsExternalLink: false, Submenu: [] },
    ]
  },
  { Path: 'https://pixinvent.com/apex-angular-4-bootstrap-admin-template/documentation', Title: 'Documentation', Icon: 'ft-book', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
  { Path: 'https://pixinvent.ticksy.com/', Title: 'Support', Icon: 'ft-life-buoy', Class: '', Badge: '', BadgeClass: '', IsExternalLink: true, Submenu: [] },
];
