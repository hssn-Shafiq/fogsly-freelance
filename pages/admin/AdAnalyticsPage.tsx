import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  DollarSign, 
  Users, 
  Building2,
  Search,
  XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { getAdAnalytics, getAdById } from '../../firebase/services/adService';
import { Ad } from '../../firebase/types/ads';
import { type Route } from '../../types';
import { toast } from 'react-hot-toast';

interface AdAnalyticsPageProps {
  navigate: (route: Route | string) => void;
  adId?: string;
}

interface AdViewer {
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  correctAnswers: number;
  totalQuestions: number;
  earnedAmount: number;
  watchedAt: Date;
  completedAt?: Date;
}

const AdAnalyticsPage: React.FC<AdAnalyticsPageProps> = ({ navigate }) => {
  // Get adId from URL pathname instead of useParams
  const getAdIdFromUrl = (): string | null => {
    const pathname = window.location.pathname;
    const matches = pathname.match(/admin\/ad-analytics\/(.+)/);
    return matches ? matches[1] : null;
  };

  const adId = getAdIdFromUrl();
  const [ad, setAd] = useState<Ad | null>(null);
  const [viewers, setViewers] = useState<AdViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to convert Firestore timestamp to Date
  const convertTimestampToDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If it's a Firestore Timestamp
    if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }
    
    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    // Fallback
    return new Date();
  };

  useEffect(() => {
    const loadData = async () => {
      if (!adId) {
        setError('Ad ID not provided');
        setLoading(false);
        return;
      }

      try {
        const [analyticsData, adData] = await Promise.all([
          getAdAnalytics(adId),
          getAdById(adId)
        ]);

        if (!analyticsData || !adData) {
          setError('Ad not found');
          setLoading(false);
          return;
        }

        // Convert timestamps to proper Date objects
        const convertedAd = {
          ...adData,
          createdAt: convertTimestampToDate(adData.createdAt),
          updatedAt: convertTimestampToDate(adData.updatedAt)
        };

        // Convert viewer timestamps
        const convertedViewers = analyticsData.viewerDetails?.map((viewer: any) => ({
          ...viewer,
          watchedAt: convertTimestampToDate(viewer.watchedAt),
          completedAt: viewer.completedAt ? convertTimestampToDate(viewer.completedAt) : undefined
        })) || [];

        setAd(convertedAd);
        setViewers(convertedViewers);
        setLoading(false);
      } catch (err) {
        console.error('Error loading ad analytics:', err);
        setError('Failed to load ad analytics');
        setLoading(false);
      }
    };

    loadData();
  }, [adId]);

  // Filter viewers based on search
  const filteredViewers = viewers.filter(viewer =>
    viewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viewer.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viewer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viewer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadUserDetails = (viewer: AdViewer) => {
    const csvContent = [
      'Name,Email,Phone,Country,City,Correct Answers,Total Questions,Earned Amount,Watched At',
      `${viewer.name},${viewer.email},${viewer.phone},${viewer.country},${viewer.city},${viewer.correctAnswers},${viewer.totalQuestions},${viewer.earnedAmount},${viewer.watchedAt.toLocaleString()}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${viewer.name.replace(/[^a-zA-Z0-9]/g, '_')}_details.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Downloaded details for ${viewer.name}`);
  };

  const downloadAllViewers = () => {
    if (!viewers.length) {
      toast.error('No viewer data to download');
      return;
    }

    const csvContent = [
      'Name,Email,Phone,Country,City,Correct Answers,Total Questions,Earned Amount,Watched At',
      ...viewers.map(viewer =>
        `${viewer.name},${viewer.email},${viewer.phone},${viewer.country},${viewer.city},${viewer.correctAnswers},${viewer.totalQuestions},${viewer.earnedAmount},${viewer.watchedAt.toLocaleString()}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ad?.title.replace(/[^a-zA-Z0-9]/g, '_')}_all_viewers.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Downloaded all viewer details');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="bg-red-500/10 border-red-500/20 max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={() => navigate('admin')} variant="outline">
              Back to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalEarningsDistributed = viewers.reduce((sum, viewer) => sum + viewer.earnedAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('admin')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{ad.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {ad.companyName || 'Unknown Company'}
              </Badge>
              <Badge variant={ad.isActive ? "default" : "secondary"}>
                {ad.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-gray-400 text-sm">
                Created {ad.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>

          <Button
            onClick={downloadAllViewers}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            disabled={!viewers.length}
          >
            <Download className="w-4 h-4" />
            Download All
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{ad.totalViews?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Completions</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{viewers.length.toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Earnings Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalEarningsDistributed.toLocaleString()} FOG</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Reward per View</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{ad.totalReward} FOG</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Viewers Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Viewers ({viewers.length})
              </CardTitle>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search viewers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredViewers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm ? 'No viewers found matching your search.' : 'No viewers yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Phone Number</TableHead>
                      <TableHead className="text-gray-300">Correct Answers</TableHead>
                      <TableHead className="text-gray-300">Country</TableHead>
                      <TableHead className="text-gray-300">State/City</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViewers.map((viewer) => (
                      <TableRow key={viewer.userId} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white font-medium">{viewer.name}</TableCell>
                        <TableCell className="text-gray-300">{viewer.email}</TableCell>
                        <TableCell className="text-gray-300">{viewer.phone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-white">
                              {viewer.correctAnswers}/{viewer.totalQuestions}
                            </span>
                            <Badge 
                              variant={(viewer.correctAnswers / viewer.totalQuestions) >= 0.8 ? "default" : 
                                     (viewer.correctAnswers / viewer.totalQuestions) >= 0.6 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {((viewer.correctAnswers / viewer.totalQuestions) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{viewer.country}</TableCell>
                        <TableCell className="text-gray-300">{viewer.city}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => downloadUserDetails(viewer)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdAnalyticsPage;