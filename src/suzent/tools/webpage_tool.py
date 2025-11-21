from smolagents.tools import Tool
from typing import Optional, Union

import asyncio
from crawl4ai import AsyncWebCrawler

class WebpageTool(Tool):
    """
    A tool for retrieving content from web pages.
    """
    description: str = "A tool for retrieving content from web pages."
    name: str = "WebpageTool"
    is_initialized: bool = False

    inputs: dict[str, dict[str, Union[str, type, bool]]] = {
        "url": {"type": "string", "description": "The URL of the page to retrieve content from."},
    }
    output_type: str = "string"

    async def _crawl_url(self, url: str) -> str:
        """Async helper to properly initialize and use the crawler."""
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)
            return result.markdown if result else "Error: Unable to retrieve content from the specified URL."

    def forward(self, url: str) -> str:
        return asyncio.run(self._crawl_url(url))


        
        

