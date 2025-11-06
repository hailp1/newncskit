'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TokenTransaction {
  id: number;
  user_id: string;
  user_email: string;
  transaction_type: 'earned' | 'spent' | 'bonus';
  amount: number;
  description: string;
  created_at: string;
}

interface UserTokenBalance {
  user_id: string;
  user_email: string;
  total_tokens: number;
  earned_tokens: number;
  spent_tokens: number;
  last_updated: string;
}

export default function AdminTokensPage() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [balances, setBalances] = useState<UserTokenBalance[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'balances'>('transactions');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'transactions') {
        await loadTransactions();
      } else {
        await loadBalances();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTransactions: TokenTransaction[] = [];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadBalances = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockBalances: UserTokenBalance[] = [];
      setBalances(mockBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBalances = balances.filter(balance =>
    balance.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Token Management</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search users or transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'balances'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          User Balances
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'transactions' ? 'Token Transactions' : 'User Token Balances'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available. This is a mock implementation.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}