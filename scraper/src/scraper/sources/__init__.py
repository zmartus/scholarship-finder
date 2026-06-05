from .base import Source
from .florida_state import FloridaState
from .nationals import Nationals
from .northeast_florida_local import NortheastFloridaLocal
from .uf_sfa import UFStudentFinancialAffairs

REGISTRY: dict[str, type[Source]] = {
    "uf_sfa": UFStudentFinancialAffairs,
    "nationals": Nationals,
    "florida_state": FloridaState,
    "northeast_florida_local": NortheastFloridaLocal,
}


def get_source(name: str) -> Source:
    if name not in REGISTRY:
        raise KeyError(f"Unknown source '{name}'. Known: {sorted(REGISTRY)}")
    return REGISTRY[name]()


def all_sources() -> list[Source]:
    return [cls() for cls in REGISTRY.values()]
