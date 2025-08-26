import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Save, X, Building, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { updateUserProfile } from '../../firebase/services/userService';
import { toast } from 'react-hot-toast';

interface InlineProfileUpdateProps {
  userId: string;
  currentPhone?: string;
  currentCity?: string;
  currentCountry?: string;
  onUpdate: (phone: string, city: string, country: string) => void;
  onCancel: () => void;
}

export const InlineProfileUpdate: React.FC<InlineProfileUpdateProps> = ({
  userId,
  currentPhone = '',
  currentCity = '',
  currentCountry = '',
  onUpdate,
  onCancel
}) => {
  const [phone, setPhone] = useState(currentPhone);
  const [city, setCity] = useState(currentCity);
  const [country, setCountry] = useState(currentCountry);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!city.trim()) {
      toast.error('City is required');
      return;
    }

    if (!country.trim()) {
      toast.error('Country is required');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsUpdating(true);
    try {
      // Update the user profile with phone, city, and country
      await updateUserProfile(userId, {
        phone: phone.trim(),
        city: city.trim(),
        country: country.trim()
      });

      toast.success('Contact details updated successfully!');
      onUpdate(phone.trim(), city.trim(), country.trim());
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update contact details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Complete Your Profile</h3>
          <p className="text-sm text-gray-300">
            We need your contact details to process your ad completion reward.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="inline-phone" className="text-white flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number *
          </Label>
          <Input
            id="inline-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            disabled={isUpdating}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="inline-city" className="text-white flex items-center gap-2">
            <Building className="w-4 h-4" />
            City *
          </Label>
          <Input
            id="inline-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Rahim Yar Khan"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            disabled={isUpdating}
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="inline-country" className="text-white flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Country *
          </Label>
          <Input
            id="inline-country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Pakistan"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            disabled={isUpdating}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={isUpdating || !phone.trim() || !city.trim() || !country.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Continue
              </>
            )}
          </Button>
          
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isUpdating}
            className="px-4 border-white/20 text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <strong>Why do we need this?</strong> Your contact details are shared with advertisers 
          so they can follow up on their campaigns and provide you with relevant offers.
        </p>
      </div>
    </motion.div>
  );
};