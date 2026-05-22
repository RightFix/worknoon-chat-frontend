import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { Button, Input, Avatar } from '../components/Common';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userAPI.updateUser(user!.id, {
        username: formData.username,
        avatar: formData.avatar,
      });
      if (response.success && response.data) {
        updateUser(response.data as any);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Settings</h1>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <Avatar src={formData.avatar} alt={formData.username} size="xl" />
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, avatar: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            leftIcon={<User className="w-5 h-5" />}
          />

          <Input
            label="Email"
            value={user.email}
            disabled
            leftIcon={<Mail className="w-5 h-5" />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Role
            </label>
            <div className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-dark-input text-gray-600 dark:text-gray-400 capitalize">
              {user.role}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;