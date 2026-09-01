"use client";
import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    displayName: 'Hun Chet',
    role: '',
    location: '',
    industry: '',
    church: '',
    ministry: '',
    about: '',
    profilePhoto: null,
    coverPhoto: null
  });

  const [previews, setPreviews] = useState({
    profile: null,
    cover: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        [type === 'profile' ? 'profilePhoto' : 'coverPhoto']: file 
      }));
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [type]: url }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Segoe_UI',_Helvetica,_Arial,_sans-serif]">
      {/* Modal Container */}
      <div className="w-full max-w-[700px] bg-white rounded-[8px] shadow-[0_12px_28px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative flex flex-col items-center justify-center px-6 py-4 border-b border-[#e5e5e5]">
          <h2 className="text-[20px] font-bold text-[#1c1e21] leading-tight">Edit your profile</h2>
          <p className="text-[14px] text-[#65676b] mt-1">These details are saved to Firebase and shown across the platform.</p>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] transition-colors text-[#65676b]"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form className="space-y-6">
            
            {/* Visual Cover Photo Uploader */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[16px] font-bold text-[#1c1e21]">
                  Cover photo
                </label>
              </div>
              <label className="relative flex w-full h-[150px] bg-[#f0f2f5] rounded-[8px] border border-[#ccd0d5] cursor-pointer overflow-hidden group">
                {previews.cover ? (
                  // Local object/data URL preview; Next Image cannot optimize it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews.cover} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#bcc0c4]">
                    {/* Empty placeholder background */}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-[#1c1e21] flex items-center gap-2 shadow-sm font-semibold text-[14px]">
                    <Camera size={18} /> Edit Cover Photo
                  </div>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, 'cover')} 
                />
              </label>
            </div>

            {/* Visual Profile Photo Uploader */}
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                <label className="block text-[16px] font-bold text-[#1c1e21]">
                  Profile photo
                </label>
              </div>
              <label className="relative flex w-[120px] h-[120px] bg-[#f0f2f5] rounded-full border border-[#ccd0d5] cursor-pointer overflow-hidden group shadow-sm">
                {previews.profile ? (
                  // Local object/data URL preview; Next Image cannot optimize it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews.profile} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#e4e6eb] text-[#bcc0c4]">
                    <svg className="w-16 h-16 mt-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="bg-black/60 p-2.5 rounded-full text-white">
                    <Camera size={22} />
                  </div>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, 'profile')} 
                />
              </label>
            </div>

            {/* Display name */}
            <div>
              <label htmlFor="displayName" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                Display name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] transition-colors"
              />
            </div>

            {/* Role & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="role" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] transition-colors"
                />
              </div>
            </div>

            {/* Industry & Church */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="industry" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="church" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                  Church
                </label>
                <input
                  type="text"
                  id="church"
                  name="church"
                  value={formData.church}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] transition-colors"
                />
              </div>
            </div>

            {/* Ministry */}
            <div>
              <label htmlFor="ministry" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                Ministry
              </label>
              <input
                type="text"
                id="ministry"
                name="ministry"
                value={formData.ministry}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] transition-colors"
              />
            </div>

            {/* About */}
            <div>
              <label htmlFor="about" className="block text-[15px] font-bold text-[#1c1e21] mb-1.5">
                About
              </label>
              <textarea
                id="about"
                name="about"
                rows={3}
                value={formData.about}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#ccd0d5] rounded-md text-[#1c1e21] focus:bg-white focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-[15px] resize-none transition-colors"
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#e5e5e5] gap-3 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-[15px] font-bold text-[#4b4f56] bg-[#e4e6eb] hover:bg-[#d8dadf] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button className="px-8 py-2 text-[15px] font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] rounded-md transition-colors">
            Save profile
          </button>
        </div>

      </div>
    </div>
  );
}
