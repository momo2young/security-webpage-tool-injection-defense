import re
import asyncio
from urllib.parse import urlparse
from typing import Union

from crawl4ai import AsyncWebCrawler
from smolagents.tools import Tool

from suzent.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Security constants
# ---------------------------------------------------------------------------

# Only http and https are permitted
ALLOWED_SCHEMES = {"http", "https"}

# Blocked domains set — can be extended at runtime via config
BLOCKED_DOMAINS: set[str] = set()

# Max characters returned to the LLM to avoid context overflow
MAX_CONTENT_LENGTH = 50_000

# ---------------------------------------------------------------------------
# Prompt injection detection
# ---------------------------------------------------------------------------

# Regex patterns covering common prompt injection techniques
_INJECTION_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\b", re.IGNORECASE),
    re.compile(r"new\s+(system\s+)?prompt", re.IGNORECASE),
    re.compile(r"</?system>", re.IGNORECASE),
    re.compile(r"\[INST\]|\[/INST\]", re.IGNORECASE),                # Llama chat format
    re.compile(r"<\|im_start\|>|<\|im_end\|>", re.IGNORECASE),       # ChatML format
    re.compile(r"###\s*(system|assistant)\b", re.IGNORECASE),         # Markdown role declaration
    re.compile(r"act\s+as\s+(a\s+)?.*?(admin|root|developer|system)", re.IGNORECASE),
    re.compile(r"(forget|disregard|override)\s+.*?(safety|rules?|instructions?|guidelines?)", re.IGNORECASE),
    re.compile(r"you\s+(must|should|have\s+to)\s+.{0,30}(ignore|bypass|skip)", re.IGNORECASE),
]


def _detect_injection(content: str) -> list[str]:
    """Scan content for prompt injection patterns.

    Args:
        content: The text to scan.

    Returns:
        A list of suspicious snippets (with surrounding context).
        An empty list means no injection was detected.
    """
    hits: list[str] = []
    for pattern in _INJECTION_PATTERNS:
        for match in pattern.finditer(content):
            # Capture 40 chars of context around each match
            start = max(0, match.start() - 40)
            end = min(len(content), match.end() + 40)
            hits.append(content[start:end])
    return hits


def _sanitize_content(content: str) -> str:
    """Truncate oversized content and strip residual HTML tags.

    Args:
        content: Raw content from the crawler.

    Returns:
        Cleaned content, safe to pass to the LLM.
    """
    if len(content) > MAX_CONTENT_LENGTH:
        logger.warning("WebpageTool: content exceeded %d chars, truncating", MAX_CONTENT_LENGTH)
        content = content[:MAX_CONTENT_LENGTH] + "\n\n[Content truncated]"

    # Strip any residual HTML tags (crawl4ai outputs markdown, but belt-and-suspenders)
    content = re.sub(r"<[^>]+>", "", content)
    return content


# ---------------------------------------------------------------------------
# URL validation
# ---------------------------------------------------------------------------


def _validate_url(url: str) -> tuple[bool, str]:
    """Validate a URL against the security policy.

    Checks:
        - Non-empty and parseable
        - Scheme is in the allowed whitelist
        - Hostname is present
        - Hostname is not in the blocked domains list

    Args:
        url: The URL string to validate.

    Returns:
        A tuple of (is_valid, reason). reason is empty when valid.
    """
    url = url.strip()
    if not url:
        return False, "URL is empty."

    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Failed to parse URL: {e}"

    # Scheme whitelist
    if parsed.scheme.lower() not in ALLOWED_SCHEMES:
        return False, f"Scheme '{parsed.scheme}' is not allowed. Permitted: {ALLOWED_SCHEMES}"

    # Must have a valid host
    if not parsed.hostname:
        return False, "URL has no valid hostname."

    # Domain blocklist (includes subdomains)
    hostname = parsed.hostname.lower()
    if any(hostname == blocked or hostname.endswith("." + blocked) for blocked in BLOCKED_DOMAINS):
        return False, f"Domain '{hostname}' is on the blocked list."

    return True, ""


# ---------------------------------------------------------------------------
# Tool
# ---------------------------------------------------------------------------


class WebpageTool(Tool):
    """Retrieve and sanitize content from a web page.

    Security measures applied before content reaches the LLM:
        1. URL scheme and domain validation
        2. Content truncation to avoid context overflow
        3. Residual HTML tag stripping
        4. Prompt injection pattern detection — blocked content is never returned

    Example:
        result = WebpageTool().forward("https://example.com/article")
    """

    description: str = (
        "A tool for retrieving content from web pages. "
        "Validates URLs and sanitizes returned content to prevent injection attacks."
    )
    name: str = "WebpageTool"
    is_initialized: bool = False

    inputs: dict[str, dict[str, Union[str, type, bool]]] = {
        "url": {
            "type": "string",
            "description": "The URL of the page to retrieve content from (http/https only).",
        },
    }
    output_type: str = "string"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _crawl_url(self, url: str) -> str:
        """Async helper to properly initialize and use the crawler."""
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)
            if not result:
                return "Error: Unable to retrieve content from the specified URL."
            # Convert to plain str to avoid pickle issues with StringCompatibleMarkdown
            # (crawl4ai's str subclass fails to unpickle because its __new__ expects
            # a MarkdownGenerationResult object, not a raw string)
            markdown = result.markdown
            return str(markdown) if markdown else ""

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def forward(self, url: str) -> str:
        """Fetch a web page, validate, sanitize, and return its content.

        Args:
            url: Target URL (http/https only).

        Returns:
            Sanitized page content, or an error/warning message if
            validation or injection checks fail.
        """
        # 1. Validate URL
        valid, reason = _validate_url(url)
        if not valid:
            logger.warning("WebpageTool: URL validation failed — %s | url=%s", reason, url)
            return f"[WebpageTool Error] URL validation failed: {reason}"

        logger.info("WebpageTool: fetching url=%s", url)

        # 2. Fetch content
        try:
            raw_content = asyncio.run(self._crawl_url(url))
        except Exception as e:
            logger.error("WebpageTool: fetch failed url=%s, error=%s", url, e)
            return f"[WebpageTool Error] Fetch failed: {e}"

        # 3. Sanitize (truncate + strip tags)
        content = _sanitize_content(raw_content)

        # 4. Prompt injection check — block content entirely if triggered
        injection_hits = _detect_injection(content)
        if injection_hits:
            logger.warning(
                "WebpageTool: prompt injection detected url=%s, hits=%d, snippets=%s",
                url,
                len(injection_hits),
                injection_hits,
            )
            return (
                "[WebpageTool Warning] Page content contains suspicious prompt injection snippets "
                "and has been blocked.\nDetected snippets:\n"
                + "\n".join(f"  - `{hit}`" for hit in injection_hits)
            )

        logger.info("WebpageTool: fetch successful url=%s, length=%d", url, len(content))
        return content
