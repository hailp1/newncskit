'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/admin-client';

interface AdminPost {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  author_id: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft' as 'draft' | 'published',
    category: '',
    meta_description: ''
  });

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockPosts = [
        { 
          id: 1, 
          title: 'Sample Post', 
          content: 'Sample content',
          status: 'published' as 'published', 
          author_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ];
      setPosts(mockPosts);
      setTotalPosts(1);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      // Mock create - replace with actual API call
      console.log('Creating post:', formData);
      await loadPosts();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    }
  };

  const handleUpdatePost = async (postId: number, updates: Partial<AdminPost>) => {
    try {
      // Mock update - replace with actual API call
      console.log('Updating post:', postId, updates);
      await loadPosts();
      setEditingPost(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      // Mock delete - replace with actual API call
      console.log('Deleting post:', postId);
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      status: 'draft',
      category: '',
      meta_description: ''
    });
  };

  const startEdit = (post: AdminPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content || '',
      status: post.status,
      category: '',
      meta_description: ''
    });
    setShowCreateForm(true);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalPosts / 20);

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
        <h1 className="text-2xl font-bold text-gray-900">Post Management</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setShowCreateForm(true)}>
            Create Post
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Post content"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Post category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <Input
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO description"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  if (editingPost) {
                    handleUpdatePost(editingPost.id, formData);
                  } else {
                    handleCreatePost();
                  }
                }}
              >
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPost(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Posts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {post.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.author_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' :
                      post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalPosts)} of {totalPosts} posts
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