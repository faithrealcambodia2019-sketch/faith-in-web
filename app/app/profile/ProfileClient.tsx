"use client";
import React, { useState } from 'react';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfilePageClient({ user, postCount }: { user: any, postCount: number }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <section className="space-y-4 min-w-0" id="profile">
        <div className="card overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-800">
            {/* Cover photo placeholder */}
          </div>
          
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex justify-between items-end">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold">
                {user?.name?.charAt(0) || "FI"}
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Faith In User"}</h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center sm:text-left sm:flex sm:gap-12">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{postCount}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{postCount * 3 + 2}</div>
                  <div className="text-sm text-gray-500">Profile Viewers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <EditProfileModal onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
