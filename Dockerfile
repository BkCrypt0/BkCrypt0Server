# Use a Node.js base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Install build essentials and dependencies
RUN apt-get update && apt-get install -y build-essential libgmp-dev libsodium-dev nasm

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rapidsnark folder to the container
COPY ./rapidsnark ./rapidsnark

# Build the program inside the rapidsnark folder
WORKDIR /app/rapidsnark
RUN npm install
RUN npx task createFieldSources
RUN npx task buildProver

# Go back to the root directory
WORKDIR /app

# Copy the rest of the project files to the container
COPY . .

# Expose a port if needed (replace 3000 with your desired port number)
EXPOSE 3000

# Specify the command to run when the container starts
CMD ["node", "index.js"]
