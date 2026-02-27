'use client';

import Card from '@/components/global/Card';
import Button from '@/components/global/Button';
import Input from '@/components/global/Input';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
        <div className="space-y-4">
          <Input label="Full Name" placeholder="John Doe" />
          <Input label="Email" type="email" placeholder="john@example.com" />
          <Input label="Bio" placeholder="Tell us about yourself" />
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-600 bg-gray-800" />
              <span className="text-gray-300">Email notifications for achievements</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-600 bg-gray-800" />
              <span className="text-gray-300">Daily summary email</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-800" />
              <span className="text-gray-300">Push notifications</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>
        <div className="space-y-4">
          <p className="text-gray-400">Irreversible actions</p>
          <Button variant="danger">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
