from rest_framework import permissions
from django.db.models import Q


class BlogPostPermission(permissions.BasePermission):
    """
    Custom permission for blog posts:
    - Anyone can read published posts
    - Authors can CRUD their own posts
    - Collaborators can edit posts they're assigned to
    - Staff can do anything
    """
    
    def has_permission(self, request, view):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated users
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions
        if request.method in permissions.SAFE_METHODS:
            # Published posts are public
            if obj.status == 'published':
                return True
            # Authors and collaborators can read their posts
            if request.user.is_authenticated:
                return (obj.author == request.user or 
                       request.user in obj.collaborators.all() or
                       request.user.is_staff)
            return False
        
        # Write permissions
        if not request.user.is_authenticated:
            return False
        
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Authors can edit their posts
        if obj.author == request.user:
            return True
        
        # Collaborators can edit (but not delete)
        if request.user in obj.collaborators.all():
            return view.action != 'destroy'
        
        return False


class MediaFilePermission(permissions.BasePermission):
    """
    Custom permission for media files:
    - Authenticated users can upload
    - Users can manage their own files
    - Staff can manage all files
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Users can manage their own files
        return obj.uploaded_by == request.user


class SEOAnalysisPermission(permissions.BasePermission):
    """
    Custom permission for SEO analysis:
    - Users can analyze their own posts
    - Staff can analyze any post
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Users can analyze their own posts or posts they collaborate on
        return (obj.post.author == request.user or 
               request.user in obj.post.collaborators.all())


class BlogCommentPermission(permissions.BasePermission):
    """
    Custom permission for blog comments:
    - Anyone can read approved comments
    - Authenticated users can create comments
    - Authors can edit/delete their comments
    - Staff can moderate all comments
    """
    
    def has_permission(self, request, view):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated users
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for approved comments
        if request.method in permissions.SAFE_METHODS:
            return obj.is_approved and not obj.is_spam
        
        # Write permissions
        if not request.user.is_authenticated:
            return False
        
        # Staff can moderate all comments
        if request.user.is_staff:
            return True
        
        # Authors can edit their comments
        return obj.author == request.user


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors to edit their content.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the author
        return obj.author == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners to edit their content.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.uploaded_by == request.user if hasattr(obj, 'uploaded_by') else obj.author == request.user


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow staff to edit content.
    """
    
    def has_permission(self, request, view):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for staff
        return request.user and request.user.is_staff