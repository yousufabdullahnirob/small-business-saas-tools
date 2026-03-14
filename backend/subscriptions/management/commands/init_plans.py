from django.core.management.base import BaseCommand
from subscriptions.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Initialize subscription plans'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Lakkhyo',
                'slug': 'lakkhyo',
                'description': 'Ideal for small businesses starting their digital journey.',
                'price_1m': 1110,
                'price_3m': 3165,  # 1110 * 3 * 0.95
                'price_6m': 5994,  # 1110 * 6 * 0.90
                'price_12m': 10656, # 1110 * 12 * 0.80
                'original_price_1m': 1500,
                'original_price_3m': 4500,
                'original_price_6m': 9000,
                'original_price_12m': 18000,
                'team_members_limit': 3,
                'warehouses_limit': 1,
                'monthly_invoices_limit': 500,
                'free_trial_days': 14,
                'features': [
                    'Multi-User Access',
                    'Inventory Tracking',
                    'Detailed Sales Reports',
                    '24/7 Email Support'
                ]
            },
            {
                'name': 'Growth',
                'slug': 'growth',
                'description': 'Perfect for growing businesses expanding their operations.',
                'price_1m': 1850,
                'price_3m': 5275,  # 1850 * 3 * 0.95 (approx)
                'price_6m': 9990,  # 1850 * 6 * 0.90
                'price_12m': 17760, # 1850 * 12 * 0.80
                'original_price_1m': 2500,
                'original_price_3m': 7500,
                'original_price_6m': 15000,
                'original_price_12m': 30000,
                'team_members_limit': 10,
                'warehouses_limit': 3,
                'monthly_invoices_limit': 2500,
                'free_trial_days': 14,
                'features': [
                    'Advanced Analytics',
                    'Customer Loyalty Program',
                    'Supplier Management',
                    'Priority Support'
                ]
            },
            {
                'name': 'Empire',
                'slug': 'empire',
                'description': 'The ultimate solution for large-scale business automation.',
                'price_1m': 3700,
                'price_3m': 10545, # 3700 * 3 * 0.95
                'price_6m': 19980, # 3700 * 6 * 0.90
                'price_12m': 35520, # 3700 * 12 * 0.80
                'original_price_1m': 5000,
                'original_price_3m': 15000,
                'original_price_6m': 30000,
                'original_price_12m': 60000,
                'team_members_limit': 999999, # Unlimited
                'warehouses_limit': 10,
                'monthly_invoices_limit': 999999, # Unlimited
                'free_trial_days': 14,
                'features': [
                    'AI-powered Marketing',
                    'Multi-Warehouse Sync',
                    'White Label Reports',
                    'Dedicated Account Manager'
                ]
            }
        ]

        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.update_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created plan "{plan.name}"'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Successfully updated plan "{plan.name}"'))

        # Initialize Global Promotion
        from django.utils import timezone
        from datetime import datetime
        
        promotion_data = {
            'name': 'New Year Offer 2026',
            'description': '26% discount on all plans for the start of 2026.',
            'discount_percentage': 26,
            'banner_text_en': 'Happy New Year 2026! 26% OFF on all plans!',
            'banner_text_bn': 'শুভ নববর্ষ ২০২৬! ২৬% ছাড় সকল প্ল্যানে!',
            'start_date': timezone.make_aware(datetime(2026, 1, 1)),
            'end_date': timezone.make_aware(datetime(2026, 1, 7, 23, 59, 59)),
            'is_active': True
        }
        
        from subscriptions.models import GlobalPromotion
        promo, created = GlobalPromotion.objects.update_or_create(
            name=promotion_data['name'],
            defaults=promotion_data
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Successfully created New Year promotion'))
        else:
            self.stdout.write(self.style.SUCCESS('Successfully updated New Year promotion'))
