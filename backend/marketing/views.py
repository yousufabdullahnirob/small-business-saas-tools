from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from inventory.models import Product
from accounts.models import BusinessProfile
from .models import GeneratedContent
from google import genai

class GenerateContentAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        platform = request.data.get('platform', 'Facebook')
        offer = request.data.get('offer', '')
        language = request.data.get('language', 'Bangla')
        instructions = request.data.get('instructions', '')
        
        try:
            product = Product.objects.get(id=product_id, user=request.user)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            profile = BusinessProfile.objects.get(user=request.user)
        except BusinessProfile.DoesNotExist:
            profile = None

        # Configure Gemini
        if not settings.GEMINI_API_KEY:
             return Response({"error": "Gemini API Key not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Construct Prompt
        store_name = profile.store_name if profile else "Our Store"
        category = profile.product_category if profile else "General"
        target_audience = profile.target_customer if profile else "Everyone"
        
        prompt = f"""
        Act as a professional Social Media Marketing Expert for a {category} business named '{store_name}'.
        
        Create 3 distinct marketing posts for {platform} for this product:
        Product Name: {product.name}
        Price: {product.price}
        Description: {product.description or 'Premium quality product'}
        
        Target Audience: {target_audience}
        Language: {language}
        Special Offer: {offer if offer else 'None'}
        Custom Instructions: {instructions if instructions else 'Make it engaging'}
        
        Output Format: JSON with keys "option1", "option2", "option3".
        
        Variations:
        1. Option 1: Short & Punchy (Best for quick scrolling)
        2. Option 2: Detailed & Persuasive (Focus on benefits)
        3. Option 3: Creative & Storytelling (Engaging narrative)
        """

        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash', contents=prompt
            )
            generated_text = response.text
            
            # Clean up JSON if md block exists
            if "```json" in generated_text:
                generated_text = generated_text.split("```json")[1].split("```")[0].strip()
            elif "```" in generated_text:
                generated_text = generated_text.split("```")[1].split("```")[0].strip()

            # Save history (saving raw JSON string for now)
            GeneratedContent.objects.create(
                user=request.user,
                product=product,
                platform=platform,
                content_type="Marketing Post (JSON)",
                generated_text=generated_text
            )

            return Response({"content": generated_text, "is_json": True})
            
        except Exception as e:
            print(f"AI Generation Failed: {e}. Falling back to simulation.")
            generated_text = self.simulate_content(product, platform, offer, language)
            return Response({"content": generated_text, "is_json": True})

    def simulate_content(self, product, platform, offer, language):
        import json
        
        # Determine language (Case insensitive check)
        is_bangla = language and 'bangla' in language.lower()

        if is_bangla:
            # Bangla Templates
            opt1 = f"🚀 আমাদের নতুন কালেকশন! {product.name} এখন মাত্র {product.price} টাকায়। অর্ডার করতে আজই মেসেজ দিন! #NewArrival"
            
            opt2 = f"""✨ নিয়ে এলাম প্রিমিয়াম কোয়ালিটির {product.name}! ✨

দাম: মাত্র {product.price}
সেরা মান এবং আকর্ষণীয় ডিজাইন।

{f'🔥 অফার: {offer}' if offer else ''}

📦 অর্ডার করতে এখনই 'Order Now' বাটনে ক্লিক করুন অথবা মেসেজ দিন। 👇"""

            opt3 = f"""খুঁজছেন সেরা মানের {product.name}? 🤔
            
আমরা নিয়ে এসেছি {product.name} যা আপনার স্টাইলকে করবে আরও আকর্ষণীয়।
দাম মাত্র {product.price}। সীমিত সময়ের জন্য!

জলদি করুন, স্টক শেষ হওয়ার আগেই অর্ডার করুন! 😍"""

        else:
            # English Templates (Default)
            opt1 = f"🚀 {product.name} just arrived! Only {product.price}. Order now! #New"
            opt2 = f"✨ Discover the best {product.name}!\n\nPrice: {product.price}\nPremium Quality guaranteed.\n\n{f'🔥 Offer: {offer}' if offer else ''}\n\nMessage us to order!"
            opt3 = f"Imagine owning the perfect {product.name}... 😍\n\nIt's finally here at {product.price}.\nDon't miss out on this exclusive deal.\n\nGrab yours today! 👇"

        return json.dumps({
            "option1": opt1,
            "option2": opt2,
            "option3": opt3
        })

    # Simulation method removed

