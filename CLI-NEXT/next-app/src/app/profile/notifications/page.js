'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IoArrowBack,
  IoNotifications,
  IoWarning,
  IoStatsChart,
  IoNewspaper,
  IoShieldCheckmark,
  IoPerson,
  IoLeaf,
  IoLocation,
  IoServer
} from 'react-icons/io5';

export default function Notifications() {
  const [settings, setSettings] = useState({
    weatherAlerts: true,
    cropHealth: true,
    marketPrices: false,
    communityUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();
      if (data.preferences) {
        setSettings({
          weatherAlerts: data.preferences.weatherAlerts,
          cropHealth: data.preferences.cropHealth,
          marketPrices: data.preferences.marketPrices,
          communityUpdates: data.preferences.communityUpdates,
          emailNotifications: data.preferences.emailNotifications,
          pushNotifications: data.preferences.pushNotifications,
          smsNotifications: data.preferences.smsNotifications,
        });
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = async (key) => {
    const newValue = !settings[key];

    // Optimistic update
    setSettings({ ...settings, [key]: newValue });
    setIsSaving(true);

    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });
    } catch (error) {
      console.error('Failed to update preference:', error);
      // Revert on error
      setSettings({ ...settings, [key]: !newValue });
    } finally {
      setIsSaving(false);
    }
  };

  const notificationCategories = [
    {
      title: 'Atmospheric Events',
      items: [
        {
          key: 'weatherAlerts',
          label: 'Weather Alerts',
          description: 'Severe weather warnings and forecasts',
          icon: IoWarning,
          color: '#FF6B35',
        },
        {
          key: 'cropHealth',
          label: 'Crop Health',
          description: 'Crop disease and health notifications',
          icon: IoLeaf,
          color: '#00D09C',
        },
      ],
    },
    {
      title: 'Market Intelligence',
      items: [
        {
          key: 'marketPrices',
          label: 'Market Prices',
          description: 'Price fluctuations and market trends',
          icon: IoStatsChart,
          color: '#4D9FFF',
        },
        {
          key: 'communityUpdates',
          label: 'Community Updates',
          description: 'Posts and discussions from farmers',
          icon: IoNewspaper,
          color: '#9D4EDD',
        },
      ],
    },
    {
      title: 'Delivery Channels',
      items: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive updates via email',
          icon: IoServer,
          color: '#FFC857',
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Browser push notifications',
          icon: IoNotifications,
          color: '#00D09C',
        },
        {
          key: 'smsNotifications',
          label: 'SMS Notifications',
          description: 'Text message alerts',
          icon: IoLocation,
          color: '#FF6B35',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen text-white pb-12">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-0">
        {/* Header */}
        <header className="pt-8 pb-4 flex items-center gap-4 md:mb-10">
          <Link href="/profile" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10">
            <IoArrowBack size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Notification Control</h1>
            <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">
              Manage your alert preferences and delivery channels
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading preferences...</div>
          </div>
        ) : (
          <main className="space-y-8">
            {isSaving && (
              <div className="bg-[#00D09C]/10 border border-[#00D09C]/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest">Saving preferences...</p>
              </div>
            )}

            {notificationCategories.map((category) => (
              <div key={category.title} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5">
                <h2 className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase mb-6">{category.title}</h2>
                <div className="space-y-4">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="p-4 rounded-2xl bg-white/5" style={{ color: item.color }}>
                            <Icon size={28} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{item.label}</h3>
                            <p className="text-xs text-white/40 font-medium">{item.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting(item.key)}
                          disabled={isSaving}
                          className={`relative w-16 h-8 rounded-full transition-all ${settings[item.key] ? 'bg-gradient-to-r from-[#00D09C] to-[#4D9FFF]' : 'bg-white/10'
                            }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${settings[item.key] ? 'translate-x-8' : 'translate-x-0'
                              }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Save Confirmation */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/5 text-center">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Preferences are automatically saved
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
