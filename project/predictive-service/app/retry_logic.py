"""
Retry logic and error handling for API calls
"""
import asyncio
import logging
from typing import Callable, Any, Optional, TypeVar, Awaitable
from functools import wraps
import time

logger = logging.getLogger(__name__)

T = TypeVar('T')

class RetryConfig:
    """Configuration for retry logic"""
    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 60.0,
        exponential_base: float = 2.0,
        retryable_exceptions: tuple = (Exception,)
    ):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.retryable_exceptions = retryable_exceptions


async def retry_async(
    func: Callable[..., Awaitable[T]],
    *args,
    config: Optional[RetryConfig] = None,
    **kwargs
) -> T:
    """
    Retry an async function with exponential backoff
    
    Args:
        func: Async function to retry
        *args: Positional arguments for func
        config: Retry configuration
        **kwargs: Keyword arguments for func
    
    Returns:
        Result of func
    
    Raises:
        Last exception if all retries fail
    """
    if config is None:
        config = RetryConfig()
    
    last_exception = None
    delay = config.initial_delay
    
    for attempt in range(config.max_retries + 1):
        try:
            return await func(*args, **kwargs)
        except config.retryable_exceptions as e:
            last_exception = e
            
            if attempt < config.max_retries:
                logger.warning(
                    f"Attempt {attempt + 1}/{config.max_retries + 1} failed: {str(e)}. "
                    f"Retrying in {delay:.2f}s..."
                )
                await asyncio.sleep(delay)
                delay = min(delay * config.exponential_base, config.max_delay)
            else:
                logger.error(f"All {config.max_retries + 1} attempts failed. Last error: {str(e)}")
                raise
    
    # Should never reach here, but just in case
    if last_exception:
        raise last_exception
    raise Exception("Unexpected error in retry logic")


def retry_decorator(config: Optional[RetryConfig] = None):
    """
    Decorator for retrying async functions
    
    Usage:
        @retry_decorator(RetryConfig(max_retries=5))
        async def my_function():
            ...
    """
    def decorator(func: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await retry_async(func, *args, config=config, **kwargs)
        return wrapper
    return decorator


class CircuitBreaker:
    """Circuit breaker pattern for preventing cascading failures"""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        expected_exception: type = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = "closed"  # closed, open, half_open
    
    async def call(self, func: Callable[..., Awaitable[T]], *args, **kwargs) -> T:
        """Execute function with circuit breaker protection"""
        if self.state == "open":
            if time.time() - (self.last_failure_time or 0) > self.recovery_timeout:
                self.state = "half_open"
                logger.info("Circuit breaker moving to half-open state")
            else:
                raise Exception("Circuit breaker is open")
        
        try:
            result = await func(*args, **kwargs)
            if self.state == "half_open":
                self.state = "closed"
                self.failure_count = 0
                logger.info("Circuit breaker closed after successful call")
            return result
        except self.expected_exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
                logger.error(f"Circuit breaker opened after {self.failure_count} failures")
            
            raise





