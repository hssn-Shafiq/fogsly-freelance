import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  DollarSign, 
  Banknote,
  FileText,
  Download,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { type Route } from '../../types';
import { 
  getAllPaymentRequests, 
  approvePaymentRequest, 
  rejectPaymentRequest,
  getPaymentRequest 
} from '../../firebase/services/paymentsService';
import type { PaymentRequest, PaymentStatus, Currency } from '../../firebase/types/payments';
import { useAuth } from '../../firebase/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface PaymentManagementPageProps {
  navigate: (route: Route) => void;
}

const PaymentManagementPage = ({ navigate }: PaymentManagementPageProps) => {
  const { user } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load payment requests
  useEffect(() => {
    const loadPaymentRequests = async () => {
      try {
        setLoading(true);
        const requests = await getAllPaymentRequests();
        setPaymentRequests(requests);
        setFilteredRequests(requests);
      } catch (error) {
        console.error('Error loading payment requests:', error);
        toast.error('Failed to load payment requests');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentRequests();
  }, []);

  // Filter requests by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredRequests(paymentRequests);
    } else {
      setFilteredRequests(paymentRequests.filter(req => req.status === statusFilter));
    }
  }, [statusFilter, paymentRequests]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getCurrencyIcon = (currency: Currency) => {
    return currency === 'USD' ? <DollarSign className="w-4 h-4" /> : <Banknote className="w-4 h-4" />;
  };

  const handleViewDetails = async (requestId: string) => {
    try {
      const request = await getPaymentRequest(requestId);
      if (request) {
        setSelectedRequest(request);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading payment request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const handleApprove = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setAdminNotes('Payment approved and FOG coins deposited to user wallet.');
    setShowApprovalModal(true);
  };

  const handleReject = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest || !user) return;

    try {
      setProcessing(true);
      await approvePaymentRequest(selectedRequest.id, user.uid, adminNotes);
      
      // Update local state
      setPaymentRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'approved', processedBy: user.uid, adminNotes }
            : req
        )
      );
      
      toast.success('Payment request approved successfully!');
      setShowApprovalModal(false);
    } catch (error) {
      console.error('Error approving payment request:', error);
      toast.error('Failed to approve payment request');
    } finally {
      setProcessing(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedRequest || !user || !adminNotes.trim()) return;

    try {
      setProcessing(true);
      await rejectPaymentRequest(selectedRequest.id, user.uid, adminNotes);
      
      // Update local state
      setPaymentRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'rejected', processedBy: user.uid, adminNotes }
            : req
        )
      );
      
      toast.success('Payment request rejected.');
      setShowRejectionModal(false);
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      toast.error('Failed to reject payment request');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const stats = {
    total: paymentRequests.length,
    pending: paymentRequests.filter(r => r.status === 'pending').length,
    processing: paymentRequests.filter(r => r.status === 'processing').length,
    approved: paymentRequests.filter(r => r.status === 'approved').length,
    rejected: paymentRequests.filter(r => r.status === 'rejected').length,
    totalAmount: paymentRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.localAmount, 0)
  };

  return (
    <>
      <div className="pt-0 bg-[--color-bg-primary] min-h-screen">
        <section className="py-16 pt-4 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Button variant="ghost" onClick={() => navigate('admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-4">Payment Management</h1>
              <p className="text-lg text-[--color-text-secondary]">
                Review and manage FOG Coin deposit requests
              </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[--color-text-primary]">{stats.total}</div>
                  <div className="text-sm text-[--color-text-secondary]">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-[--color-text-secondary]">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                  <div className="text-sm text-[--color-text-secondary]">Processing</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-sm text-[--color-text-secondary]">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-[--color-text-secondary]">Rejected</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[--color-primary]">${stats.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-[--color-text-secondary]">Total Processed</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Filter className="w-5 h-5 text-[--color-text-secondary]" />
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'pending', 'processing', 'approved', 'rejected'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Requests ({filteredRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 mx-auto mb-4 animate-spin text-[--color-text-secondary]" />
                    <p className="text-[--color-text-secondary]">Loading payment requests...</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto mb-4 text-[--color-text-secondary]" />
                    <p className="text-[--color-text-secondary]">No payment requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[--color-border]">
                          <th className="text-left p-3">User</th>
                          <th className="text-left p-3">Amount</th>
                          <th className="text-left p-3">Currency</th>
                          <th className="text-left p-3">FOG Coins</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Submitted</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr key={request.id} className="border-b border-[--color-border] hover:bg-[--color-bg-secondary] transition-colors">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{request.userName}</div>
                                <div className="text-sm text-[--color-text-secondary]">{request.userEmail}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                {getCurrencyIcon(request.currency)}
                                <span className="font-medium">
                                  {request.currency === 'USD' ? '$' : 'PKR '}
                                  {request.localAmount.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{request.currency}</Badge>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">{request.fogCoinsAmount.toLocaleString()} FOG</span>
                            </td>
                            <td className="p-3">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <span className="text-sm">{formatDate(request.submittedAt)}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(request.id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {request.status === 'processing' && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleApprove(request)}>
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleReject(request)}>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        title="Payment Request Details"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[--color-text-secondary]">User</label>
                <div className="mt-1">
                  <div className="font-medium">{selectedRequest.userName}</div>
                  <div className="text-sm text-[--color-text-secondary]">{selectedRequest.userEmail}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[--color-text-secondary]">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[--color-text-secondary]">Local Amount</label>
                <div className="mt-1 font-medium">
                  {selectedRequest.currency === 'USD' ? '$' : 'PKR '}
                  {selectedRequest.localAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[--color-text-secondary]">FOG Coins</label>
                <div className="mt-1 font-medium">{selectedRequest.fogCoinsAmount.toLocaleString()} FOG</div>
              </div>
            </div>

            {selectedRequest.verificationDetails && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Verification Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[--color-text-secondary]">Transaction ID</label>
                    <div className="mt-1 font-mono text-sm">{selectedRequest.verificationDetails.transactionId}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[--color-text-secondary]">Account Name</label>
                    <div className="mt-1">{selectedRequest.verificationDetails.accountName}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-[--color-text-secondary]">Account Number</label>
                  <div className="mt-1 font-mono text-sm">{selectedRequest.verificationDetails.accountNumber}</div>
                </div>
                {selectedRequest.verificationDetails.paymentScreenshot && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-[--color-text-secondary]">Payment Screenshot</label>
                    <div className="mt-1">
                      <a 
                        href={selectedRequest.verificationDetails.paymentScreenshot} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[--color-primary] hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        View Screenshot
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedRequest.adminNotes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <p className="text-sm text-[--color-text-secondary] bg-[--color-bg-secondary] p-3 rounded">
                  {selectedRequest.adminNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal 
        isOpen={showApprovalModal} 
        onClose={() => setShowApprovalModal(false)} 
        title="Approve Payment Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                This will add <strong>{selectedRequest.fogCoinsAmount.toLocaleString()} FOG coins</strong> to {selectedRequest.userName}'s wallet and mark the request as approved.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Admin Notes</label>
              <textarea
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowApprovalModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={confirmApproval} 
                className="flex-1"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Approve Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal 
        isOpen={showRejectionModal} 
        onClose={() => setShowRejectionModal(false)} 
        title="Reject Payment Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will reject the payment request from {selectedRequest.userName}. Please provide a reason for rejection.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rejection Reason *</label>
              <textarea
                className="w-full p-2 border border-[--color-border] rounded-md bg-[--color-bg-secondary]"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Please explain why this request is being rejected..."
                required
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowRejectionModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={confirmRejection} 
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={processing || !adminNotes.trim()}
              >
                {processing ? 'Processing...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PaymentManagementPage;
