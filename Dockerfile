FROM node:16.15.0

# Set build variables
ARG username=user
ARG userhome=/home/${username}

# Set user
RUN useradd -ms /bin/bash $username

# Copy package.json
WORKDIR /app
COPY package.json .

# Install dependencies
RUN npm install

# Copy src code and env file
COPY . .

# Change user
RUN chown -R ${username}:${username} /app
USER ${username}