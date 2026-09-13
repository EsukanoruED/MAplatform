import type { CSSProperties } from 'react';

/** Slash-separated hierarchy trail, 12px, muted except the current page. */
export interface BreadcrumbProps {
  items?: Array<string | { label: string; href?: string }>;
  style?: CSSProperties;
}
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
