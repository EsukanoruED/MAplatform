/**
 * Medical Alliance design system — public surface.
 *
 * Import components from here, never from the files inside the category folders
 * (the migrated `_adherence` lint config enforces that). This barrel replaces the
 * prototype's `window.MedicalAllianceDesignSystem_32f8e4` global namespace.
 */

// brand
export { Icon } from './brand/Icon';
export type { IconProps } from './brand/Icon';
export { iconRegistry } from './brand/icon-registry';
export { SectionHeading } from './brand/SectionHeading';
export type { SectionHeadingProps } from './brand/SectionHeading';

// core
export { Badge } from './core/Badge';
export type { BadgeProps } from './core/Badge';
export { Button } from './core/Button';
export type { ButtonProps } from './core/Button';
export { Card } from './core/Card';
export type { CardProps } from './core/Card';
export { IconButton } from './core/IconButton';
export type { IconButtonProps } from './core/IconButton';
export { Logo } from './core/Logo';
export type { LogoProps } from './core/Logo';
export { Tag } from './core/Tag';
export type { TagProps } from './core/Tag';

// data
export { DataTable } from './data/DataTable';
export type { DataTableProps, DataTableColumn, DataTableRow } from './data/DataTable';
export { StatTile } from './data/StatTile';
export type { StatTileProps } from './data/StatTile';

// feedback
export { Alert } from './feedback/Alert';
export type { AlertProps } from './feedback/Alert';
export { ProgressMeter } from './feedback/ProgressMeter';
export type { ProgressMeterProps } from './feedback/ProgressMeter';
export { Toast } from './feedback/Toast';
export type { ToastProps } from './feedback/Toast';
export { Tooltip } from './feedback/Tooltip';
export type { TooltipProps } from './feedback/Tooltip';

// forms
export { Checkbox } from './forms/Checkbox';
export type { CheckboxProps } from './forms/Checkbox';
export { Radio } from './forms/Radio';
export type { RadioProps } from './forms/Radio';
export { SelectField } from './forms/SelectField';
export type { SelectFieldProps } from './forms/SelectField';
export { Switch } from './forms/Switch';
export type { SwitchProps } from './forms/Switch';
export { TextField } from './forms/TextField';
export type { TextFieldProps } from './forms/TextField';

// navigation
export { Breadcrumb } from './navigation/Breadcrumb';
export type { BreadcrumbProps } from './navigation/Breadcrumb';
export { Tabs } from './navigation/Tabs';
export type { TabsProps } from './navigation/Tabs';

// overlay
export { Modal } from './overlay/Modal';
export type { ModalProps } from './overlay/Modal';
