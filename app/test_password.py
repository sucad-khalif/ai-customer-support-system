from app.security import hash_password, verify_password

password = "Staff123"

hashed_password = hash_password(password)

print("Original password:", password)
print("Hashed password:", hashed_password)

print("Correct password:", verify_password("Staff123", hashed_password))
print("Wrong password:", verify_password("Wrong123", hashed_password))