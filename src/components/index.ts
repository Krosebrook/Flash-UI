// Components index
// Central export point for all components

// Layout components
export { AppShell } from './layout';
export type { AppShellProps } from './layout';

// Shared components
export {
  Badge,
  Card,
  CardHeader,
  CardBody,
  Callout,
  ArtifactCard,
  ArtifactGrid,
  PreviewCard,
  FloatingActionBar,
  UtilityBar,
  UtilityButton,
  NavHandle,
  EmptyState,
  CardSkeleton,
  LoadingDots,
} from './shared';

// Shared component types
export type {
  BadgeProps,
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CalloutProps,
  ArtifactCardProps,
  ArtifactGridProps,
  PreviewCardProps,
  ActionButton,
  FloatingActionBarProps,
  UtilityBarProps,
  UtilityButtonProps,
  NavHandleProps,
  EmptyStateProps,
} from './shared';

// Icons
export {
  ThinkingIcon,
  CodeIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  GridIcon,
  CopyIcon,
  CheckIcon,
  WarningIcon,
  RotateCcwIcon,
  PlusIcon,
} from './Icons';

// Background effects
export { default as DottedGlowBackground } from './DottedGlowBackground';
