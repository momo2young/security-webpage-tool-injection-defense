"""
Embedding generation for memory content using LiteLLM.
"""

from typing import List
import asyncio
from loguru import logger
import litellm

from suzent.config import CONFIG

# Drop unsupported parameters when calling embedding APIs
litellm.drop_params = True


class EmbeddingGenerator:
    """Generate embeddings for memory content using LiteLLM."""

    def __init__(self, model: str = None, dimension: int = 0):
        """Initialize embedding generator.
        
        Args:
            model: LiteLLM model identifier (e.g., 'text-embedding-3-small')
            dimension: Expected embedding dimension (0 = auto-detect from first response)
        """
        self.model = model or CONFIG.embedding_model
        self.dimension = dimension or CONFIG.embedding_dimension

    async def generate(self, text: str) -> List[float]:
        """Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            List of floats representing the embedding vector
            
        Raises:
            ValueError: If embedding dimension doesn't match expected dimension
        """
        if not text or not text.strip():
            return [0.0] * self.dimension

        try:
            response = await asyncio.to_thread(
                litellm.embedding,
                model=self.model,
                input=text
            )

            embedding = response.data[0]["embedding"]

            # Auto-detect dimension on first call
            if not self.dimension:
                self.dimension = len(embedding)
                logger.info(f"Auto-detected embedding dimension: {self.dimension} (model={self.model})")

            # Validate dimension match
            if self.dimension != len(embedding):
                raise ValueError(
                    f"Embedding dimension mismatch: expected {self.dimension}, "
                    f"got {len(embedding)} from model={self.model}"
                )

            return embedding

        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return [0.0] * (self.dimension or 1)

    async def generate_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches.
        
        Args:
            texts: List of texts to embed
            batch_size: Number of texts to process in each batch
            
        Returns:
            List of embedding vectors, one per input text
        """
        if not texts:
            return []

        all_embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]

            try:
                response = await asyncio.to_thread(
                    litellm.embedding,
                    model=self.model,
                    input=batch
                )

                batch_embeddings = [item['embedding'] for item in response.data]
                all_embeddings.extend(batch_embeddings)

            except Exception as e:
                logger.error(f"Failed to generate batch embeddings: {e}")
                all_embeddings.extend([[0.0] * self.dimension] * len(batch))

        return all_embeddings
