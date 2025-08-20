import os
import logging
import io
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path

import pandas as pd
import PyPDF2
import httpx
from docx import Document

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LangChainDocument
from langchain_core.vectorstores import VectorStore
from langchain_core.retrievers import BaseRetriever
from langchain_community.vectorstores import FAISS, Chroma

from llm.embeddings import get_embedding_manager

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Processes various document types for RAG pipeline"""
    
    def __init__(self):
        """Initialize document processor"""
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        self.embedding_manager = get_embedding_manager()
    
    async def process_pdf_resume(self, resume_url: str) -> Dict[str, Any]:
        """
        Process PDF resume from a URL and extract relevant information
        """
        try:
            text_content = await self._extract_pdf_text_from_url(resume_url)
            
            if not text_content.strip():
                raise ValueError("No text content found in PDF")
            
            resume_info = self._extract_resume_info(text_content)
            chunks = self._create_text_chunks(text_content, "resume")
            
            for chunk in chunks:
                chunk.metadata.update({
                    "document_type": "resume",
                    "skills": resume_info.get("skills", []),
                    "experience_years": resume_info.get("experience_years", 0),
                    "job_titles": resume_info.get("job_titles", [])
                })
            
            return {
                "chunks": chunks,
                "resume_info": resume_info,
                "total_chunks": len(chunks),
                "original_text": text_content
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF resume: {e}")
            raise
    
    async def process_company_csv(self, file_path: str) -> Dict[str, Any]:
        """
        Process company CSV with leetcode questions and extract topics
        """
        try:
            df = pd.read_csv(file_path)
            if 'Topics' not in df.columns:
                raise ValueError("CSV must contain 'Topics' column")
            
            all_topics = []
            question_chunks = []
            
            for idx, row in df.iterrows():
                topics_str = str(row.get('Topics', ''))
                if pd.isna(topics_str) or not topics_str.strip():
                    continue
                
                topics = [topic.strip() for topic in topics_str.split(',') if topic.strip()]
                all_topics.extend(topics)
                
                question_text = f"Topics: {topics_str}"
                if 'Question' in row: question_text += f"\nQuestion: {row['Question']}"
                if 'Company' in row: question_text += f"\nCompany: {row['Company']}"
                if 'Difficulty' in row: question_text += f"\nDifficulty: {row['Difficulty']}"
                
                chunk = LangChainDocument(
                    page_content=question_text,
                    metadata={
                        "document_type": "company_questions",
                        "topics": topics,
                        "company": row.get('Company', 'Unknown'),
                        "difficulty": row.get('Difficulty', 'Medium'),
                        "question_id": idx
                    }
                )
                question_chunks.append(chunk)
            
            unique_topics = list(set(all_topics))
            topic_counts = {topic: all_topics.count(topic) for topic in unique_topics}
            
            return {
                "chunks": question_chunks,
                "topics": unique_topics,
                "topic_counts": topic_counts,
                "total_questions": len(question_chunks),
                "companies": df['Company'].unique().tolist() if 'Company' in df.columns else []
            }
            
        except Exception as e:
            logger.error(f"Error processing company CSV: {e}")
            raise
    
    async def _extract_pdf_text_from_url(self, url: str) -> str:
        """Extract text from PDF file from a URL."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
            
            text_content = ""
            with io.BytesIO(response.content) as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
            
            return text_content.strip()
            
        except Exception as e:
            logger.error(f"Error extracting PDF text from URL {url}: {e}")
            raise
    
    def _extract_resume_info(self, text: str) -> Dict[str, Any]:
        """Extract structured information from resume text"""
        # This is a simplified implementation. A more robust solution would use a dedicated NLP model.
        return {}

    def _create_text_chunks(self, text: str, doc_type: str) -> List[LangChainDocument]:
        """Create text chunks for vector storage"""
        try:
            chunks = self.text_splitter.split_text(text)
            documents = []
            for i, chunk in enumerate(chunks):
                doc = LangChainDocument(
                    page_content=chunk,
                    metadata={"document_type": doc_type, "chunk_index": i, "total_chunks": len(chunks)}
                )
                documents.append(doc)
            return documents
        except Exception as e:
            logger.error(f"Error creating text chunks: {e}")
            raise

class VectorStoreManager:
    """Manages vector stores for RAG pipeline"""
    
    def __init__(self, store_type: str = "faiss", persist_directory: str = "./vector_stores"):
        self.store_type = store_type.lower()
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.embedding_manager = get_embedding_manager()
        self.vector_stores: Dict[str, VectorStore] = {}
        logger.info(f"Initialized VectorStoreManager with {self.store_type}")
    
    async def create_vector_store(
        self, 
        documents: List[LangChainDocument], 
        store_name: str,
        overwrite: bool = False
    ) -> VectorStore:
        """Create and persist a vector store"""
        try:
            store_path = self.persist_directory / store_name
            if not overwrite and store_path.exists():
                logger.info(f"Loading existing vector store: {store_name}")
                return await self.load_vector_store(store_name)
            
            logger.info(f"Creating vector store '{store_name}' with {len(documents)} documents")
            embeddings = self.embedding_manager.embeddings
            
            if self.store_type == "faiss":
                vector_store = await FAISS.afrom_documents(documents=documents, embedding=embeddings)
                vector_store.save_local(str(store_path))
            elif self.store_type == "chroma":
                vector_store = await Chroma.afrom_documents(
                    documents=documents,
                    embedding=embeddings,
                    persist_directory=str(store_path)
                )
                vector_store.persist()
            else:
                raise ValueError(f"Unsupported vector store type: {self.store_type}")
            
            self.vector_stores[store_name] = vector_store
            logger.info(f"Successfully created vector store '{store_name}'")
            return vector_store
        except Exception as e:
            logger.error(f"Error creating vector store '{store_name}': {e}")
            raise
    
    async def load_vector_store(self, store_name: str) -> VectorStore:
        """Load existing vector store"""
        try:
            if store_name in self.vector_stores:
                return self.vector_stores[store_name]
            
            store_path = self.persist_directory / store_name
            if not store_path.exists():
                raise FileNotFoundError(f"Vector store '{store_name}' not found")
            
            embeddings = self.embedding_manager.embeddings
            
            if self.store_type == "faiss":
                vector_store = FAISS.load_local(
                    str(store_path),
                    embeddings,  # Corrected: Pass the embedding object directly
                    allow_dangerous_deserialization=True
                )
            elif self.store_type == "chroma":
                vector_store = Chroma(
                    persist_directory=str(store_path),
                    embedding_function=embeddings # Corrected: Pass the embedding object directly
                )
            else:
                raise ValueError(f"Unsupported vector store type: {self.store_type}")
            
            self.vector_stores[store_name] = vector_store
            logger.info(f"Successfully loaded vector store '{store_name}'")
            return vector_store
        except Exception as e:
            logger.error(f"Error loading vector store '{store_name}': {e}")
            raise
    
    async def similarity_search(
        self, 
        store_name: str, 
        query: str, 
        k: int = 5
    ) -> List[LangChainDocument]:
        """Perform similarity search"""
        try:
            if store_name not in self.vector_stores:
                await self.load_vector_store(store_name)
            
            vector_store = self.vector_stores[store_name]
            results = await vector_store.asimilarity_search(query, k=k)
            return results
        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []

# Global vector store manager
_vector_store_manager: Optional[VectorStoreManager] = None

def get_vector_store_manager() -> VectorStoreManager:
    """Get global vector store manager instance"""
    global _vector_store_manager
    if _vector_store_manager is None:
        _vector_store_manager = VectorStoreManager()
    return _vector_store_manager
