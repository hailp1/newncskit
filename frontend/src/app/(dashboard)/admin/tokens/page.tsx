'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/admin-client';
import { supabase } from '@/lib/supabase-mock';
// Use PostgreSQL database instead of Supabase

interface TokenTransaction {
  id: number;
  user_id: string;
  user_email: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_type: string;
  created_at: string;
}

interface TokenPackage {
  id: number;
  name: string;
  name_vi: string;
  token_amount: number;
  price_vnd: number;
  price_usd: number;
  bonus_tokens: number;
  is_active: boolean;
}

export default function AdminTokens() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [activeTab, setActiveTab] = useState<'transactions' | 'packages'>('transactions');

  useEffect(() => {
    loadData();
  }, [currentPage, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'transactions') {
        await loadTransactions();
      } else {
        await loadPackages();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('user_tokens')
      .select(`
        *,
        user:users!user_id(email)
      `)
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * 20, currentPage * 20 - 1);

    if (error) throw error;

    const formattedTransactions = data?.map((transaction: any) => ({
      ...transaction,
      user_email: transaction.user?.email || ''
    })) || [];

    setTransactions(formattedTransactions);
  };

  const loadPackages = async () => {
    const { data, error } = await supabase
      .from('token_packages')
      .select('*')
      .order('token_amount', { ascending: true });

    if (error) throw error;
    setPackages(data || []);
  };

  const handleRevokeToken = async (tokenId: number) => {
    if (!confirm('Are you sure you want to revoke this token?')) return;
    
    try {
      await adminService.revokeToken(tokenId);
      await loadTransactions();
    } catch (error) {
      console.error('Failed to revoke token:', error);
      alert('Failed to revoke token');
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalTransactions / 20);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Token System Management</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Token Transactions
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'packages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Token Packages
          </button>
        </nav>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.transaction_type === 'earn').length}
            </div>
            <div className="text-sm text-gray-600">Token Earnings</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.transaction_type === 'spend').length}
            </div>
            <div className="text-sm text-gray-600">Token Spending</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {transactions.filter(t => t.transaction_type === 'purchase').length}
            </div>
            <div className="text-sm text-gray-600">Token Purchases</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {transactions.filter(t => t.transaction_type === 'referral').length}
            </div>
            <div className="text-sm text-gray-600">Referral Rewards</div>
          </div>
        </Card>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'transactions' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance After
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transaction_type === 'earn' ? 'bg-green-100 text-green-800' :
                        transaction.transaction_type === 'spend' ? 'bg-red-100 text-red-800' :
                        transaction.transaction_type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} 🪙
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.balance_after} 🪙
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Token Packages</h3>
              <Button>Add Package</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg">{pkg.name_vi}</h4>
                    <p className="text-sm text-gray-600">{pkg.name}</p>
                    <div className="my-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {pkg.token_amount.toLocaleString()} 🪙
                      </div>
                      {pkg.bonus_tokens > 0 && (
                        <div className="text-sm text-green-600">
                          +{pkg.bonus_tokens} bonus
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-semibold">
                        {pkg.price_vnd.toLocaleString()} VND
                      </div>
                      <div className="text-sm text-gray-600">
                        ${pkg.price_usd}
                      </div>
                    </div>
                    <div className="mt-4 space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={pkg.is_active ? 'text-red-600' : 'text-green-600'}
                      >
                        {pkg.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalTransactions)} of {totalTransactions} transactions
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}