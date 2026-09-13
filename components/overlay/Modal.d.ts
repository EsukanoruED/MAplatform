import type { ReactNode, CSSProperties } from 'react';

/** Centred dialog on a 56%-opacity ink scrim with a 2px backdrop blur. Escape and scrim-click both close. */
export interface ModalProps {
  /** @default true */
  open?: boolean;
  title?: ReactNode;
  /** One-line explanation under the title. */
  description?: ReactNode;
  onClose?: () => void;
  /** Right-aligned action row on a tinted strip. */
  footer?: ReactNode;
  /** Max width in px. @default 520 */
  width?: number;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Modal(props: ModalProps): JSX.Element;
