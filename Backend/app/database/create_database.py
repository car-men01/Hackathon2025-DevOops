import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import settings
from urllib.parse import urlparse

print("=" * 60)
print("🔧 Database Setup for Railway")
print("=" * 60)

# Parse the DATABASE_URL
# Format: postgresql://user:password@host:port/database
parsed_url = urlparse(settings.DATABASE_URL)

print(f"\n📋 Connection Details:")
print(f"   Host: {parsed_url.hostname}")
print(f"   Port: {parsed_url.port}")
print(f"   User: {parsed_url.username}")
print(f"   Database: {parsed_url.path[1:]}")  # Remove leading /

# For Railway, the database is already created
# This script just verifies the connection
try:
    print("\n🔌 Testing connection to Railway PostgreSQL...")

    # Connect using the full DATABASE_URL
    conn = psycopg2.connect(settings.DATABASE_URL)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cursor = conn.cursor()

    # Test the connection
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"✅ Connected successfully!")
    print(f"   PostgreSQL version: {version[0][:50]}...")

    # Check current database
    cursor.execute("SELECT current_database();")
    current_db = cursor.fetchone()[0]
    print(f"✅ Current database: {current_db}")

    # List tables (if any)
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()

    if tables:
        print(f"\n📊 Existing tables:")
        for table in tables:
            print(f"   - {table[0]}")
    else:
        print(f"\n📊 No tables yet (will be created when app starts)")

    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("✅ Railway database is ready!")
    print("=" * 60)
    print("\n💡 Next step: Start your app with:")
    print("   uvicorn app.main:app --reload")

except psycopg2.OperationalError as e:
    print(f"\n❌ Connection failed: {e}")
    print("\n🔍 Troubleshooting:")
    print("   1. ⚠️  Railway requires TCP PROXY for external connections!")
    print("      In Railway dashboard → Networking → TCP Proxy")
    print("      Use format: caboose.proxy.rlwy.net:PORT (not direct hostname)")
    print("\n   2. Check DATABASE_URL in .env file")
    print("      Should be: postgresql://user:pass@caboose.proxy.rlwy.net:23203/railway")
    print("\n   3. Verify Railway database is active")
    print("\n   4. Check network/firewall connection")
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\n💡 Note: Railway databases are pre-created.")
    print("   You don't need to manually create them.")
