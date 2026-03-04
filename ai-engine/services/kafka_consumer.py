import os
import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer
from services.resume_processor import process_resume_from_url

logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC_RESUME_EVENTS = "resume-events"

class KafkaConsumerService:
    def __init__(self):
        self.consumer = None
        self.running = False
        self.task = None

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            TOPIC_RESUME_EVENTS,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id="ai-engine-group",
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        await self.consumer.start()
        self.running = True
        self.task = asyncio.create_task(self.consume())
        logger.info("Kafka Consumer started")

    async def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        if self.consumer:
            await self.consumer.stop()
        logger.info("Kafka Consumer stopped")

    async def consume(self):
        try:
            async for msg in self.consumer:
                if not self.running:
                    break
                
                try:
                    event = msg.value
                    logger.info(f"Received event: {event}")
                    
                    # Determine event type based on payload structure or explicit type
                    # For now, we assume everything in this topic is a resume upload
                    if "studentId" in event and "resumeUrl" in event:
                        await process_resume_from_url(event["studentId"], event["resumeUrl"])
                    else:
                        logger.warning(f"Unknown event format: {event}")
                        
                except Exception as e:
                    logger.exception("Error processing message")
                    
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.exception("Kafka consumer crashed")
