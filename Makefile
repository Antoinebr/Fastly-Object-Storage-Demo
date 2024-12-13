# Name of the Docker image
IMAGE_NAME=fastly-object-storage-demo-app
# Name of the Docker container
CONTAINER_NAME=fastly-object-storage-demo-container
# Port to expose
PORT=3009

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the Docker container
run:
	docker run -p $(PORT):$(PORT) --name $(CONTAINER_NAME) -d $(IMAGE_NAME)

# Stop and remove the container
stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

# Remove the Docker image
clean:
	docker rmi $(IMAGE_NAME)

# Show logs from the running container
logs:
	docker logs -f $(CONTAINER_NAME)

# Execute a command inside the running container
exec:
	docker exec -it $(CONTAINER_NAME) /bin/bash

# Rebuild the Docker image and restart the container
rebuild: stop clean build run