/**
 * Lucide glyph registry.
 *
 * The prototype looked icons up by kebab-case name on a `window.lucide` global
 * supplied by a CDN UMD build. The real app imports them from `lucide-react`
 * instead. Icons are registered explicitly rather than via a namespace import so
 * the bundler can tree-shake everything the product does not use.
 *
 * To use a new glyph: add its named import below and one entry to `iconRegistry`
 * keyed by the kebab-case name. See https://lucide.dev/icons for the catalogue.
 */
import {
  ArrowLeft, ArrowRight, Bell, Building, Building2, CalendarCheck, CalendarClock,
  Check, ChevronUp, ClipboardCheck, Clock, Construction, Download, Ear, FileBadge,
  FileText, Globe, GraduationCap, HardHat, Image, LayoutDashboard, Loader, Lock,
  LogOut, Mail, MapPin, Package, Phone, PhoneCall, Plus, Printer, Search, Settings,
  ShieldCheck, Siren, Stethoscope, TriangleAlert, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const iconRegistry: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  bell: Bell,
  building: Building,
  'building-2': Building2,
  'calendar-check': CalendarCheck,
  'calendar-clock': CalendarClock,
  check: Check,
  'chevron-up': ChevronUp,
  'clipboard-check': ClipboardCheck,
  clock: Clock,
  construction: Construction,
  download: Download,
  ear: Ear,
  'file-badge': FileBadge,
  'file-text': FileText,
  globe: Globe,
  'graduation-cap': GraduationCap,
  'hard-hat': HardHat,
  image: Image,
  'layout-dashboard': LayoutDashboard,
  loader: Loader,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  'map-pin': MapPin,
  package: Package,
  phone: Phone,
  'phone-call': PhoneCall,
  plus: Plus,
  printer: Printer,
  search: Search,
  settings: Settings,
  'shield-check': ShieldCheck,
  siren: Siren,
  stethoscope: Stethoscope,
  'triangle-alert': TriangleAlert,
  users: Users,
};
