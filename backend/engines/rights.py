"""Rights normalisation engine for THE SILENCE INDEX.
Maps declared rights strings to standard cultural heritage rights categories:
CC0 | PDM | CC_BY | CC_BY_SA | CC_BY_NC | CC_BY_ND | CC_OTHER | IN_COPYRIGHT | UNKNOWN | NEEDS_REVIEW.
Determines download eligibility according to open-access terms.
"""
from enum import Enum
from typing import Tuple, Dict, Any
import re

class RightsCategory(str, Enum):
    CC0 = "CC0"
    PDM = "PDM"                   # Public Domain Mark / No known copyright
    CC_BY = "CC_BY"               # Creative Commons Attribution
    CC_BY_SA = "CC_BY_SA"         # Creative Commons Attribution-ShareAlike
    CC_BY_NC = "CC_BY_NC"         # CC Attribution-NonCommercial
    CC_BY_ND = "CC_BY_ND"         # CC Attribution-NoDerivatives
    CC_OTHER = "CC_OTHER"         # Other CC licences (NC-SA, NC-ND, etc.)
    IN_COPYRIGHT = "IN_COPYRIGHT" # All rights reserved / In copyright
    UNKNOWN = "UNKNOWN"           # Missing or unspecified rights
    NEEDS_REVIEW = "NEEDS_REVIEW" # Ambiguous, multi-licensed, or contradictory

# Categories where download and reuse is permitted
REUSABLE_CATEGORIES = {
    RightsCategory.CC0,
    RightsCategory.PDM,
    RightsCategory.CC_BY,
    RightsCategory.CC_BY_SA,
}

def normalise_rights(declared: str | None, raw_payload: Dict[str, Any] | None = None) -> Tuple[RightsCategory, bool, str]:
    """Normalise a declared rights/license string into RightsCategory, download_allowed flag,
    and a clear human-readable explanation.
    
    Returns:
        (category, download_allowed, explanation)
    """
    if not declared or not declared.strip():
        return (
            RightsCategory.UNKNOWN,
            False,
            "No rights or license information was declared by the provider. Redistribution disallowed."
        )

    text = declared.strip().lower()
    
    # Check for multi-licensed or conflicting flags
    if raw_payload and raw_payload.get("multi_licensed"):
        return (
            RightsCategory.NEEDS_REVIEW,
            False,
            "Multiple or conflicting licenses detected in provider metadata. Manual review required."
        )
        
    if "needs review" in text or "conflict" in text:
        return (
            RightsCategory.NEEDS_REVIEW,
            False,
            "Declared rights contain conflicting or unresolved restrictions."
        )

    # 1. Public Domain / CC0
    if re.search(r"\b(cc0|cc-zero|public domain zero)\b", text):
        return (
            RightsCategory.CC0,
            True,
            "Dedicated to the public domain under Creative Commons Zero (CC0). Unrestricted reuse."
        )
    if re.search(r"\b(pdm|public domain|no known copyright|pd-old|pd-art|pd-india|pd-us|pd)\b", text):
        return (
            RightsCategory.PDM,
            True,
            "Public Domain Mark: The work is free of known copyright restrictions. Reuse allowed."
        )

    # 2. CC Non-commercial or No-derivatives combinations
    if "cc-by-nc-sa" in text or "cc by-nc-sa" in text:
        return (
            RightsCategory.CC_OTHER,
            False,
            "Licensed under CC BY-NC-SA. Non-commercial and Share-Alike restrictions apply."
        )
    if "cc-by-nc-nd" in text or "cc by-nc-nd" in text:
        return (
            RightsCategory.CC_OTHER,
            False,
            "Licensed under CC BY-NC-ND. Non-commercial and No-Derivatives restrictions apply."
        )
    if re.search(r"\b(cc-by-nc|cc by-nc|non-commercial|noncommercial)\b", text):
        return (
            RightsCategory.CC_BY_NC,
            False,
            "Licensed under CC BY-NC. Non-commercial restriction: direct download restricted to source viewer."
        )
    if re.search(r"\b(cc-by-nd|cc by-nd|no derivatives|noderivs)\b", text):
        return (
            RightsCategory.CC_BY_ND,
            False,
            "Licensed under CC BY-ND. No-Derivatives restriction applies."
        )

    # 3. CC BY-SA
    if re.search(r"\b(cc-by-sa|cc by-sa|attribution-sharealike|share-alike|cc-sa)\b", text):
        return (
            RightsCategory.CC_BY_SA,
            True,
            "Licensed under Creative Commons Attribution-ShareAlike (CC BY-SA). Attribution and share-alike required."
        )

    # 4. CC BY
    if re.search(r"\b(cc-by|cc by|attribution|cc-attribution)\b", text):
        return (
            RightsCategory.CC_BY,
            True,
            "Licensed under Creative Commons Attribution (CC BY). Reuse permitted with mandatory attribution."
        )

    # 5. In Copyright / All Rights Reserved
    if re.search(r"\b(all rights reserved|copyright|in copyright|proprietary|under copyright)\b", text):
        return (
            RightsCategory.IN_COPYRIGHT,
            False,
            "Under copyright protection. Consult source institution; digital reproduction restricted."
        )

    # Fallback to NEEDS_REVIEW for unrecognised non-empty strings
    return (
        RightsCategory.NEEDS_REVIEW,
        False,
        f"Unrecognized rights declaration '{declared}'. Needs institutional review."
    )

