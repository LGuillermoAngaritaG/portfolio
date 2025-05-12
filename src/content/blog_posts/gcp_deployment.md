---
title: Deploying FastAPI to Google Cloud Run with Docker and a Makefile
date: 2024/10/27
tags: Deployment, FastAPI, Docker, Makefile, GCP
description: Here I show how to deploy a FastAPI application to Google Cloud Run with Docker and a Makefile. This allows me to deploy the application to the cloud easily with few commands.
---

# Streamlining Your API Deployments: FastAPI, Docker, and a Makefile for Google Cloud Run

## Introduction

Deploying web applications, especially APIs, can often feel like a complex maze of configurations and repetitive commands. If you're building with FastAPI and looking for a robust and reproducible way to get your creations onto the cloud, you've come to the right place. This post will guide you through deploying a simple FastAPI application to Google Cloud Run using Docker, all orchestrated with the power and simplicity of a Makefile.

Why this stack? FastAPI is a modern, fast (high-performance) web framework for building APIs with Python, known for its ease of use and automatic data validation. Docker allows us to package our application and its dependencies into a portable container, ensuring consistency across different environments. Google Cloud Run offers a fully managed serverless platform to run these containers, scaling automatically with demand. And finally, a Makefile helps us automate the entire build and deployment process with simple commands.

By the end of this tutorial, you'll have a clear understanding of how to package your FastAPI application, push it to Google Cloud's Artifact Registry, and deploy it as a scalable service on Cloud Run, all with a few `make` commands.

## Requirements

Before we dive into the deployment process, let's ensure you have all the necessary tools and accounts set up:

