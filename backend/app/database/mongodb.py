import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

from core.config import settings
from core.exceptions import DatabaseConnectionException

logger = logging.getLogger(__name__)


class MongoDBManager:
    """
    Manages the lifecycle of the asynchronous MongoDB client and database connections.
    Includes connection initializations, shutdowns, and health check diagnostics.
    """

    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None
        self.uri = settings.MONGODB_URI
        self.db_name = settings.DATABASE_NAME

    async def connect(self) -> None:
        """
        Initializes the async MongoDB client and verifies credentials/connectivity on startup.
        """
        logger.info(f"Attempting connection to MongoDB database... URI: '{self.uri}'")
        try:
            import certifi
            self.client = AsyncIOMotorClient(
                self.uri,
                serverSelectionTimeoutMS=5000,
                tlsCAFile=certifi.where()
            )
            self.db = self.client[self.db_name]
            
            # Ping the database to verify active connection
            await self.client.admin.command("ping")
            logger.info(f"MongoDB connection established successfully. Database: '{self.db_name}'")
        except Exception as e:
            logger.critical(f"MongoDB database connection failed: {e}")
            raise DatabaseConnectionException(f"Failed to connect to MongoDB: {e}") from e

    async def disconnect(self) -> None:
        """
        Closes connection pools and cleans up resources on application shutdown.
        """
        if self.client:
            logger.info("Closing MongoDB database connection pool...")
            self.client.close()
            logger.info("MongoDB connection pool closed successfully.")

    async def verify_connectivity(self) -> bool:
        """
        Pings the database to diagnose connectivity status.
        """
        if not self.client:
            logger.warning("MongoDB ping check failed: Client has not been initialized.")
            return False
        try:
            # Set short timeout to prevent telemetry blockings
            await asyncio.wait_for(self.client.admin.command("ping"), timeout=2.0)
            return True
        except Exception as e:
            logger.error(f"MongoDB connection health status check failed: {e}")
            return False
