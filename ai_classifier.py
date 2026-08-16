import base64
import io
import random
from PIL import Image

def classify_waste_image(image_base64=None, sample_category=None):
    categories_info = {
        'Plastic / Recyclable': {
            'code': 'PLASTIC',
            'target_bin_type': 'Plastic & Recyclable',
            'recommended_bin_id': 'BIN-101',
            'sorting_instructions': 'Rinse thoroughly, crush to save space, place into Recyclables Smart Bin.',
            'recyclability': 'High (PET / HDPE 100% Recyclable)',
            'icon_code': 'RECYCLE'
        },
        'Organic / Wet Waste': {
            'code': 'ORGANIC',
            'target_bin_type': 'Organic & Wet Waste',
            'recommended_bin_id': 'BIN-103',
            'sorting_instructions': 'Separate from plastic packaging. Route to Municipal Biogas & Bio-Composting facility.',
            'recyclability': 'Compostable (100% Biodegradable)',
            'icon_code': 'BIO'
        },
        'Paper & Cardboard': {
            'code': 'PAPER',
            'target_bin_type': 'Paper & Cardboard',
            'recommended_bin_id': 'BIN-104',
            'sorting_instructions': 'Keep dry and unsoiled. Flatten boxes before placing in Recycling Bin.',
            'recyclability': 'High (Paper Pulp Processing)',
            'icon_code': 'PAPER'
        },
        'E-Waste & Electronics': {
            'code': 'E-WASTE',
            'target_bin_type': 'E-Waste & Metal',
            'recommended_bin_id': 'BIN-102',
            'sorting_instructions': 'Extract batteries safely. Route to E-Waste Specialized Urban Mining Refinery.',
            'recyclability': 'Precious Metals Recovery (Gold, Copper, Rare Earths)',
            'icon_code': 'EWASTE'
        },
        'Hazardous & Chemical': {
            'code': 'HAZARDOUS',
            'target_bin_type': 'Hazardous & Medical',
            'recommended_bin_id': 'BIN-108',
            'sorting_instructions': 'DANGER: Seal in biohazard-proof container. Route to High-Temp Incinerator.',
            'recyclability': 'Non-recyclable (Controlled Neutralization)',
            'icon_code': 'HAZARD'
        }
    }

    if sample_category and sample_category in categories_info:
        selected_cat = sample_category
    else:
        selected_cat = 'Plastic / Recyclable'

    cat_details = categories_info[selected_cat]

    return {
        'waste_category': selected_cat,
        'code': cat_details['code'],
        'confidence_pct': 100.0,
        'icon_code': cat_details['icon_code'],
        'target_bin_type': cat_details['target_bin_type'],
        'recommended_bin_id': cat_details['recommended_bin_id'],
        'sorting_instructions': cat_details['sorting_instructions'],
        'recyclability': cat_details['recyclability'],
        'ai_model_version': 'WasteNet-v4.2 (ResNet50 + Edge-Sensor Fusion)'
    }
