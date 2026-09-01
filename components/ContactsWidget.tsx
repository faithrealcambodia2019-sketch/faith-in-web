"use client";

import React, { useState } from "react";
import { Search, MoreHorizontal, Plus, Check, ArrowRight } from "lucide-react";

/**
 * Custom FaithIn Chat Bubble Icon featuring the stylized 'F'
 */
export const FaithInChatIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Speech Bubble Outline */}
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    {/* Stylized 'F' */}
    <path d="M10 8.5h4" />
    <path d="M10 12h3" />
    <path d="M10 8.5v7" />
  </svg>
);

export interface ContactItem {
  id: number | string;
  name: string;
  subtitle: string;
  avatarType: "initials" | "image";
  initials?: string;
  bgColor?: string;
  imageUrl?: string;
  isFollowing: boolean;
}

export interface ContactsWidgetProps {
  initialContacts?: ContactItem[];
  className?: string;
  onShowAll?: () => void;
  onChatClick?: (contact: ContactItem) => void;
}

const DEFAULT_CONTACTS: ContactItem[] = [
  {
    id: 1,
    name: "Bible Verse",
    subtitle: "Faithin",
    avatarType: "initials",
    initials: "BV",
    bgColor: "bg-[#2554D7]",
    isFollowing: false,
  },
  {
    id: 2,
    name: "Chhoun P...",
    subtitle: "Faithin",
    avatarType: "image",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    isFollowing: false,
  },
  {
    id: 3,
    name: "Heng Sok",
    subtitle: "Faithin",
    avatarType: "image",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    isFollowing: true,
  },
  {
    id: 4,
    name: "Heng S...",
    subtitle: "Faithin",
    avatarType: "image",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isFollowing: true,
  },
  {
    id: 5,
    name: "Hun Sen",
    subtitle: "Faithin",
    avatarType: "initials",
    initials: "H",
    bgColor: "bg-[#6B72C2]",
    isFollowing: false,
  },
];

export function ContactsWidget({
  initialContacts = DEFAULT_CONTACTS,
  className = "",
  onShowAll,
  onChatClick,
}: ContactsWidgetProps) {
  const [contacts, setContacts] = useState<ContactItem[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleFollow = (id: number | string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFollowing: !c.isFollowing } : c))
    );
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`w-full max-w-[360px] bg-white rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6 font-sans text-left transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[22px] font-bold text-[#111827] tracking-tight">Contacts</h2>
        <div className="flex items-center space-x-1 text-[#6B7280]">
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            aria-label="Search contacts"
          >
            <Search size={19} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            aria-label="More contact options"
          >
            <MoreHorizontal size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2554D7] focus:ring-1 focus:ring-[#2554D7] transition"
            autoFocus
          />
        </div>
      )}

      {/* Contact List */}
      <div className="flex flex-col space-y-3.5">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between py-1">
            {/* Left Side: Avatar & Information */}
            <div className="flex items-center space-x-3.5 min-w-0 pr-2">
              {contact.avatarType === "initials" ? (
                <div
                  className={`w-[46px] h-[46px] rounded-full flex items-center justify-center text-white font-semibold text-[17px] tracking-wide shrink-0 ${
                    contact.bgColor || "bg-[#2554D7]"
                  }`}
                >
                  {contact.initials}
                </div>
              ) : (
                <div className="w-[46px] h-[46px] rounded-full overflow-hidden shrink-0 bg-gray-100">
                  {/* Remote member avatars are user-provided and cannot use a fixed Next image loader. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={contact.imageUrl}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Name & Subtitle */}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[#111827] text-[15px] leading-tight truncate">
                  {contact.name}
                </span>
                <span className="text-[13px] text-[#6B7280] font-normal leading-tight mt-1 truncate">
                  {contact.subtitle}
                </span>
              </div>
            </div>

            {/* Right Side: Follow Button & FaithIn Chat Icon */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleFollow(contact.id)}
                className={`flex items-center justify-center min-w-[92px] h-[34px] px-3.5 rounded-full font-semibold text-[13.5px] transition-all focus:outline-none border-[1.5px] ${
                  contact.isFollowing
                    ? "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50 hover:border-gray-300"
                    : "bg-white text-[#2554D7] border-[#2554D7] hover:bg-blue-50/70"
                }`}
              >
                {contact.isFollowing ? (
                  <>
                    <Check size={14} strokeWidth={2.5} className="mr-1 text-[#6B7280]" /> Following
                  </>
                ) : (
                  <>
                    <Plus size={14} strokeWidth={2.5} className="mr-1 text-[#2554D7]" /> Follow
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onChatClick?.(contact)}
                className="text-[#6B7280] hover:text-[#2554D7] p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label={`Chat with ${contact.name}`}
              >
                <FaithInChatIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="py-6 text-center text-sm text-gray-400">
            No contacts found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-5 mt-2 text-center">
        <button
          type="button"
          onClick={onShowAll}
          className="inline-flex items-center text-[#6B7280] font-semibold text-[14.5px] hover:text-[#111827] transition-colors focus:outline-none group"
        >
          Show all contacts
          <ArrowRight
            size={17}
            strokeWidth={2.3}
            className="ml-1.5 text-[#9CA3AF] group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all"
          />
        </button>
      </div>
    </div>
  );
}

export default ContactsWidget;
