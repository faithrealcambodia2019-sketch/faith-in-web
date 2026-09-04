import React from 'react';
import { Search, ChevronDown, Settings, Key, UserCircle, Lock, ShieldAlert, Flag } from 'lucide-react';
import type { Metadata } from 'next';
import { site } from '@/lib/site-content';

export const metadata: Metadata = {
  title: `Help Center — ${site.name}`,
};

const sidebarItems = [
  { name: 'Using Platform', icon: Settings },
  { name: 'Login, Recovery and Security', icon: Key },
  { name: 'Managing Your Account', icon: UserCircle },
  { name: 'Privacy and Safety', icon: Lock },
  { name: 'Policies', icon: ShieldAlert },
  { name: 'Reporting', icon: Flag },
];

const topics = [
  {
    title: 'Account Settings',
    desc: 'Adjust settings, manage notifications, learn about name changes and more.',
    icon: '📝',
  },
  {
    title: 'Login, Recovery and Security',
    desc: 'Fix login issues and learn how to change or reset your password.',
    icon: '🔑',
  },
  {
    title: 'Privacy and Safety',
    desc: 'Control who can see what you share and add extra protection to your account.',
    icon: '🔒',
  },
  {
    title: 'Marketplace & Pages',
    desc: 'Discover and buy items, or manage your organization pages.',
    icon: '🏪',
  },
  {
    title: 'Groups & Community',
    desc: 'Connect with people who share your interests and join active groups.',
    icon: '👥',
  },
  {
    title: 'Policies and Reporting',
    desc: 'Learn about our community standards and how to report violations.',
    icon: '🚩',
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white flex relative text-slate-900">
      {/* Feedback Button (Fixed to left edge) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white font-semibold py-3 px-2 rounded-r-md cursor-pointer hover:bg-blue-700 transition-colors z-50 flex items-center justify-center shadow-md border border-blue-500">
        <span className="[writing-mode:vertical-lr] rotate-180 text-sm tracking-widest flex items-center gap-2">
          Feedback
        </span>
      </div>

      {/* Sidebar */}
      <aside className="w-[300px] border-r border-slate-200 hidden lg:block shrink-0 h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto bg-white py-6">
        <nav className="space-y-1">
          {sidebarItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-800 text-[15px]">{item.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 lg:px-12 bg-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">How can we help you?</h1>
          
          {/* Search Bar */}
          <div className="relative mb-14">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full bg-[#F0F2F5] text-slate-900 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium placeholder:text-slate-500 placeholder:font-normal"
            />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-6">Popular Topics</h2>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {topics.map((topic, i) => (
              <div
                key={i}
                className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col items-start text-left"
              >
                {/* Center Image / Emoji */}
                <div className="w-full flex justify-center mb-8 pt-4">
                  <div className="text-7xl drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {topic.icon}
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 text-[17px] mb-2 leading-tight">{topic.title}</h3>
                <p className="text-slate-500 text-[14px] leading-snug">
                  {topic.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
