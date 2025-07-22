from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId
from datetime import datetime
import logging
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

from models.memory import MemoryEntry, MemoryEntryCreate, MemoryEntryResponse, MemoryPrompt, MemoryStats

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

router = APIRouter()

# Predefined memory prompts for seniors - Canadian edition
MEMORY_PROMPTS = [
    {"id": 1, "category": "Family", "prompt": "Tell me about your wedding day, eh? What do you remember most about that special day?"},
    {"id": 2, "category": "Childhood", "prompt": "What was your favorite thing to do as a child growing up in Canada?"},
    {"id": 3, "category": "Family", "prompt": "Tell me about your children when they were little tykes, eh?"},
    {"id": 4, "category": "Work", "prompt": "What kind of work did you do, eh? What was a typical day like for you?"},
    {"id": 5, "category": "Home", "prompt": "Describe the house you grew up in, eh? What was your favorite room?"},
    {"id": 6, "category": "Friends", "prompt": "Tell me about your best friend, eh? How did you two meet?"},
    {"id": 7, "category": "Holidays", "prompt": "What was your favorite holiday, eh? How did your family celebrate it?"},
    {"id": 8, "category": "Travel", "prompt": "Tell me about a place you visited that you'll never forget, eh?"},
    {"id": 9, "category": "School", "prompt": "What do you remember about your school days, eh? Who was your favorite teacher?"},
    {"id": 10, "category": "Hobbies", "prompt": "What did you like to do in your free time, eh? What made you happy?"},
    {"id": 11, "category": "Family", "prompt": "Tell me about your parents, eh? What were they like?"},
    {"id": 12, "category": "Pets", "prompt": "Did you have any pets, eh? Tell me about them."},
    {"id": 13, "category": "Food", "prompt": "What was your favorite meal, eh? Who used to cook it for you?"},
    {"id": 14, "category": "Music", "prompt": "What songs do you remember from when you were young, eh?"},
    {"id": 15, "category": "Weather", "prompt": "Tell me about the worst winter storm you remember, eh? How did you get through it?"},
    {"id": 16, "category": "Community", "prompt": "Tell me about your neighborhood, eh? Who were your neighbors?"},
    {"id": 17, "category": "Sports", "prompt": "Did you play any sports or watch hockey, eh? Tell me about that."},
    {"id": 18, "category": "Traditions", "prompt": "What Canadian traditions did your family celebrate, eh?"}
]

def get_collection() -> AsyncIOMotorCollection:
    return db.memory_entries

@router.get("/prompts", response_model=List[MemoryPrompt])
async def get_memory_prompts():
    """Get all available memory prompts"""
    try:
        return [MemoryPrompt(**prompt) for prompt in MEMORY_PROMPTS]
    except Exception as e:
        logger.error(f"Error fetching prompts: {e}")
        raise HTTPException(status_code=500, detail="Error fetching prompts")

@router.get("/prompts/random", response_model=MemoryPrompt)
async def get_random_prompt():
    """Get a random memory prompt"""
    try:
        import random
        prompt = random.choice(MEMORY_PROMPTS)
        return MemoryPrompt(**prompt)
    except Exception as e:
        logger.error(f"Error fetching random prompt: {e}")
        raise HTTPException(status_code=500, detail="Error fetching random prompt")

@router.post("/entries", response_model=MemoryEntryResponse)
async def create_memory_entry(entry: MemoryEntryCreate):
    """Create a new memory entry"""
    try:
        collection = get_collection()
        
        # Create memory entry
        memory_entry = MemoryEntry(
            prompt=entry.prompt,
            content=entry.content,
            category=entry.category,
            word_count=entry.word_count,
            audio_recording=entry.audio_recording,
            audio_data=entry.audio_data
        )
        
        # Convert to dict for MongoDB
        entry_dict = memory_entry.dict()
        
        # Insert into database
        result = await collection.insert_one(entry_dict)
        
        if result.inserted_id:
            # Fetch the created entry
            created_entry = await collection.find_one({"_id": result.inserted_id})
            created_entry["id"] = str(created_entry["_id"])
            del created_entry["_id"]
            
            return MemoryEntryResponse(**created_entry)
        else:
            raise HTTPException(status_code=500, detail="Failed to create memory entry")
            
    except Exception as e:
        logger.error(f"Error creating memory entry: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating memory entry: {str(e)}")

