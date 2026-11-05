import sqlite3
from backend.app.db import engine, Base
from backend.app.models import (
    SourceLayer, HarvestRun, StateAttribution, HeritageEntity, EntityLink
)

def run_v2_migration():
    print("Creating new v2 tables...")
    Base.metadata.create_all(bind=engine)

    # Check for columns on records table
    with engine.connect() as conn:
        cursor = conn.connection.cursor()
        cursor.execute("PRAGMA table_info(records)")
        existing_cols = [c[1] for c in cursor.fetchall()]

        if "record_kind" not in existing_cols:
            print("Adding record_kind column to records...")
            cursor.execute("ALTER TABLE records ADD COLUMN record_kind VARCHAR DEFAULT 'museum_object'")
        
        if "layer_id" not in existing_cols:
            print("Adding layer_id column to records...")
            cursor.execute("ALTER TABLE records ADD COLUMN layer_id VARCHAR")
        
        conn.connection.commit()
    print("Migration to v2 schema complete.")

if __name__ == "__main__":
    run_v2_migration()

