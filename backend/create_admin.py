import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "") # Needs Service Role Key

supabase: Client = create_client(url, key)

def create_default_admin():
    email = "Ayanhabib.28s@gmail.com"
    password = "Ayaan@2002"
    
    print(f"Creating admin user: {email}")
    
    try:
        # Create user in auth.users
        response = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        
        user_id = response.user.id
        print(f"User created in auth with ID: {user_id}")
        
        # Insert into public.users with role 'admin'
        # Check if already exists first
        exists = supabase.table("users").select("*").eq("id", user_id).execute()
        if not exists.data:
            supabase.table("users").insert({
                "id": user_id,
                "email": email,
                "role": "admin"
            }).execute()
            print("Successfully assigned 'admin' role in public.users")
        else:
            print("User already exists in public.users, updating role...")
            supabase.table("users").update({"role": "admin"}).eq("id", user_id).execute()
            
    except Exception as e:
        print(f"Error creating admin: {e}")

if __name__ == "__main__":
    create_default_admin()
