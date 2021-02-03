// Sidebar route metadata
export interface RouteInfo {
    Path: string;
    Title: string;
    Icon: string;
    Class: string;
    Badge?: string;
    BadgeClass?: string;
    IsExternalLink: boolean;
    Submenu : RouteInfo[];
}
