import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.resume_processor import process_resume_from_url

@pytest.mark.asyncio
async def test_process_resume_from_url_success():
    student_id = "test-student-123"
    resume_url = "http://example.com/resume.pdf"

    # Mock DocumentProcessor
    mock_doc_processor = MagicMock()
    mock_doc_processor.process_pdf_resume = AsyncMock(return_value={"chunks": ["chunk1", "chunk2"]})

    # Mock VectorStoreManager
    mock_vector_manager = MagicMock()
    mock_vector_manager.create_vector_store = AsyncMock()

    with (
        patch('services.resume_processor.DocumentProcessor', return_value=mock_doc_processor),
        patch('services.resume_processor.get_vector_store_manager', return_value=mock_vector_manager)
    ):
        
        await process_resume_from_url(student_id, resume_url)
        
        # Verify
        mock_doc_processor.process_pdf_resume.assert_called_with(resume_url)
        mock_vector_manager.create_vector_store.assert_called_once()
        
        # Check args
        args, kwargs = mock_vector_manager.create_vector_store.call_args
        assert kwargs['store_name'] == f"resume_user_{student_id}"
        assert kwargs['documents'] == ["chunk1", "chunk2"]

@pytest.mark.asyncio
async def test_process_resume_from_url_failure():
    # Simulate an error
    with (
        patch('services.resume_processor.DocumentProcessor', side_effect=Exception("Processing failed")),
        patch('services.resume_processor.logger') as mock_logger
    ):
        await process_resume_from_url("123", "http://bad-url.com")
        mock_logger.error.assert_called()
