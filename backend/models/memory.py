from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class MemoryPrompt(BaseModel):
    id: int
    category: str
    prompt: str

class MemoryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prompt: str
    content: str
    date: datetime = Field(default_factory=datetime.utcnow)
    category: str
    word_count: int = 0
    audio_recording: bool = False
    audio_data: Optional[str] = None  # Base64 encoded audio data
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MemoryEntryCreate(BaseModel):
    prompt: str
    content: str
    category: str
    word_count: int = 0
    audio_recording: bool = False
    audio_data: Optional[str] = None

class MemoryEntryResponse(BaseModel):
    id: str
    prompt: str
    content: str
    date: datetime
    category: str
    word_count: int
    audio_recording: bool
    audio_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class MemoryStats(BaseModel):
    total_entries: int
    total_words: int
    average_words: int
    categories: dict
    recent_entries: List[MemoryEntryResponse]