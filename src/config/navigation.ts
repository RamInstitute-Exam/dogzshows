import { 
  Home, Users, Dog, Calendar, Activity, Bell, Settings, 
  BarChart, Image, Video, Shield, Award, FileText, LayoutTemplate, 
  Mail, CreditCard, LifeBuoy, FileBadge, Download, CheckCircle, Database
} from 'lucide-react';

export const ADMIN_ROUTES = [
  { name: 'Dashboard', href: '/admin', icon: Home, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Events & Clubs', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'], children: [
    { name: 'All Events', href: '/admin/events' },
    { name: 'Create Event', href: '/admin/events/create' },
    { name: 'Club Management', href: '/admin/events/clubs' },
    { name: 'Venue Management', href: '/admin/events/venues' },
    { name: 'Registration List', href: '/admin/events/registrations' },
    { name: 'Waiting List', href: '/admin/events/waitlist' },
    { name: 'Live Competition', href: '/admin/events/live' },
  ]},
  { name: 'Users & Roles', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'Users List', href: '/admin/users' },
    { name: 'Role Management', href: '/admin/users/roles' },
    { name: 'Sub Admins', href: '/admin/users/subadmins' },
    { name: 'Event Managers', href: '/admin/users/managers' },
    { name: 'Login History', href: '/admin/users/history' },
  ]},
  { name: 'Dog Database', icon: Dog, roles: ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'], children: [
    { name: 'All Dogs', href: '/admin/dogs' },
    { name: 'Add Dog', href: '/admin/dogs/add' },
    { name: 'Champion Status', href: '/admin/dogs/champions' },
    { name: 'OCR Verification', href: '/admin/dogs/ocr' },
    { name: 'Pedigree', href: '/admin/dogs/pedigree' },
  ]},
  { name: 'Competition Engine', icon: Trophy, roles: ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN', 'EVENT_MANAGER', 'JUDGE'], children: [
    { name: 'Competition Setup', href: '/admin/competition/setup' },
    { name: 'Ring Management', href: '/admin/competition/rings' },
    { name: 'Live Scoreboard', href: '/admin/competition/scoreboard' },
    { name: 'Final Results', href: '/admin/competition/results' },
    { name: 'Best in Show', href: '/admin/competition/bis' },
  ]},
  { name: 'Payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'Transactions', href: '/admin/payments/transactions' },
    { name: 'Refunds', href: '/admin/payments/refunds' },
    { name: 'GST Reports', href: '/admin/payments/gst' },
    { name: 'Invoices', href: '/admin/payments/invoices' },
  ]},
  { name: 'Photography', icon: Image, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'Albums', href: '/admin/photography/albums' },
    { name: 'Bulk Upload', href: '/admin/photography/upload' },
    { name: 'AI Tagging', href: '/admin/photography/tagging' },
  ]},
  { name: 'Videography', icon: Video, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'Videos', href: '/admin/videography' },
    { name: 'Live Streams', href: '/admin/videography/live' },
  ]},
  { name: 'Judges', icon: Award, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'Judge Profiles', href: '/admin/judges' },
    { name: 'Judge Assignments', href: '/admin/judges/assignments' },
    { name: 'Judge Ratings', href: '/admin/judges/ratings' },
  ]},
  { name: 'Breeds', icon: Database, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'FCI Groups', href: '/admin/breeds/fci' },
    { name: 'Breed Master', href: '/admin/breeds/master' },
  ]},
  { name: 'Media Library', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'], href: '/admin/media' },
  { name: 'Website CMS', icon: LayoutTemplate, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'Homepage', href: '/admin/cms/homepage' },
    { name: 'Blogs', href: '/admin/cms/blogs' },
    { name: 'Testimonials', href: '/admin/cms/testimonials' },
    { name: 'SEO', href: '/admin/cms/seo' },
  ]},
  { name: 'Notifications', icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'], children: [
    { name: 'Campaigns', href: '/admin/notifications/campaigns' },
    { name: 'History', href: '/admin/notifications/history' },
  ]},
  { name: 'Reports', icon: BarChart, roles: ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'], href: '/admin/reports' },
  { name: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'], children: [
    { name: 'General', href: '/admin/settings/general' },
    { name: 'Payment Gateway', href: '/admin/settings/payments' },
    { name: 'Security', href: '/admin/settings/security' },
  ]},
];

export const USER_ROUTES = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['USER', 'BREEDER', 'OWNER'] },
  { name: 'My Profile', href: '/dashboard/profile', icon: Users, roles: ['USER', 'BREEDER', 'OWNER'] },
  { name: 'My Dogs', icon: Dog, roles: ['USER', 'BREEDER', 'OWNER'], children: [
    { name: 'All Dogs', href: '/dashboard/dogs' },
    { name: 'Add Dog', href: '/dashboard/dogs/add' },
    { name: 'Upload KCI', href: '/dashboard/dogs/kci' },
    { name: 'Certificates', href: '/dashboard/dogs/certificates' },
  ]},
  { name: 'My Events', icon: Calendar, roles: ['USER', 'BREEDER', 'OWNER'], children: [
    { name: 'Upcoming Events', href: '/dashboard/events/upcoming' },
    { name: 'Registered Events', href: '/dashboard/events/registered' },
    { name: 'Past Events', href: '/dashboard/events/past' },
  ]},
  { name: 'Payments', icon: CreditCard, roles: ['USER', 'BREEDER', 'OWNER'], children: [
    { name: 'Invoices', href: '/dashboard/payments/invoices' },
    { name: 'Refunds', href: '/dashboard/payments/refunds' },
  ]},
  { name: 'Winner Tags', href: '/dashboard/winners', icon: Award, roles: ['USER', 'BREEDER', 'OWNER'] },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['USER', 'BREEDER', 'OWNER'] },
  { name: 'Downloads', href: '/dashboard/downloads', icon: Download, roles: ['USER', 'BREEDER', 'OWNER'] },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy, roles: ['USER', 'BREEDER', 'OWNER'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['USER', 'BREEDER', 'OWNER'] },
];

// Placeholder fix for missing Trophy icon
import { Trophy } from 'lucide-react';
