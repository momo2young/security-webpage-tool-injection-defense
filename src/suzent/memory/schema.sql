-- Memory System Schema for PostgreSQL with pgvector
-- Run this to initialize the memory system tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Core memory blocks table
CREATE TABLE IF NOT EXISTS memory_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT,
    user_id TEXT,
    label TEXT NOT NULL CHECK (label IN ('persona', 'user', 'facts', 'context')),
    content TEXT NOT NULL,
    max_size INTEGER DEFAULT 2048,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint using an expression index (allows NULL handling)
CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_blocks_unique_label
ON memory_blocks (label, COALESCE(chat_id, ''), COALESCE(user_id, ''));

CREATE INDEX IF NOT EXISTS idx_memory_blocks_chat_id ON memory_blocks(chat_id);
CREATE INDEX IF NOT EXISTS idx_memory_blocks_user_id ON memory_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_blocks_label ON memory_blocks(label);

-- Archival memories table with vector embeddings
CREATE TABLE IF NOT EXISTS archival_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT,
    user_id TEXT,
    content TEXT NOT NULL,
    embedding vector(3072),           -- pgvector type! Dimension depends on embedding model
    metadata JSONB DEFAULT '{}'::jsonb,
    importance REAL DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accessed_at TIMESTAMPTZ,          -- Last retrieval time
    access_count INTEGER DEFAULT 0,   -- How often retrieved
    content_fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Standard indexes
CREATE INDEX IF NOT EXISTS idx_archival_memories_chat_id ON archival_memories(chat_id);
CREATE INDEX IF NOT EXISTS idx_archival_memories_user_id ON archival_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_archival_memories_created_at ON archival_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archival_memories_accessed_at ON archival_memories(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_archival_memories_importance ON archival_memories(importance DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_archival_memories_fts ON archival_memories USING GIN(content_fts);

-- Vector similarity search index (IVFFlat for >2000 dimensions)
-- HNSW has a 2000 dimension limit, so use IVFFlat for 3072-dimensional embeddings
-- This may take a while to build on large datasets
CREATE INDEX IF NOT EXISTS idx_archival_memories_embedding ON archival_memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- JSONB metadata index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_archival_memories_metadata ON archival_memories USING GIN(metadata jsonb_path_ops);

-- Memory relationships table
CREATE TABLE IF NOT EXISTS memory_relationships (
    id SERIAL PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES archival_memories(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES archival_memories(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,  -- 'related', 'derived_from', 'conflicts_with', 'supersedes'
    strength REAL DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_self_reference CHECK (source_id != target_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_relationships_source ON memory_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_target ON memory_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_type ON memory_relationships(relationship_type);

-- Memory operations log table
CREATE TABLE IF NOT EXISTS memory_operations_log (
    id SERIAL PRIMARY KEY,
    chat_id TEXT,
    operation_type TEXT NOT NULL,     -- 'add', 'update', 'delete', 'search', 'consolidate', 'prune'
    target_type TEXT NOT NULL,        -- 'block', 'archival'
    target_id UUID,
    details JSONB,                    -- Operation details, parameters, results
    success BOOLEAN NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_operations_chat_id ON memory_operations_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_memory_operations_timestamp ON memory_operations_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memory_operations_type ON memory_operations_log(operation_type);

-- Optional: Add trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memory_blocks_updated_at BEFORE UPDATE ON memory_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archival_memories_updated_at BEFORE UPDATE ON archival_memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO suzent;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO suzent;
