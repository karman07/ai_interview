import requests

# Test upload resume with text
def test_upload_resume_text():
    url = "http://localhost:8000/upload-resume"
    data = {
        "user_id": "test_user_123",
        "resume_text": "Software Engineer with 5 years of Python experience"
    }
    
    response = requests.post(url, data=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

# Test upload resume with file
def test_upload_resume_file():
    url = "http://localhost:8000/upload-resume"
    
    # Create a test file
    with open("test_resume.txt", "w") as f:
        f.write("John Doe\nSoftware Engineer\n5 years Python experience\nDjango, FastAPI, React")
    
    data = {"user_id": "test_user_456"}
    files = {"resume_file": open("test_resume.txt", "rb")}
    
    response = requests.post(url, data=data, files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    files["resume_file"].close()

if __name__ == "__main__":
    print("Testing text upload:")
    test_upload_resume_text()
    
    print("\nTesting file upload:")
    test_upload_resume_file()