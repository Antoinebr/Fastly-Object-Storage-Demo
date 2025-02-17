# Name of the Docker image
IMAGE_NAME=fastly-object-storage-easy-ui
# Name of the Docker container
CONTAINER_NAME=fastly-object-storage-easy-ui-container
# Port to expose
PORT=3099
INTERNALPORT=3009

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the Docker container
run:
	docker run -p $(PORT):$(INTERNALPORT) --name $(CONTAINER_NAME) -v ./.env:/usr/src/app/.env -d $(IMAGE_NAME)

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

# Stop and remove the Docker container
.PHONY: clean
clean: stop rm

# Remove the Docker image
.PHONY: rmi
rmi:
	docker rmi $(IMAGE_NAME)

# View logs from the Docker container
.PHONY: logs
logs:
	docker logs -f $(CONTAINER_NAME)

# Shell into the running Docker container
.PHONY: shell
shell:
	docker exec -it $(CONTAINER_NAME) /bin/bash

# List all Docker images
.PHONY: images
images:
	docker images

# List all Docker containers
.PHONY: ps
ps:
	docker ps -a