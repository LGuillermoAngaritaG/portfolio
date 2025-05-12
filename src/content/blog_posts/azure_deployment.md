---
title: Deploying FastAPI to Azure with Docker and a Makefile
date: 2024/10/27
tags: Deployment, FastAPI, Docker, Makefile, Azure
---

# Effortless API Deployments: FastAPI, Docker, and Make on Azure

## Intro

Modern application development often involves creating APIs that serve as the backbone for web and mobile applications. FastAPI has emerged as a popular Python framework for building high-performance APIs quickly. Docker simplifies packaging these applications into portable containers, ensuring consistency across different environments.

To automate the deployment of these containerized applications, Makefiles are an excellent tool. They allow you to define a set of tasks (like building an image, creating cloud resources, or deploying your app) that can be executed with simple commands. This not only saves time but also reduces the chances of manual errors during deployment.

In this tutorial, we will:
* Create a basic FastAPI application.
* Write a Dockerfile to containerize this application using Python 3.11.
* Utilize a provided Makefile to automate the deployment to Azure App Service.

## Requirements

Before we dive in, ensure you have the following set up:

* **Azure Account:** You'll need an active Azure subscription. If you don't have one, you can create a [free account](https://azure.microsoft.com/free/).
* **Azure CLI:** The Azure Command-Line Interface (CLI) must be installed and configured on your local machine. You can find installation instructions [here](https://docs.microsoft.com/cli/azure/install-azure-cli). After installation, log in using `az login`.
* **Docker:** Docker Desktop (for Windows or macOS) or Docker Engine (for Linux) needs to be installed. You can download it from the [Docker website](https://www.docker.com/products/docker-desktop).
* **Python 3.11:** While our Docker container will use Python 3.11, it's good practice to have a compatible version for local development if needed.
* **A Project Directory:** Create a new folder for your project. Inside this folder, we'll place our FastAPI application code, the Dockerfile, and the Makefile.

## Deployment

Let's get our hands dirty and deploy our FastAPI application!

### Step 1: Create your FastAPI Application

First, let's create a very simple FastAPI application.

1.  In your project directory, create a file named `main.py`:

    ```python
    # main.py
    from fastapi import FastAPI

    app = FastAPI()

    @app.get("/")
    async def root():
        return {"message": "Hello from FastAPI deployed on Azure App Service!"}

    @app.get("/items/{item_id}")
    async def read_item(item_id: int, q: str | None = None):
        return {"item_id": item_id, "q": q}
    ```

2.  Create a `requirements.txt` file in the same directory for our Python dependencies:

    ```text
    # requirements.txt
    fastapi
    uvicorn[standard]
    ```

### Step 2: Create the Dockerfile

Next, create a `Dockerfile` (no extension) in your project root. This file will define how to build the Docker image for our FastAPI application using Python 3.11.

```dockerfile
# Dockerfile
# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV PORT 80

# Run uvicorn when the container launches
# Use 0.0.0.0 to allow external connections to the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
```

**Explanation of the Dockerfile:**
* `FROM python:3.11-slim`: Starts from a lightweight Python 3.11 image.
* `WORKDIR /app`: Sets the working directory inside the container to `/app`.
* `COPY ./requirements.txt /app/requirements.txt`: Copies the requirements file.
* `RUN pip install --no-cache-dir -r requirements.txt`: Installs the Python dependencies.
* `COPY . /app`: Copies the rest of your application code (like `main.py`) into the `/app` directory in the image.
* `EXPOSE 80`: Informs Docker that the container listens on port 80 at runtime. Azure App Service for Containers will typically expect web apps to be listening on port 80 or 8080.
* `ENV PORT 80`: Sets an environment variable (often used by hosting platforms like App Service to determine the listening port).
* `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]`: Specifies the command to run when the container starts. It starts the Uvicorn server, making the FastAPI app accessible on port 80 from any IP address within the container's network.

### Step 3: The Makefile

Now, for the automation part. Create a file named `Makefile` (no extension) in your project root and paste the following content:

```makefile
# Azure resource variables
resourcegroup=MyFastAPIAppRG
containerregistry=myfastapicontainerregistry123
image=myfastapiimage
appserviceplan=MyFastAPIAppServicePlan
webapp=myfastapiwebapp123
location=eastus

.PHONY: login group registry build plan webapp upload redeploy create_webapp_on_existing_plan all cors

login:
	@echo "login to azure"
	az login
	@echo "---------"

group:
	@echo "create resource group"
	az group create -l $(location) -n $(resourcegroup)
	@echo "---------"

registry:
	@echo "Create a container registry"
	az acr create --name $(containerregistry) --resource-group $(resourcegroup) --sku basic --admin-enabled true
	@echo "---------"

build:
	@echo "Build the docker image and store it in the container registry"
	az acr build --registry $(containerregistry) --resource-group $(resourcegroup) --image $(image) .
	@echo "---------"

plan:
	@echo "Create a web app service plan"
	az appservice plan create -g $(resourcegroup) -n $(appserviceplan) -l $(location) --is-linux --sku B1
	@echo "---------"

webapp:
	@echo "Upload image to web app"
	az webapp create -g $(resourcegroup) -p $(appserviceplan) -n $(webapp) -i $(containerregistry).azurecr.io/$(image):latest
	@echo "---------"

upload: build webapp

redeploy:
	@echo "reupload image to web app and restart it - modifications"
	az acr build --registry $(containerregistry) --resource-group $(resourcegroup) --image $(image) . ; \
	az webapp restart --name $(webapp) --resource-group $(resourcegroup)
	@echo "---------"

create_webapp_on_existing_plan:
	@echo "Crear web app en un plan de servicio ya creado"
	az acr build --registry $(containerregistry) --resource-group $(resourcegroup) --image $(image) . ; \
	az appservice plan create -g $(resourcegroup) -n $(appserviceplan) -l $(location) --is-linux --sku B1 ; \
	az webapp create -g $(resourcegroup) -p $(appserviceplan) -n $(webapp) -i $(containerregistry).azurecr.io/$(image):latest
	@echo "---------"

all:
	@echo "Create all the services and deploy them from zero"
	az group create -l $(location) -n $(resourcegroup) ; \
	az acr create --name $(containerregistry) --resource-group $(resourcegroup) --sku basic --admin-enabled true ; \
	az acr build --registry $(containerregistry) --resource-group $(resourcegroup) --image $(image) . ; \
	az appservice plan create -g $(resourcegroup) -n $(appserviceplan) -l $(location) --is-linux --sku B1 ; \
	az webapp create -g $(resourcegroup) -p $(appserviceplan) -n $(webapp) -i $(containerregistry).azurecr.io/$(image):latest
	@echo "---------"

cors:
	@echo "Enable CORS"
	az webapp cors add --resource-group $(resourcegroup) --name $(webapp) --allowed-origins '*'
	@echo "---------"
```

**Understanding the Makefile:**

At the top of the Makefile, we define several variables. **You should update these to be unique for your deployment and to avoid naming conflicts.**

* `resourcegroup`: The name of the Azure Resource Group where all resources will be created.
* `containerregistry`: The name for your Azure Container Registry (ACR). This name needs to be globally unique.
* `image`: The name of the Docker image in your ACR.
* `appserviceplan`: The name of the Azure App Service Plan.
* `webapp`: The name of your Azure Web App. This also needs to be globally unique and will form part of your app's URL (e.g., `yourwebappname.azurewebsites.net`).
* `location`: The Azure region where your resources will be deployed (e.g., `eastus`, `westeurope`).

The rest of the Makefile defines **targets**. You can execute these using the `make <target_name>` command (e.g., `make build`).

* `.PHONY`: This declares targets that are not actual files. It prevents `make` from being confused if a file with the same name as a target exists.
* `login`:
    * `az login`: Opens your browser to log you into your Azure account.
* `group`:
    * `az group create -l $(location) -n $(resourcegroup)`: Creates a new resource group in the specified location.
* `registry`:
    * `az acr create --name $(containerregistry) --resource-group $(resourcegroup) --sku basic --admin-enabled true`: Creates an Azure Container Registry. The `basic` SKU is cost-effective for development/testing. `--admin-enabled true` allows for simple username/password authentication to the registry if needed, though service principals are recommended for CI/CD.
* `build`:
    * `az acr build --registry $(containerregistry) --resource-group $(resourcegroup) --image $(image) .`: This powerful command tells ACR to pull your code (the `.` signifies the current directory), build the Docker image based on your `Dockerfile`, and then store it in ACR with the tag `latest`. This means you don't even need Docker running locally to build the image in ACR if you use this command.
* `plan`:
    * `az appservice plan create -g $(resourcegroup) -n $(appserviceplan) -l $(location) --is-linux --sku B1`: Creates an App Service Plan. This defines the underlying VMs that will host your web app. `--is-linux` specifies a Linux plan (for Docker containers), and `B1` is the Basic pricing tier.
* `webapp`:
    * `az webapp create -g $(resourcegroup) -p $(appserviceplan) -n $(webapp) -i $(containerregistry).azurecr.io/$(image):latest`: Creates the Azure Web App service and configures it to pull and run your Docker image from the specified ACR path. The image path is `yourcontainerregistry.azurecr.io/yourimagename:latest`.
* `upload`:
    * This target is a shortcut that depends on `build` and `webapp`. It first runs `make build` and then `make webapp`.
* `redeploy`:
    * This is useful for when you've made changes to your application code.
    * `az acr build ...`: Rebuilds your Docker image in ACR with your latest code.
    * `az webapp restart ...`: Restarts your Web App. App Service will then pull the new `latest` image from ACR.
* `create_webapp_on_existing_plan`:
    * The name suggests it uses an existing plan, but the commands included will attempt to create an App Service Plan. If the plan already exists with the same name and configuration in the same resource group, this step might succeed or show a message that the resource already exists. It then proceeds to build the image and create the web app. *To truly use an existing plan, you would remove the `az appservice plan create` line and ensure `$(appserviceplan)` points to an existing plan's name.*
    * For this tutorial, we'll assume it functions as written, which includes a plan creation attempt.
* `all`:
    * This is the master target to set everything up from scratch. It executes the commands for creating the resource group, container registry, building the image, creating the app service plan, and finally creating and deploying the web app. Commands are separated by `; \` to run sequentially.
* `cors`:
    * `az webapp cors add --resource-group $(resourcegroup) --name $(webapp) --allowed-origins '*'`: Configures Cross-Origin Resource Sharing (CORS) for your web app, allowing requests from any origin (`'*'`). **For production, you should restrict this to specific domains.**

### Step 4: Customize Makefile Variables

**Important:** Before running any `make` commands, open the `Makefile` and change the values of `resourcegroup`, `containerregistry`, `image`, `appserviceplan`, and `webapp` to something unique. ACR names and Web App names need to be globally unique across Azure.

For example:
```makefile
resourcegroup=MyFastAPIAppRG
containerregistry=myfastapicontainerregistry123
image=myfastapiimage
appserviceplan=MyFastAPIAppServicePlan
webapp=myfastapiwebapp123
location=eastus
```
Choose a `location` that is suitable for you.

### Step 5: Deploy!

Now, open your terminal in the project directory where your `main.py`, `Dockerfile`, and `Makefile` are located.

1.  **Login to Azure (if you haven't already):**
    ```bash
    make login
    ```
    This will open a browser window for you to authenticate.

2.  **Full Deployment from Scratch:**
    To create all Azure resources and deploy your application, run:
    ```bash
    make all
    ```
    This command will:
    * Create the Azure Resource Group.
    * Create the Azure Container Registry.
    * Build your Docker image using the `Dockerfile` in the current directory and push it to your ACR.
    * Create the Azure App Service Plan (Linux, Basic tier).
    * Create the Azure Web App, configured to use the image from your ACR.

    This process might take a few minutes as Azure provisions the resources. You'll see output from the Azure CLI for each step.

### Step 6: Verify Your Deployment

Once the `make all` command completes successfully, Azure will provide you with the default URL for your web app (usually in the output of the `az webapp create` step, looking something like `http://<webapp-name>.azurewebsites.net`).

Open this URL in your web browser. You should see:
`{"message":"Hello from FastAPI deployed on Azure App Service!"}`

You can also test the other endpoint: `http://<webapp-name>.azurewebsites.net/items/10?q=test`
Which should return: `{"item_id":10,"q":"test"}`

### Step 7: Redeploying Changes

If you make changes to your `main.py` or other application files:

1.  Save your changes.
2.  Run the redeploy command:
    ```bash
    make redeploy
    ```
    This will rebuild the image in ACR with your new code and then restart your Azure Web App, which will pull the updated image. Wait a minute or two for the new image to be pulled and the app to restart, then refresh your browser.

### Step 8: (Optional) Enable CORS

If your API needs to be accessed from web applications hosted on different domains, you'll need to enable CORS:
```bash
make cors
```
This allows all origins (`*`). For production, specify your frontend's domain instead of `*`.

### Step 9: Cleaning Up

Once you're done experimenting, it's a good idea to remove the Azure resources to avoid ongoing charges. The easiest way to do this is to delete the entire resource group:

```bash
az group delete --name <your-resourcegroup-name> --yes --no-wait
```
Replace `<your-resourcegroup-name>` with the actual name you used in your Makefile (e.g., `MyFastAPIAppRG`). The `--yes` flag confirms deletion, and `--no-wait` returns the command prompt immediately while deletion happens in the background.

---

Congratulations! You've successfully deployed a FastAPI application to Azure App Service using Docker and automated the entire workflow with a Makefile. This approach provides a robust and repeatable process for your API deployments, allowing you to focus more on development and less on manual deployment steps. You can adapt and extend the Makefile for more complex scenarios, different environments (staging, production), or additional Azure services.