import os
import json
import logging
from aiokafka import AIOKafkaProducer

logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

class KafkaProducerService:
    def __init__(self):
        self.producer = None

    async def start(self):
        if self.producer:
            return
        self.producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.producer.start()
        logger.info("Kafka Producer started")

    async def stop(self):
        if self.producer:
            await self.producer.stop()
            self.producer = None
        logger.info("Kafka Producer stopped")

    async def publish_event(self, topic: str, key: str, value: dict):
        if not self.producer:
            await self.start()
        
        try:
            await self.producer.send_and_wait(topic, value, key=key.encode('utf-8'))
            logger.info(f"Published event to {topic}: {key}")
        except Exception as e:
            logger.error(f"Failed to publish event to {topic}: {e}")

# Global producer instance
kafka_producer = KafkaProducerService()
