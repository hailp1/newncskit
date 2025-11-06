import json
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.admin_management.models import SystemConfiguration, BrandConfiguration


class Command(BaseCommand):
    help = 'Backup system and brand configurations to JSON files'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='backups',
            help='Directory to save backup files'
        )
        parser.add_argument(
            '--include-inactive',
            action='store_true',
            help='Include inactive configurations in backup'
        )
    
    def handle(self, *args, **options):
        output_dir = options['output_dir']
        include_inactive = options['include_inactive']
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Backup system configurations
        self.backup_system_configs(output_dir, timestamp, include_inactive)
        
        # Backup brand configurations
        self.backup_brand_configs(output_dir, timestamp, include_inactive)
        
        self.stdout.write(
            self.style.SUCCESS(f'Configuration backup completed successfully in {output_dir}/')
        )
    
    def backup_system_configs(self, output_dir, timestamp, include_inactive):
        """Backup system configurations"""
        queryset = SystemConfiguration.objects.all()
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        
        configs = []
        for config in queryset:
            configs.append({
                'key': config.key,
                'value': config.value,
                'category': config.category,
                'description': config.description,
                'data_type': config.data_type,
                'validation_rules': config.validation_rules,
                'is_active': config.is_active,
                'is_system': config.is_system,
                'requires_restart': config.requires_restart,
                'created_at': config.created_at.isoformat(),
                'updated_at': config.updated_at.isoformat(),
            })
        
        filename = f'system_configs_{timestamp}.json'
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'backup_timestamp': timestamp,
                'total_configs': len(configs),
                'include_inactive': include_inactive,
                'configurations': configs
            }, f, indent=2, ensure_ascii=False)
        
        self.stdout.write(f'System configurations backed up to {filename}')
    
    def backup_brand_configs(self, output_dir, timestamp, include_inactive):
        """Backup brand configurations"""
        queryset = BrandConfiguration.objects.all()
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        
        configs = []
        for config in queryset:
            configs.append({
                'platform_title': config.platform_title,
                'platform_tagline': config.platform_tagline,
                'meta_description': config.meta_description,
                'header_logo_url': config.header_logo_url,
                'favicon_url': config.favicon_url,
                'mobile_icon_url': config.mobile_icon_url,
                'email_logo_url': config.email_logo_url,
                'color_scheme': config.color_scheme,
                'theme': config.theme,
                'custom_css': config.custom_css,
                'custom_js': config.custom_js,
                'social_image_url': config.social_image_url,
                'twitter_handle': config.twitter_handle,
                'facebook_page': config.facebook_page,
                'is_active': config.is_active,
                'version': config.version,
                'created_at': config.created_at.isoformat(),
                'updated_at': config.updated_at.isoformat(),
            })
        
        filename = f'brand_configs_{timestamp}.json'
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'backup_timestamp': timestamp,
                'total_configs': len(configs),
                'include_inactive': include_inactive,
                'configurations': configs
            }, f, indent=2, ensure_ascii=False)
        
        self.stdout.write(f'Brand configurations backed up to {filename}')