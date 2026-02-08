import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from services.kafka_consumer import KafkaConsumerService
from utils.kafka_producer import KafkaProducerService

@pytest.mark.asyncio
async def test_kafka_consumer_process_event():
    consumer = KafkaConsumerService()
    consumer.consumer = AsyncMock()
    
    # Mock message
    mock_msg = MagicMock()
    mock_msg.value = {"studentId": "123", "resumeUrl": "http://test.com/resume.pdf"}
    
    # Mock the consumer iterator
    consumer.consumer.__aiter__.return_value = [mock_msg]
    consumer.running = True
    
    with patch("services.kafka_consumer.process_resume_from_url", new_callable=AsyncMock) as mock_process:
        # We run consume only for one iteration (the list above)
        await consumer.consume()
        
        mock_process.assert_called_with("123", "http://test.com/resume.pdf")

@pytest.mark.asyncio
async def test_kafka_producer_publish():
    producer = KafkaProducerService()
    producer.producer = AsyncMock()
    
    await producer.publish_event("test-topic", "key", {"data": "value"})
    
    producer.producer.send_and_wait.assert_called_once()
    args, _ = producer.producer.send_and_wait.call_args
    assert args[0] == "test-topic"
    assert args[1] == {"data": "value"}
