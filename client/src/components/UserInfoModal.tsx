import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Validation functions
const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + or is a valid number
  if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
    return { valid: false, error: 'Phone must be 7-15 digits (can start with +)' };
  }
  
  return { valid: true };
};

export default function UserInfoModal({ isOpen, onClose, onSubmit }: UserInfoModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
    email: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = trpc.submissions.create.useMutation({
    onSuccess: () => {
      toast.success('✅ Information submitted successfully!');
      setFormData({ fullName: '', phone: '', country: '', email: '' });
      setSearchTerm('');
      setErrors({});
      onSubmit();
      onClose();
    },
    onError: (error) => {
      toast.error(`❌ ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Invalid phone number';
      }
    }

    // Validate country
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Invalid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('❌ Please fix the errors below');
      return;
    }

    setIsSubmitting(true);
    await submitMutation.mutateAsync(formData);
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({ ...errors, email: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black border-2 border-neon-cyan/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neon-cyan">
            ⚡ User Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-neon-cyan mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full px-4 py-2 bg-black border-2 rounded-lg focus:outline-none transition-all text-white ${
                errors.fullName
                  ? 'border-red-500 focus:shadow-lg focus:shadow-red-500/50'
                  : 'border-neon-cyan/30 focus:border-neon-cyan focus:shadow-lg focus:shadow-neon-cyan/50'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                <AlertCircle size={14} />
                {errors.fullName}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-neon-cyan mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`w-full px-4 py-2 bg-black border-2 rounded-lg focus:outline-none transition-all text-white ${
                errors.phone
                  ? 'border-red-500 focus:shadow-lg focus:shadow-red-500/50'
                  : 'border-neon-cyan/30 focus:border-neon-cyan focus:shadow-lg focus:shadow-neon-cyan/50'
              }`}
              placeholder="e.g., +1 (555) 123-4567 or 5551234567"
            />
            {errors.phone && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                <AlertCircle size={14} />
                {errors.phone}
              </div>
            )}
            <p className="text-gray-400 text-xs mt-1">Format: 7-15 digits, can include +, -, spaces, ()</p>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-neon-cyan mb-2">
              Country *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className={`w-full px-4 py-2 bg-black border-2 rounded-lg focus:outline-none transition-all flex justify-between items-center text-white ${
                  errors.country
                    ? 'border-red-500 focus:shadow-lg focus:shadow-red-500/50'
                    : 'border-neon-cyan/30 focus:border-neon-cyan focus:shadow-lg focus:shadow-neon-cyan/50'
                }`}
              >
                <span>{formData.country || 'Select country...'}</span>
                <ChevronDown size={18} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {errors.country && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {errors.country}
                </div>
              )}

              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black border-2 border-neon-cyan/50 rounded-lg shadow-lg shadow-neon-cyan/30 z-50 max-h-48 overflow-hidden flex flex-col">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-black border-b-2 border-neon-cyan/30 text-white focus:outline-none"
                  />
                  <div className="overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, country });
                            setShowCountryDropdown(false);
                            setSearchTerm('');
                            if (errors.country) {
                              setErrors({ ...errors, country: '' });
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-white hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors"
                        >
                          {country}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-400">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neon-cyan mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full px-4 py-2 bg-black border-2 rounded-lg focus:outline-none transition-all text-white ${
                errors.email
                  ? 'border-red-500 focus:shadow-lg focus:shadow-red-500/50'
                  : 'border-neon-cyan/30 focus:border-neon-cyan focus:shadow-lg focus:shadow-neon-cyan/50'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                <AlertCircle size={14} />
                {errors.email}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-neon-cyan text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-neon-cyan/60 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-neon-cyan/20 text-neon-cyan font-bold py-3 rounded-lg border-2 border-neon-cyan/50 hover:bg-neon-cyan/40 transition-all active:scale-95"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