@router.get("/entries", response_model=List[MemoryEntryResponse])
async def get_memory_entries(skip: int = 0, limit: int = 100):
    """Get all memory entries"""
    try:
        collection = get_collection()
        
        # Fetch entries sorted by date (newest first)
        cursor = collection.find().sort("date", -1).skip(skip).limit(limit)
        entries = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for entry in entries:
            entry["id"] = str(entry["_id"])
            del entry["_id"]
            
        return [MemoryEntryResponse(**entry) for entry in entries]
        
    except Exception as e:
        logger.error(f"Error fetching memory entries: {e}")
        raise HTTPException(status_code=500, detail="Error fetching memory entries")

@router.get("/entries/{entry_id}", response_model=MemoryEntryResponse)
async def get_memory_entry(entry_id: str):
    """Get a specific memory entry"""
    try:
        collection = get_collection()
        
        # Try to find by custom id first, then by ObjectId
        entry = await collection.find_one({"id": entry_id})
        if not entry:
            try:
                entry = await collection.find_one({"_id": ObjectId(entry_id)})
            except:
                pass
                
        if not entry:
            raise HTTPException(status_code=404, detail="Memory entry not found")
            
        entry["id"] = str(entry.get("_id", entry.get("id")))
        if "_id" in entry:
            del entry["_id"]
            
        return MemoryEntryResponse(**entry)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching memory entry: {e}")
        raise HTTPException(status_code=500, detail="Error fetching memory entry")

@router.put("/entries/{entry_id}", response_model=MemoryEntryResponse)
async def update_memory_entry(entry_id: str, entry: MemoryEntryCreate):
    """Update a memory entry"""
    try:
        collection = get_collection()
        
        # Update data
        update_data = entry.dict()
        update_data["updated_at"] = datetime.utcnow()
        
        # Try to update by custom id first, then by ObjectId
        result = await collection.update_one(
            {"id": entry_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            try:
                result = await collection.update_one(
                    {"_id": ObjectId(entry_id)},
                    {"$set": update_data}
                )
            except:
                pass
                
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Memory entry not found")
            
        # Fetch updated entry
        updated_entry = await collection.find_one({"id": entry_id})
        if not updated_entry:
            updated_entry = await collection.find_one({"_id": ObjectId(entry_id)})
            
        updated_entry["id"] = str(updated_entry.get("_id", updated_entry.get("id")))
        if "_id" in updated_entry:
            del updated_entry["_id"]
            
        return MemoryEntryResponse(**updated_entry)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating memory entry: {e}")
        raise HTTPException(status_code=500, detail="Error updating memory entry")

@router.delete("/entries/{entry_id}")
async def delete_memory_entry(entry_id: str):
    """Delete a memory entry"""
    try:
        collection = get_collection()
        
        # Try to delete by custom id first, then by ObjectId
        result = await collection.delete_one({"id": entry_id})
        
        if result.deleted_count == 0:
            try:
                result = await collection.delete_one({"_id": ObjectId(entry_id)})
            except:
                pass
                
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Memory entry not found")
            
        return {"message": "Memory entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting memory entry: {e}")
        raise HTTPException(status_code=500, detail="Error deleting memory entry")

@router.get("/stats", response_model=MemoryStats)
async def get_memory_stats():
    """Get memory statistics"""
    try:
        collection = get_collection()
        
        # Get total count
        total_entries = await collection.count_documents({})
        
        if total_entries == 0:
            return MemoryStats(
                total_entries=0,
                total_words=0,
                average_words=0,
                categories={},
                recent_entries=[]
            )
        
        # Get all entries for stats calculation
        all_entries = await collection.find().to_list(length=None)
        
        # Calculate stats
        total_words = sum(entry.get("word_count", 0) for entry in all_entries)
        average_words = total_words // total_entries if total_entries > 0 else 0
        
        # Category counts
        categories = {}
        for entry in all_entries:
            category = entry.get("category", "Unknown")
            categories[category] = categories.get(category, 0) + 1
        
        # Recent entries (last 5)
        recent_entries = await collection.find().sort("date", -1).limit(5).to_list(length=5)
        for entry in recent_entries:
            entry["id"] = str(entry["_id"])
            del entry["_id"]
        
        return MemoryStats(
            total_entries=total_entries,
            total_words=total_words,
            average_words=average_words,
            categories=categories,
            recent_entries=[MemoryEntryResponse(**entry) for entry in recent_entries]
        )
        
    except Exception as e:
        logger.error(f"Error fetching memory stats: {e}")
        raise HTTPException(status_code=500, detail="Error fetching memory stats")