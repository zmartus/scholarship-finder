from abc import ABC, abstractmethod
from collections.abc import Iterable

import httpx

from scraper.models import ScholarshipItem


class Source(ABC):
    name: str
    user_agent = "ScholarshipFinderBot/0.1 (+contact via project repo)"
    timeout = httpx.Timeout(30.0)

    @abstractmethod
    def fetch(self, client: httpx.Client) -> Iterable[ScholarshipItem]:
        """Yield normalized ScholarshipItems for this source."""

    def run(self) -> list[ScholarshipItem]:
        headers = {"User-Agent": self.user_agent}
        with httpx.Client(headers=headers, timeout=self.timeout, follow_redirects=True) as client:
            return list(self.fetch(client))
