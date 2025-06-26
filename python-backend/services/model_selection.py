import json
from typing import List, Dict, Any, Optional
from pathlib import Path
from huggingface_hub import HfApi, model_info
import re

MODELS_PATH = Path(__file__).parent.parent.parent / "src" / "data" / "models.json"

class ModelSelection:
    @staticmethod
    def load_models() -> List[Dict[str, Any]]:
        if MODELS_PATH.exists():
            with open(MODELS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("models", [])
        return []

    @staticmethod
    def model_exists(model_id: str) -> bool:
        """Check if a model already exists in the collection"""
        models = ModelSelection.load_models()
        return any(model.get("id") == model_id for model in models)

    @staticmethod
    def remove_model(model_id: str) -> Dict[str, Any]:
        """Remove a model from the collection"""
        if MODELS_PATH.exists():
            with open(MODELS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            return {
                "success": False,
                "message": "Models file not found"
            }
        
        models = data.get("models", [])
        original_count = len(models)
        models = [m for m in models if m.get("id") != model_id]
        
        if len(models) < original_count:
            data["models"] = models
            with open(MODELS_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return {
                "success": True,
                "message": f"Successfully removed model '{model_id}'"
            }
        return {
            "success": False,
            "message": f"Model '{model_id}' not found"
        }

    @staticmethod
    def get_enhanced_model_info(model_id: str) -> Dict[str, Any]:
        """Fetch enhanced model information from HuggingFace"""
        try:
            api = HfApi()
            info = model_info(model_id)
            
            # Extract provider from model ID or author
            provider = "HuggingFace"
            if hasattr(info, 'author') and info.author:
                provider = info.author
            elif "/" in model_id:
                provider = model_id.split("/")[0]
            
            # Map common providers
            provider_mapping = {
                "openai-community": "OpenAI",
                "microsoft": "Microsoft", 
                "google": "Google",
                "google-bert": "Google",
                "meta-llama": "Meta",
                "mistralai": "Mistral AI",
                "facebook": "Meta",
                "huggingface": "HuggingFace",
                "stabilityai": "Stability AI",
                "bigscience": "BigScience"
            }
            provider = provider_mapping.get(provider.lower(), provider)
            
            # Determine parameters from model name/tags
            parameters = ModelSelection._extract_parameters(model_id, getattr(info, 'tags', []))
            
            # Determine category from pipeline tag
            pipeline_tag = getattr(info, 'pipeline_tag', 'text-generation')
            category = ModelSelection._map_category(pipeline_tag)
            
            # Extract license from tags
            license_info = ModelSelection._extract_license(getattr(info, 'tags', []))
            
            # Filter and clean tags
            clean_tags = ModelSelection._clean_tags(getattr(info, 'tags', []))
            
            # Determine context length
            context_length = ModelSelection._extract_context_length(model_id, getattr(info, 'tags', []))
            
            return {
                "id": model_id,
                "name": model_id.split("/")[-1] if "/" in model_id else model_id,
                "provider": provider,
                "category": category,
                "description": getattr(info, 'description', f"Pre-trained {category.lower()} model"),
                "parameters": parameters,
                "contextLength": context_length,
                "license": license_info,
                "downloadSize": "Unknown",  # Would need separate API call
                "tags": clean_tags,
                "capabilities": [pipeline_tag] if pipeline_tag else ["text-generation"],
                "recommended": False,
                "performance": {
                    "speed": "Unknown",
                    "accuracy": "Unknown", 
                    "memoryUsage": "Unknown"
                },
                "useCase": ModelSelection._generate_use_case(category, parameters)
            }
            
        except Exception as e:
            # Fallback for when HuggingFace API fails
            return ModelSelection._create_fallback_model_info(model_id)

    @staticmethod
    def _extract_parameters(model_id: str, tags: List[str]) -> str:
        """Extract parameter count from model ID or tags"""
        # Look for parameter indicators in model name
        param_patterns = [
            r'(\d+(?:\.\d+)?)[bB](?:illion)?',
            r'(\d+(?:\.\d+)?)[mM](?:illion)?', 
            r'(\d+)b-',
            r'(\d+)m-',
            r'-(\d+)b',
            r'-(\d+)m'
        ]
        
        for pattern in param_patterns:
            match = re.search(pattern, model_id.lower())
            if match:
                num = float(match.group(1))
                if 'b' in pattern or num >= 1:
                    return f"{num}B" if num == int(num) else f"{num}B"
                else:
                    return f"{int(num)}M"
        
        # Check tags for size indicators
        for tag in tags:
            if any(x in tag.lower() for x in ['7b', '8b', '13b', '70b', '3b']):
                match = re.search(r'(\d+)b', tag.lower())
                if match:
                    return f"{match.group(1)}B"
        
        return "See model card"

    @staticmethod
    def _map_category(pipeline_tag: str) -> str:
        """Map HuggingFace pipeline tags to our categories"""
        category_mapping = {
            "text-generation": "Text Generation",
            "text2text-generation": "Text Generation", 
            "fill-mask": "Text Understanding",
            "text-classification": "Text Classification",
            "token-classification": "Text Classification",
            "question-answering": "Question Answering",
            "summarization": "Summarization",
            "translation": "Translation",
            "conversational": "Conversational",
            "image-text-to-text": "Multimodal",
            "text-to-image": "Multimodal",
            "automatic-speech-recognition": "Speech",
            "audio-classification": "Audio",
            "feature-extraction": "Feature Extraction",
            "sentence-similarity": "Text Understanding"
        }
        return category_mapping.get(pipeline_tag, "Other")

    @staticmethod 
    def _extract_license(tags: List[str]) -> str:
        """Extract license information from tags"""
        for tag in tags:
            if tag.startswith("license:"):
                license_name = tag.replace("license:", "").replace("-", " ").title()
                return license_name
        return "Unknown"

    @staticmethod
    def _clean_tags(tags: List[str]) -> List[str]:
        """Clean and filter tags to keep only relevant ones"""
        # Remove technical tags that aren't useful for users
        skip_patterns = [
            r'^license:',
            r'^region:',
            r'^dataset:',
            r'^arxiv:',
            r'^doi:',
            r'^base_model:',
            r'^endpoints_compatible$',
            r'^autotrain_compatible$',
            r'^text-generation-inference$',
            r'^transformers$',
            r'^pytorch$',
            r'^tensorflow$',
            r'^jax$',
            r'^safetensors$',
            r'^onnx$'
        ]
        
        clean_tags = []
        for tag in tags:
            # Skip if matches any skip pattern
            if any(re.match(pattern, tag) for pattern in skip_patterns):
                continue
            # Keep useful tags
            if len(tag) <= 20 and not tag.startswith("http"):
                clean_tags.append(tag)
        
        return clean_tags[:8]  # Limit to 8 most relevant tags

    @staticmethod
    def _extract_context_length(model_id: str, tags: List[str]) -> int:
        """Extract context length from model info"""
        # Common context lengths based on model type
        if any(x in model_id.lower() for x in ['bert', 'distilbert']):
            return 512
        elif any(x in model_id.lower() for x in ['gpt2']):
            return 1024
        elif any(x in model_id.lower() for x in ['llama', 'mistral']):
            return 8192
        elif any(x in model_id.lower() for x in ['claude']):
            return 200000
        else:
            return 2048  # Default

    @staticmethod
    def _generate_use_case(category: str, parameters: str) -> str:
        """Generate appropriate use case based on category and size"""
        use_cases = {
            "Text Generation": "Content creation, code generation, creative writing",
            "Text Classification": "Sentiment analysis, content moderation, categorization", 
            "Question Answering": "Information retrieval, customer support, knowledge base",
            "Summarization": "Document summarization, content briefing, data synthesis",
            "Translation": "Language translation, localization, multilingual support",
            "Conversational": "Chatbots, virtual assistants, dialogue systems",
            "Multimodal": "Image captioning, visual question answering, document understanding",
            "Text Understanding": "Feature extraction, semantic search, text embeddings"
        }
        return use_cases.get(category, "General natural language processing tasks")

    @staticmethod
    def _create_fallback_model_info(model_id: str) -> Dict[str, Any]:
        """Create fallback model info when HuggingFace API fails"""
        return {
            "id": model_id,
            "name": model_id.split("/")[-1] if "/" in model_id else model_id,
            "provider": model_id.split("/")[0] if "/" in model_id else "HuggingFace",
            "category": "Text Generation",
            "description": f"Model from HuggingFace: {model_id}",
            "parameters": "See model card",
            "contextLength": 2048,
            "license": "Unknown",
            "downloadSize": "Unknown",
            "tags": [],
            "capabilities": ["text-generation"],
            "recommended": False,
            "performance": {
                "speed": "Unknown",
                "accuracy": "Unknown",
                "memoryUsage": "Unknown"
            },
            "useCase": "General natural language processing tasks"
        }

    @staticmethod
    def add_model(model_search_result: Dict[str, Any]) -> Dict[str, Any]:
        """Add a model with enhanced information and duplicate checking"""
        model_id = model_search_result.get("id")
        
        # Check for duplicates
        if ModelSelection.model_exists(model_id):
            return {
                "success": False,
                "error": "duplicate",
                "message": f"Model '{model_id}' already exists in your collection"
            }
        
        # Get enhanced model information
        enhanced_model = ModelSelection.get_enhanced_model_info(model_id)
        
        # Load existing data
        if MODELS_PATH.exists():
            with open(MODELS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {"models": [], "categories": [], "providers": []}
        
        models = data.get("models", [])
        models.append(enhanced_model)
        data["models"] = models
        
        # Update categories and providers lists
        categories = set(data.get("categories", ["All Models"]))
        providers = set(data.get("providers", ["All Providers"]))
        
        categories.add(enhanced_model["category"])
        providers.add(enhanced_model["provider"])
        
        data["categories"] = sorted(list(categories))
        data["providers"] = sorted(list(providers))
        
        # Save to file
        with open(MODELS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return {
            "success": True,
            "model": enhanced_model,
            "message": f"Successfully added '{enhanced_model['name']}' to your collection"
        }

    @staticmethod
    def search_huggingface_models(query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search HuggingFace models with enhanced data extraction"""
        import requests
        
        api = HfApi()
        results = api.list_models(search=query, limit=limit)
        
        enhanced_models = []
        for m in results:
            model_data = {
                "id": m.id,
                "name": m.id.split("/")[-1] if "/" in m.id else m.id,
                "provider": m.id.split("/")[0] if "/" in m.id else "HuggingFace",
                "description": f"HuggingFace model: {m.id}",
                "tags": ModelSelection._clean_tags(getattr(m, 'tags', [])),
                "downloads": getattr(m, 'downloads', 0) or 0,
                "likes": getattr(m, 'likes', 0) or 0,
                "pipeline_tag": getattr(m, 'pipeline_tag', None) or "text-generation",
                "library_name": getattr(m, 'library_name', 'transformers'),
            }
            
            # Extract enhanced information
            enhanced_info = ModelSelection._get_enhanced_model_info(m.id, model_data)
            model_data.update(enhanced_info)
            
            enhanced_models.append(model_data)
        
        return enhanced_models
    
    @staticmethod
    def _clean_tags(tags: List[str]) -> List[str]:
        """Clean and filter model tags"""
        if not tags:
            return []
        
        # Filter out noisy tags
        filtered_tags = []
        skip_prefixes = ['arxiv:', 'dataset:', 'license:', 'doi:', 'base_model:', 'region:', 'autotrain_', 'endpoints_']
        skip_tags = ['transformers', 'pytorch', 'tf', 'jax', 'safetensors', 'onnx', 'rust', 'tflite', 'coreml']
        
        for tag in tags:
            tag = tag.strip().lower()
            if (not any(tag.startswith(prefix) for prefix in skip_prefixes) and 
                tag not in skip_tags and 
                len(tag) > 1 and 
                len(filtered_tags) < 8):
                filtered_tags.append(tag)
        
        return filtered_tags
    
    @staticmethod
    def _get_enhanced_model_info(model_id: str, base_data: Dict) -> Dict[str, Any]:
        """Get enhanced model information including parameters and context length"""
        enhanced = {
            "parameters": "Unknown",
            "contextLength": 512,  # Default fallback
            "category": "Text Generation",
            "license": "See HuggingFace",
            "downloadSize": "Unknown"
        }
        
        # Set category based on pipeline tag
        pipeline_tag = base_data.get('pipeline_tag', '')
        category_mapping = {
            'text-generation': 'Text Generation',
            'text-classification': 'Text Classification', 
            'fill-mask': 'Text Understanding',
            'question-answering': 'Question Answering',
            'summarization': 'Summarization',
            'translation': 'Translation',
            'conversational': 'Conversational AI',
            'text2text-generation': 'Text-to-Text',
            'feature-extraction': 'Feature Extraction',
            'image-text-to-text': 'Vision-Language',
            'image-classification': 'Image Classification'
        }
        enhanced["category"] = category_mapping.get(pipeline_tag, 'Other')
        
        # Extract parameters from model name
        name_lower = model_id.lower()
        if '7b' in name_lower or '7-b' in name_lower:
            enhanced["parameters"] = '7B'
        elif '8b' in name_lower or '8-b' in name_lower:
            enhanced["parameters"] = '8B'
        elif '13b' in name_lower or '13-b' in name_lower:
            enhanced["parameters"] = '13B'
        elif '70b' in name_lower or '70-b' in name_lower:
            enhanced["parameters"] = '70B'
        elif '3b' in name_lower or '3-b' in name_lower:
            enhanced["parameters"] = '3B'
        elif 'base' in name_lower and ('bert' in name_lower or 'roberta' in name_lower):
            enhanced["parameters"] = '110M'
        elif 'large' in name_lower and ('bert' in name_lower or 'roberta' in name_lower):
            enhanced["parameters"] = '340M'
        elif 'gpt2' in name_lower:
            if 'medium' in name_lower:
                enhanced["parameters"] = '345M'
            elif 'large' in name_lower:
                enhanced["parameters"] = '762M'
            elif 'xl' in name_lower:
                enhanced["parameters"] = '1.5B'
            else:
                enhanced["parameters"] = '117M'
        
        # Set context length based on model type
        if 'bert' in name_lower or 'roberta' in name_lower:
            enhanced["contextLength"] = 512
        elif 'gpt2' in name_lower:
            enhanced["contextLength"] = 1024
        elif 'gpt3' in name_lower or 'gpt-3' in name_lower:
            enhanced["contextLength"] = 2048
        elif 'llama' in name_lower:
            if '3.1' in name_lower or '3.2' in name_lower:
                enhanced["contextLength"] = 131072  # Llama 3.1/3.2
            else:
                enhanced["contextLength"] = 4096   # Llama 2
        elif 'mistral' in name_lower:
            enhanced["contextLength"] = 32768
        elif 'claude' in name_lower:
            enhanced["contextLength"] = 200000
        elif 'bloom' in name_lower:
            enhanced["contextLength"] = 2048
        
        # Try to fetch config for more accurate info (with timeout and error handling)
        try:
            import requests
            config_url = f'https://huggingface.co/{model_id}/raw/main/config.json'
            response = requests.get(config_url, timeout=5)
            if response.status_code == 200:
                config = response.json()
                
                # Get context length from config
                context_keys = ['max_position_embeddings', 'n_positions', 'max_sequence_length', 'sequence_length']
                for key in context_keys:
                    if key in config and config[key]:
                        enhanced["contextLength"] = config[key]
                        break
                        
        except Exception:
            # Silently fail - we have fallbacks
            pass
        
        return enhanced