* **Python and FastAPI:** You'll need Python installed on your local machine to develop your FastAPI application. We'll create a very simple one for this tutorial. If you're new to FastAPI, you can install it via pip: `pip install fastapi uvicorn`. Uvicorn is an ASGI server that will run our FastAPI application within the Docker container.
* **Docker:** Docker is essential for containerizing our application. Make sure you have Docker Desktop installed and running on your system. You can download it from the [official Docker website](https://www.docker.com/products/docker-desktop/).
* **Google Cloud Platform (GCP) Account:** You'll need an active GCP account with billing enabled. If you don't have one, you can sign up for a free trial.
* **Google Cloud SDK (gcloud CLI):** The `gcloud` command-line tool is used to interact with your GCP services. Follow the instructions on the [Google Cloud SDK documentation](https://cloud.google.com/sdk/docs/install) to install and initialize it. After installation, log in to your account using `gcloud auth login`.
* **A Project in GCP:** Create a new project in the Google Cloud Console or choose an existing one. Note down the **Project ID** as it will be used in our Makefile.
* **A Text Editor or IDE:** Any text editor or Integrated Development Environment (IDE) like VS Code, PyCharm, or Sublime Text will work for creating your FastAPI app, Dockerfile, and Makefile.

## Deployment: Bringing it all Together with a Makefile

Now for the exciting part! We'll set up a simple FastAPI application, create a Dockerfile to containerize it, and then use our Makefile to automate the deployment to Google Cloud Run.

### Step 1: Create a Simple FastAPI Application

Let's start by creating a basic FastAPI application. Create a new directory for your project, and inside it, create a file named `main.py`:

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI on Cloud Run!"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
```

This simple application has two endpoints: a root endpoint (`/`) that returns a welcome message, and an endpoint (`/items/{item_id}`) that takes an item ID and an optional query parameter.

### Step 2: Create the Dockerfile

Next, create a `Dockerfile` in the root of your project directory. This file contains the instructions to build your Docker image:

```dockerfile
# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
# For this simple app, we'll install FastAPI and Uvicorn directly
RUN pip install fastapi uvicorn

# Make port 80 available to the world outside this container
# Cloud Run expects the container to listen on the port defined by the PORT environment variable.
# Uvicorn by default listens on port 8000. We'll configure Cloud Run to use this.
EXPOSE 8000

# Run main.py when the container launches
# The 0.0.0.0 host is important to accept connections from outside the container.
# The PORT environment variable is automatically set by Cloud Run.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key points about this Dockerfile:**

* We start with a slim Python 3.9 base image.
* We set the working directory to `/app`.
* We copy our project files into the image.
* We install `fastapi` and `uvicorn`. In a more complex project, you'd typically have a `requirements.txt` file and copy that over to install dependencies.
* We `EXPOSE 8000` because Uvicorn will run on this port by default. Cloud Run will automatically map its external port (usually 80/443) to this internal container port.
* The `CMD` instruction specifies the command to run when the container starts. `main:app` refers to the `app` instance in your `main.py` file.

### Step 3: Create the Makefile

Now, create a file named `Makefile` in the root of your project directory. Copy and paste the following content, **making sure to replace `your-gcp-project-id` with your actual Google Cloud Project ID and `your-email@example.com` with the email associated with your GCP account.**

```makefile
# Makefile

# !!! IMPORTANT: Replace with your actual Project ID and Email !!!
PROJECT_ID = your-gcp-project-id
EMAIL = your-email@example.com
REGION = us-central1 # You can change this to your preferred region
ARTIFACT_REPO_NAME = portfolio # Name for your Artifact Registry repository
SERVICE_NAME = portfolio # Name for your Cloud Run service
IMAGE_NAME = $(SERVICE_NAME) # Keep image name same as service name for simplicity

# Target to deploy the backend application
deploy_back:
	@echo "--- Authenticating Docker to Google Cloud Artifact Registry ---"
	gcloud auth configure-docker $(REGION)-docker.pkg.dev

	@echo "\n--- Enabling necessary Google Cloud services ---"
	gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project=$(PROJECT_ID)

	@echo "\n--- Setting active Google Cloud project ---"
	gcloud config set project $(PROJECT_ID)

	@echo "\n--- Verifying IAM permissions (informational) ---"
	gcloud projects get-iam-policy $(PROJECT_ID) --format="table(bindings.role,bindings.members)" | grep $(EMAIL) || echo "IAM role not explicitly listed for user, or user has broader permissions (e.g., Owner)."

	@echo "\n--- Granting Artifact Registry Writer role (if needed, will succeed if already present) ---"
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
		--member="user:$(EMAIL)" \
		--role="roles/artifactregistry.writer" \
		--condition=None # Explicitly set no condition

	@echo "\n--- Creating Artifact Registry repository '$(ARTIFACT_REPO_NAME)' if it doesn't exist ---"
	gcloud artifacts repositories describe $(ARTIFACT_REPO_NAME) --location=$(REGION) --project=$(PROJECT_ID) > /dev/null 2>&1 || \
		gcloud artifacts repositories create $(ARTIFACT_REPO_NAME) \
			--repository-format=docker \
			--location=$(REGION) \
			--description="Docker repository for $(SERVICE_NAME)" \
			--project=$(PROJECT_ID)

	@echo "\n--- Building the Docker image ---"
	docker build -t $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest .

	@echo "\n--- Pushing the Docker image to Artifact Registry ---"
	docker push $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest

	@echo "\n--- Deploying the Docker image to Cloud Run ---"
	gcloud run deploy $(SERVICE_NAME) \
		--image $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--port=8000 \
		--project=$(PROJECT_ID)

	@echo "\n--- Getting the URL of the deployed service ---"
	@URL=$$(gcloud run services describe $(SERVICE_NAME) --region $(REGION) --project=$(PROJECT_ID) --format='value(status.url)'); \
	echo "Service URL: $$URL"; \
	echo "Try accessing: $$URL or $$URL/items/1?q=test"

.PHONY: deploy_back
```

**Understanding the Makefile:**

Let's break down what each part of the `deploy_back` target in our Makefile does:

1.  **Variable Definitions:**
    * `PROJECT_ID`: **Crucial!** Replace this with your actual Google Cloud Project ID.
    * `EMAIL`: **Crucial!** Replace this with the email address associated with your GCP account, which you used to log in with `gcloud auth login`.
    * `REGION`: The GCP region where your Artifact Registry and Cloud Run service will be located (e.g., `us-central1`, `europe-west1`).
    * `ARTIFACT_REPO_NAME`: The name for the Docker image repository in Artifact Registry.
    * `SERVICE_NAME`: The name your service will have in Cloud Run.
    * `IMAGE_NAME`: The name of the Docker image.

2.  **`gcloud auth configure-docker $(REGION)-docker.pkg.dev`**:
    * This command configures Docker to use your `gcloud` credentials to authenticate with Google Cloud Artifact Registry in the specified region. This allows Docker to push images to your private repository.

3.  **`gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project=$(PROJECT_ID)`**:
    * This ensures that the necessary APIs (Cloud Run API and Artifact Registry API) are enabled for your project. If they are already enabled, this command does nothing.

4.  **`gcloud config set project $(PROJECT_ID)`**:
    * This sets the current active Google Cloud project for subsequent `gcloud` commands. It's a good practice to include this to avoid ambiguity, especially if you work with multiple projects.

5.  **`gcloud projects get-iam-policy $(PROJECT_ID) ...`**:
    * This command is mostly for informational purposes, attempting to display your current IAM roles on the project. It helps in debugging permission issues.

6.  **`gcloud projects add-iam-policy-binding $(PROJECT_ID) --member="user:$(EMAIL)" --role="roles/artifactregistry.writer"`**:
    * This command grants your user the `Artifact Registry Writer` (`roles/artifactregistry.writer`) role for the specified project. This permission is necessary to push Docker images to Artifact Registry. If you already have this role (or a broader role like `Owner` or `Editor`), this command will succeed without making any changes.

7.  **`gcloud artifacts repositories describe $(ARTIFACT_REPO_NAME) ... || gcloud artifacts repositories create $(ARTIFACT_REPO_NAME) ...`**:
    * This is a clever bit of shell scripting.
        * `gcloud artifacts repositories describe $(ARTIFACT_REPO_NAME) ... > /dev/null 2>&1`: It first tries to describe (get details of) an Artifact Registry repository with the name specified in `ARTIFACT_REPO_NAME` in your project and region. The output and errors are redirected to `/dev/null` (on Linux/macOS) or `nul` (on Windows, though the original Makefile used `nul` which might not be universally compatible with all `make` versions/shells; `/dev/null 2>&1` is more portable for Unix-like environments where `make` is common).
        * `||`: This is the logical OR operator. If the `describe` command fails (meaning the repository doesn't exist), the command after `||` is executed.
        * `gcloud artifacts repositories create $(ARTIFACT_REPO_NAME) ...`: This command creates a new Docker repository in Artifact Registry with the specified name, format, location, and description.

8.  **`docker build -t $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest .`**:
    * This is the standard Docker command to build your image.
        * `-t`: Tags the image with a name. The naming convention `$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest` is the required format for images that will be pushed to Google Artifact Registry.
        * `.`: Specifies that the Docker build context (the files available to the `Dockerfile`) is the current directory.

9.  **`docker push $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest`**:
    * This command pushes the locally built Docker image to your Artifact Registry repository.

10. **`gcloud run deploy $(SERVICE_NAME) ...`**:
    * This is the core command for deploying your application to Cloud Run.
        * `$(SERVICE_NAME)`: The name you want to give your Cloud Run service.
        * `--image $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ARTIFACT_REPO_NAME)/$(IMAGE_NAME):latest`: Specifies the image to deploy from Artifact Registry.
        * `--platform managed`: Specifies that you're using the fully managed version of Cloud Run (as opposed to Cloud Run for Anthos).
        * `--region $(REGION)`: Specifies the region where the service will be deployed.
        * `--allow-unauthenticated`: This flag makes your service publicly accessible. For private services, you would omit this and configure IAM.
        * `--port=8000`: This tells Cloud Run that your application inside the container is listening on port 8000. Cloud Run will then route external traffic (on port 80/443) to this internal port.
        * `--project=$(PROJECT_ID)`: Specifies the GCP project.

11. **`gcloud run services describe $(SERVICE_NAME) ... --format='value(status.url)'`**:
    * After successful deployment, this command retrieves and prints the URL of your newly deployed Cloud Run service. The `@` symbol before `URL=` and the `$$` are used to handle variable assignment and expansion correctly within the Makefile recipe.

12. **`.PHONY: deploy_back`**:
    * This declares `deploy_back` as a "phony" target. This means that `make` will always run the commands for this target, even if a file named `deploy_back` exists in the directory. It's good practice for targets that represent actions rather than file dependencies.

### Step 4: Run the Makefile

Now that you have your `main.py`, `Dockerfile`, and `Makefile` set up, and you've updated the `PROJECT_ID` and `EMAIL` in the Makefile:

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of your project.
3.  Execute the Makefile target by running:

    ```bash
    make deploy_back
    ```

This single command will now:

* Authenticate Docker with Google Cloud.
* Enable the necessary GCP services if they aren't already.
* Set your active GCP project.
* Grant (or confirm) the necessary permissions for Artifact Registry.
* Create the Artifact Registry repository if it doesn't exist.
* Build your Docker image locally.
* Push the Docker image to your private Artifact Registry.
* Deploy the image to Google Cloud Run, making it publicly accessible.
* Print the URL of your deployed service.

Once the command finishes, you'll see the URL of your deployed FastAPI application. Open it in your browser, and you should see your "Hello from FastAPI on Cloud Run!" message. You can also test the other endpoint, for example: `YOUR_CLOUD_RUN_URL/items/42?q=test_query`.

**Congratulations!** You've successfully deployed a FastAPI application to Google Cloud Run using Docker and automated the process with a Makefile. This setup provides a solid foundation for more complex API deployments, allowing for consistent builds and streamlined updates. You can now focus more on developing your application and less on the manual steps of deployment.