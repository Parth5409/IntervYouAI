"""
Embedding models configuration using LangChain and Ollama
"""

import os
import logging
from typing import List, Dict, Any, Optional
from langchain_ollama import OllamaEmbeddings
from langchain.embeddings.base import Embeddings

logger = logging.getLogger(__name__)

class EmbeddingManager:
    """Manages embedding models for the interview platform"""
    
    def __init__(self, model_name: str = "all-minilm:l6-v2", base_url: Optional[str] = None):
        """
        Initialize embedding manager
        
        Args:
            model_name: Ollama embedding model name
            base_url: Ollama server base URL
        """
        self.model_name = model_name
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        try:
            # Initialize Ollama embeddings
            self.embeddings = OllamaEmbeddings(
                num_ctx=2048,
                temperature=0.1,
                model=model_name,
                base_url=self.base_url
            )
            
            logger.info(f"Initialized embedding model '{model_name}' at {self.base_url}")
            
            # Test the embedding model
            self._test_embedding()
            
        except Exception as e:
            logger.error(f"Failed to initialize embedding model: {e}")
            raise
    
    def _test_embedding(self):
        """Test if the embedding model is working"""
        try:
            test_text = "This is a test sentence for embedding."
            embedding = self.embeddings.embed_query(test_text)
            
            if not embedding or len(embedding) == 0:
                raise ValueError("Empty embedding returned")
            
            logger.info(f"Embedding model test successful. Dimension: {len(embedding)}")
            
        except Exception as e:
            logger.error(f"Embedding model test failed: {e}")
            raise
    
    async def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """
        Embed multiple documents
        
        Args:
            documents: List of document texts
            
        Returns:
            List of embeddings
        """
        try:
            if not documents:
                return []
            
            logger.info(f"Embedding {len(documents)} documents")
            
            # Use async embedding if available, otherwise fallback to sync
            if hasattr(self.embeddings, 'aembed_documents'):
                embeddings = await self.embeddings.aembed_documents(documents)
            else:
                embeddings = self.embeddings.embed_documents(documents)
            
            logger.info(f"Successfully embedded {len(embeddings)} documents")
            return embeddings
            
        except Exception as e:
            logger.error(f"Error embedding documents: {e}")
            raise
    
    async def embed_query(self, query: str) -> List[float]:
        """
        Embed a single query
        
        Args:
            query: Query text
            
        Returns:
            Query embedding
        """
        try:
            if not query.strip():
                raise ValueError("Empty query provided")
            
            logger.debug(f"Embedding query: {query[:100]}...")
            
            # Use async embedding if available
            if hasattr(self.embeddings, 'aembed_query'):
                embedding = await self.embeddings.aembed_query(query)
            else:
                embedding = self.embeddings.embed_query(query)
            
            return embedding
            
        except Exception as e:
            logger.error(f"Error embedding query: {e}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings produced by this model
        
        Returns:
            Embedding dimension
        """
        try:
            # Test with a simple query to get dimension
            test_embedding = self.embeddings.embed_query("test")
            return len(test_embedding)
        except Exception as e:
            logger.error(f"Error getting embedding dimension: {e}")
            # Default dimension for all-minilm model
            return 384
    
    def embed_chunks_with_metadata(
        self, 
        chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Embed document chunks while preserving metadata
        
        Args:
            chunks: List of chunks with content and metadata
            
        Returns:
            Chunks with embeddings added
        """
        try:
            texts = [chunk['content'] for chunk in chunks]
            embeddings = self.embeddings.embed_documents(texts)
            
            # Add embeddings to chunks
            for chunk, embedding in zip(chunks, embeddings):
                chunk['embedding'] = embedding
            
            logger.info(f"Added embeddings to {len(chunks)} chunks")
            return chunks
            
        except Exception as e:
            logger.error(f"Error embedding chunks with metadata: {e}")
            raise
    
    def similarity_search_embeddings(
        self, 
        query_embedding: List[float], 
        document_embeddings: List[List[float]], 
        top_k: int = 5
    ) -> List[int]:
        """
        Find most similar documents using cosine similarity
        
        Args:
            query_embedding: Query embedding vector
            document_embeddings: List of document embedding vectors
            top_k: Number of top results to return
            
        Returns:
            Indices of most similar documents
        """
        try:
            import numpy as np
            from sklearn.metrics.pairwise import cosine_similarity
            
            # Convert to numpy arrays
            query_array = np.array(query_embedding).reshape(1, -1)
            doc_arrays = np.array(document_embeddings)
            
            # Compute cosine similarities
            similarities = cosine_similarity(query_array, doc_arrays)[0]
            
            # Get top k indices
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            return top_indices.tolist()
            
        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []

# Global embedding manager instance
_embedding_manager: Optional[EmbeddingManager] = None

def get_embedding_manager() -> EmbeddingManager:
    """Get global embedding manager instance"""
    global _embedding_manager
    
    if _embedding_manager is None:
        _embedding_manager = EmbeddingManager()
    
    return _embedding_manager

def initialize_embeddings(model_name: str = "all-minilm:l6-v2", base_url: Optional[str] = None):
    """Initialize global embedding manager with custom settings"""
    global _embedding_manager
    _embedding_manager = EmbeddingManager(model_name, base_url)
