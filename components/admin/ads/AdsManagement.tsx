import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Play, Pause, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Ad } from '../../../firebase/types/ads';
import { getAllAds, toggleAdStatus, toggleAdPause, deleteAd } from '../../../firebase/services/adService';
import { toast } from 'react-toastify';

interface AdsManagementProps {
  onCreateNew: () => void;
  onEditAd: (ad: Ad) => void;
  onViewAd: (ad: Ad) => void;
}

const AdsManagement: React.FC<AdsManagementProps> = ({ onCreateNew, onEditAd, onViewAd }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'inactive'>('all');

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const adsData = await getAllAds();
      setAds(adsData);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adId: string) => {
    try {
      await toggleAdStatus(adId);
      toast.success('Ad status updated successfully');
      loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const handleTogglePause = async (adId: string) => {
    try {
      await toggleAdPause(adId);
      toast.success('Ad pause status updated successfully');
      loadAds();
    } catch (error) {
      console.error('Error toggling ad pause:', error);
      toast.error('Failed to update ad pause status');
    }
  };

  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${adTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAd(adId);
      toast.success('Ad deleted successfully');
      loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && ad.isActive && !ad.isPaused) ||
                         (filterStatus === 'paused' && ad.isPaused) ||
                         (filterStatus === 'inactive' && !ad.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (ad: Ad) => {
    if (!ad.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    if (ad.isPaused) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Paused</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-primary]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[--color-text-primary]">Ads Management</h2>
          <p className="text-[--color-text-secondary]">Create and manage advertising campaigns</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Ad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[--color-text-secondary]">Total Ads</p>
                <p className="text-2xl font-bold text-[--color-text-primary]">{ads.length}</p>
              </div>
              <Eye className="w-6 h-6 text-[--color-text-secondary]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[--color-text-secondary]">Active Ads</p>
                <p className="text-2xl font-bold text-green-600">
                  {ads.filter(ad => ad.isActive && !ad.isPaused).length}
                </p>
              </div>
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[--color-text-secondary]">Total Views</p>
                <p className="text-2xl font-bold text-[--color-text-primary]">
                  {ads.reduce((sum, ad) => sum + (ad.totalViews || 0), 0)}
                </p>
              </div>
              <Users className="w-6 h-6 text-[--color-text-secondary]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[--color-text-secondary]">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ads.length > 0 
                    ? Math.round((ads.reduce((sum, ad) => sum + (ad.totalCompletions || 0), 0) / 
                        ads.reduce((sum, ad) => sum + (ad.totalViews || 0), 0)) * 100) || 0
                    : 0}%
                </p>
              </div>
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[--color-text-secondary] w-4 h-4" />
            <Input
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-[--color-border] rounded-lg bg-[--color-bg-primary] text-[--color-text-primary]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{ad.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {ad.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusBadge(ad)}
                    <div className="relative group">
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-8 bg-[--color-bg-primary] border border-[--color-border] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[150px]">
                        <button
                          onClick={() => onViewAd(ad)}
                          className="w-full px-3 py-2 text-left hover:bg-[--color-bg-secondary] flex items-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => onEditAd(ad)}
                          className="w-full px-3 py-2 text-left hover:bg-[--color-bg-secondary] flex items-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePause(ad.id)}
                          className="w-full px-3 py-2 text-left hover:bg-[--color-bg-secondary] flex items-center gap-2 text-sm"
                        >
                          {ad.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          {ad.isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(ad.id)}
                          className="w-full px-3 py-2 text-left hover:bg-[--color-bg-secondary] flex items-center gap-2 text-sm"
                        >
                          {ad.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <hr className="my-1 border-[--color-border]" />
                        <button
                          onClick={() => handleDeleteAd(ad.id, ad.title)}
                          className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Preview Image */}
                  {ad.previewImage && (
                    <div className="aspect-video bg-[--color-bg-secondary] rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={ad.previewImage} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-[--color-text-secondary] text-sm">No preview</div>
                    </div>
                  )}
                  
                  {/* Ad Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[--color-text-secondary]">Questions</p>
                      <p className="font-semibold text-[--color-text-primary]">{ad.questions.length}</p>
                    </div>
                    <div>
                      <p className="text-[--color-text-secondary]">Total Reward</p>
                      <p className="font-semibold text-[--color-text-primary]">{ad.totalReward} coins</p>
                    </div>
                    <div>
                      <p className="text-[--color-text-secondary]">Views</p>
                      <p className="font-semibold text-[--color-text-primary]">{ad.totalViews || 0}</p>
                    </div>
                    <div>
                      <p className="text-[--color-text-secondary]">Completions</p>
                      <p className="font-semibold text-[--color-text-primary]">{ad.totalCompletions || 0}</p>
                    </div>
                  </div>
                  
                  {/* Ad Type */}
                  <div className="flex items-center justify-between text-xs text-[--color-text-secondary]">
                    <span>{ad.isOneTimePerUser ? 'One-time per user' : `Max ${ad.maxDailyViews}/day`}</span>
                    <span>Created {new Date(ad.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAds.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-[--color-bg-secondary] rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-12 h-12 text-[--color-text-secondary]" />
          </div>
          <h3 className="text-lg font-semibold text-[--color-text-primary] mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No ads found' : 'No ads created yet'}
          </h3>
          <p className="text-[--color-text-secondary] mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first ad to start earning revenue from user engagement'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <Button onClick={onCreateNew}>Create Your First Ad</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdsManagement;
