import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Upload, MessageCircle, FileText, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../firebase/hooks/useAuth';
import { submitPaymentVerification, getUserPaymentRequests } from '../firebase/services/paymentsService';
import { uploadFile } from '../firebase/services/storageService';
import type { PaymentRequest, PaymentRequestFormData } from '../firebase/types/payments';
import { toast } from 'react-hot-toast';
import { type Route } from '../types';

interface CustomerServicePageProps {
  navigate: (route: Route) => void;
}

const CustomerServicePage = ({ navigate }: CustomerServicePageProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'support' | 'verification' | 'status'>('verification');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [allPaymentRequests, setAllPaymentRequests] = useState<PaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Verification form state
  const [verificationData, setVerificationData] = useState({
    transactionId: '',
    accountName: '',
    accountNumber: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Load pending payment requests
  useEffect(() => {
    if (user && (activeTab === 'verification' || activeTab === 'status')) {
      loadPaymentRequests();
    }
  }, [user, activeTab]);

  const loadPaymentRequests = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const requests = await getUserPaymentRequests(user.uid);
      
      // Store all requests for status tab
      setAllPaymentRequests(requests);
      
      // Show only pending requests for verification tab
      const pendingRequests = requests.filter(req => req.status === 'pending');
      setPaymentRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast.error('Failed to load payment requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!screenshot || !selectedRequest) return;
    
    try {
      setIsUploading(true);
      
      // Upload screenshot
      const screenshotUrl = await uploadFile(
        screenshot, 
        `payment-screenshots/${selectedRequest.id}/${Date.now()}`
      );
      
      // Submit verification
      const formData: PaymentRequestFormData = {
        ...verificationData,
        paymentScreenshot: screenshot
      };
      await submitPaymentVerification(selectedRequest.id, formData, screenshotUrl);
      
      // Reset form and reload requests
      setVerificationData({
        transactionId: '',
        accountName: '',
        accountNumber: '',
      });
      setScreenshot(null);
      setSelectedRequest(null);
      loadPaymentRequests();
      
      toast.success('Payment verification submitted! We will review your request shortly.');
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification');
    } finally {
      setIsUploading(false);
    }
  };

  // Get summary stats for all requests
  const getRequestSummary = () => {
    const pending = allPaymentRequests.filter(r => r.status === 'pending').length;
    const approved = allPaymentRequests.filter(r => r.status === 'approved').length;
    const rejected = allPaymentRequests.filter(r => r.status === 'rejected').length;
    const processing = allPaymentRequests.filter(r => r.status === 'processing').length;
    
    return { pending, approved, rejected, processing, total: allPaymentRequests.length };
  };

  return (
    <div className="pt-04 bg-[--color-bg-primary] min-h-screen">
      <div className="container mx-auto px-4 py-8">

        <motion.div
          {...{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 },
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Customer Service</h1>
            <p className="text-lg text-[--color-text-secondary]">
              Get help with your account, payments, and other questions. Our support team is here to assist you.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-[--color-bg-secondary] p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'support'
                  ? 'bg-[--color-primary] text-white'
                  : 'text-[--color-text-secondary] hover:bg-[--color-bg-primary]'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2 inline" />
              General Support
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'verification'
                  ? 'bg-[--color-primary] text-white'
                  : 'text-[--color-text-secondary] hover:bg-[--color-bg-primary]'
              }`}
            >
              <DollarSign className="w-4 h-4 mr-2 inline" />
              Payment Verification
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'status'
                  ? 'bg-[--color-primary] text-white'
                  : 'text-[--color-text-secondary] hover:bg-[--color-bg-primary]'
              }`}
            >
              <Clock className="w-4 h-4 mr-2 inline" />
              Request Status
            </button>
          </div>

          {/* General Support Tab */}
          {activeTab === 'support' && (
            <motion.div
              {...{
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.3 },
              }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Common Questions</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• How to use FOG Coins</li>
                        <li>• Account verification issues</li>
                        <li>• Service pricing questions</li>
                        <li>• Profile optimization help</li>
                        <li>• Technical troubleshooting</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Response Time</h3>
                      <p className="text-sm text-[--color-text-secondary]">
                        We typically respond within 24 hours during business days.
                        For urgent payment issues, please use the Payment Verification tab.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Send us a message</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Subject</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                          placeholder="Brief description of your issue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea
                          rows={5}
                          className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                          placeholder="Describe your issue in detail..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Attachments (Optional)</label>
                        <input
                          type="file"
                          multiple
                          className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <p className="text-xs text-[--color-text-secondary] mt-1">
                          Supported: Images, PDF, Word documents
                        </p>
                      </div>
                      <Button className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Verification Tab */}
          {activeTab === 'verification' && (
            <motion.div
              {...{
                initial: { opacity: 0, x: 20 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.3 },
              }}
            >
              {!user ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-[--color-text-secondary] mb-4">
                      Please log in to access payment verification.
                    </p>
                    <Button onClick={() => navigate('auth')}>
                      Log In
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Pending Payment Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Payment Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center py-4">
                          <p className="text-[--color-text-secondary]">Loading...</p>
                        </div>
                      ) : paymentRequests.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-[--color-text-secondary] mb-4">
                            No pending payment requests found.
                          </p>
                          <Button onClick={() => navigate('fog-coins')}>
                            Purchase FOG Coins
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {paymentRequests.map((request) => (
                            <div
                              key={request.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedRequest?.id === request.id
                                  ? 'border-[--color-primary] bg-[--color-primary]/5'
                                  : 'border-[--color-border] hover:bg-[--color-bg-secondary]'
                              }`}
                              onClick={() => setSelectedRequest(request)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">
                                    {request.fogCoinsAmount.toLocaleString()} FOG Coins
                                  </p>
                                  <p className="text-sm text-[--color-text-secondary]">
                                    {request.currency} {request.localAmount.toFixed(2)} • {new Date(request.submittedAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-[--color-text-secondary]">
                                    Request ID: {request.id.slice(0, 8)}...
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  request.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Verification Form */}
                  {selectedRequest && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Submit Payment Verification</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-[--color-bg-secondary] p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Selected Request</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Amount:</strong> {selectedRequest.currency} {selectedRequest.localAmount.toFixed(2)}</p>
                            <p><strong>FOG Coins:</strong> {selectedRequest.fogCoinsAmount.toLocaleString()}</p>
                            <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Transaction ID *</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                            placeholder="Enter transaction/reference ID from your bank"
                            value={verificationData.transactionId}
                            onChange={(e) => setVerificationData({...verificationData, transactionId: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Your Account Name *</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                            placeholder="Name on your bank account (sender)"
                            value={verificationData.accountName}
                            onChange={(e) => setVerificationData({...verificationData, accountName: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Your Account Number *</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                            placeholder="Your account number (sender)"
                            value={verificationData.accountNumber}
                            onChange={(e) => setVerificationData({...verificationData, accountNumber: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Payment Screenshot *</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          />
                          <p className="text-xs text-[--color-text-secondary] mt-1">
                            Upload a clear screenshot of your payment confirmation/receipt
                          </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            variant="ghost" 
                            onClick={() => setSelectedRequest(null)} 
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleVerificationSubmit} 
                            className="flex-1"
                            disabled={!verificationData.transactionId || !verificationData.accountName || !verificationData.accountNumber || !screenshot || isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Upload className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Submit Verification'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Request Status Tab */}
          {activeTab === 'status' && (
            <motion.div
              {...{
                initial: { opacity: 0, x: 20 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.3 },
              }}
            >
              {!user ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-[--color-text-secondary] mb-4">
                      Please log in to view your request status.
                    </p>
                    <Button onClick={() => navigate('auth')}>
                      Log In
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold">{getRequestSummary().pending}</p>
                        <p className="text-xs text-[--color-text-secondary]">Pending</p>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{getRequestSummary().approved}</p>
                        <p className="text-xs text-[--color-text-secondary]">Approved</p>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center mb-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold">{getRequestSummary().rejected}</p>
                        <p className="text-xs text-[--color-text-secondary]">Rejected</p>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center mb-2">
                          <AlertCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">{getRequestSummary().processing}</p>
                        <p className="text-xs text-[--color-text-secondary]">Processing</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Request History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">
                        <p className="text-[--color-text-secondary]">Loading...</p>
                      </div>
                    ) : allPaymentRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[--color-text-secondary] mb-4">
                          No payment requests found.
                        </p>
                        <Button onClick={() => navigate('fog-coins')}>
                          Purchase FOG Coins
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allPaymentRequests.map((request) => {
                          const getStatusIcon = () => {
                            switch (request.status) {
                              case 'pending':
                                return <Clock className="w-5 h-5 text-yellow-500" />;
                              case 'approved':
                                return <CheckCircle className="w-5 h-5 text-green-500" />;
                              case 'rejected':
                                return <XCircle className="w-5 h-5 text-red-500" />;
                              case 'processing':
                                return <AlertCircle className="w-5 h-5 text-blue-500" />;
                              default:
                                return <Clock className="w-5 h-5 text-gray-500" />;
                            }
                          };

                          const getStatusColor = () => {
                            switch (request.status) {
                              case 'pending':
                                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                              case 'approved':
                                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                              case 'rejected':
                                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
                              case 'processing':
                                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
                              default:
                                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                            }
                          };

                          const getStatusMessage = () => {
                            switch (request.status) {
                              case 'pending':
                                return request.verificationDetails ? 
                                  'Verification submitted, awaiting admin review' : 
                                  'Awaiting payment verification';
                              case 'approved':
                                return 'Payment approved! FOG Coins added to your wallet';
                              case 'rejected':
                                return request.adminNotes || 'Payment rejected. Please contact support for details.';
                              case 'processing':
                                return 'Payment is being processed by our team';
                              default:
                                return 'Status unknown';
                            }
                          };

                          return (
                            <div
                              key={request.id}
                              className="border border-[--color-border] rounded-lg p-4 hover:bg-[--color-bg-secondary] transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon()}
                                  <div>
                                    <h4 className="font-semibold">
                                      {request.fogCoinsAmount.toLocaleString()} FOG Coins
                                    </h4>
                                    <p className="text-sm text-[--color-text-secondary]">
                                      {request.currency} {request.localAmount.toFixed(2)} • {new Date(request.submittedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor()}`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>

                              <div className="bg-[--color-bg-secondary] p-3 rounded-md mb-3">
                                <p className="text-sm text-[--color-text-secondary]">
                                  {getStatusMessage()}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs text-[--color-text-secondary]">
                                <div>
                                  <span className="font-medium">Request ID:</span>
                                  <p className="font-mono">{request.id.slice(0, 8)}...</p>
                                </div>
                                <div>
                                  <span className="font-medium">Submitted:</span>
                                  <p>{new Date(request.submittedAt).toLocaleString()}</p>
                                </div>
                                {request.processedAt && (
                                  <>
                                    <div>
                                      <span className="font-medium">Processed:</span>
                                      <p>{new Date(request.processedAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Processed By:</span>
                                      <p>{request.processedBy || 'Admin'}</p>
                                    </div>
                                  </>
                                )}
                                {request.verificationDetails && (
                                  <>
                                    <div>
                                      <span className="font-medium">Transaction ID:</span>
                                      <p className="font-mono">{request.verificationDetails.transactionId}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Verified:</span>
                                      <p>{new Date(request.verificationDetails.submittedAt).toLocaleString()}</p>
                                    </div>
                                  </>
                                )}
                              </div>

                              {request.status === 'pending' && !request.verificationDetails && (
                                <div className="mt-3 pt-3 border-t border-[--color-border]">
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setActiveTab('verification');
                                      setSelectedRequest(request);
                                    }}
                                    className="w-full"
                                  >
                                    Complete Verification
                                  </Button>
                                </div>
                              )}

                              {request.status === 'rejected' && (
                                <div className="mt-3 pt-3 border-t border-[--color-border]">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setActiveTab('support')}
                                    className="w-full"
                                  >
                                    Contact Support
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerServicePage;
