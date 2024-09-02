
---

# VideoSharing App

## Overview

VideoSharing App is a full-featured video-sharing platform similar to YouTube. It allows users to upload, watch, and interact with videos, manage their channels, and engage with the community through subscriptions, tweets, playlists, likes, and comments. The project is built with a focus on scalability, performance, and ease of use.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

### User Management
- **Register User (Signup)**: Perform CRUD operations to manage user accounts.
- **Login (Sign-in)**: User authentication.
- **Logout**: Securely log out users.
- **Refresh Access Token**: Handle token refresh for authenticated sessions.
- **Change Password**: Allows users to change their password.
- **Forgot/Reset Password**: Password recovery via email using Nodemailer.
- **Get Current User**: Retrieve the logged-in user’s details.
- **Update User Account Details**: Update user profile information.
- **Update User Avatar & Cover Image**: Manage user profile images with Cloudinary integration.
- **Delete User**: Permanently remove a user account.
- **User Channel Profile**: Aggregate channel subscribers and subscriptions.
- **User Watch History**: Retrieve a user’s video watch history.

### Video Management
- **Upload Video**: Upload and manage video content.
- **Get Video by ID**: Retrieve video details by ID.
- **Update Video Details**: Edit video metadata like title and description.
- **Update Video Thumbnail**: Change video thumbnails.
- **Toggle Publish Status**: Switch video visibility between public and private.
- **Delete Video**: Remove videos from the platform.
- **Get All Videos**: Fetch and paginate videos with filtering and sorting.

### Subscription Management
- **Toggle Subscription**: Subscribe or unsubscribe from channels.
- **Get Channel Subscribers**: Retrieve a list of channel subscribers.
- **Get User Subscribed Channels**: List the channels a user is subscribed to.

### Tweet Management
- **Create Tweet**: Post a new tweet to the user’s community tab.
- **Update Tweet**: Edit an existing tweet.
- **Delete Tweet**: Remove tweets.
- **Get User Tweets**: Retrieve all tweets made by a user.

### Playlist Management
- **Create Playlist**: Create a new video playlist.
- **Add/Remove Video to/from Playlist**: Manage videos within playlists.
- **Get Playlist by ID**: Retrieve playlist details by ID.
- **Get User Playlists**: List all playlists created by a user.
- **Update Playlist**: Edit playlist details.
- **Delete Playlist**: Remove a playlist.

### Like Management
- **Toggle Like**: Like or unlike videos, comments, and tweets.
- **Get All User Liked Videos**: Retrieve all videos liked by a user.

### Dashboard
- **Get Channel Videos**: Retrieve all videos uploaded by a channel.
- **Get Channel Stats**: Get statistics for a channel’s performance.

### Comment Management
- **Add Comment**: Post a comment on a video or tweet.
- **Update Comment**: Edit existing comments.
- **Delete Comment**: Remove comments.
- **Get Video Comments**: Retrieve all comments on a video.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MuhammadAmmarAtique/videoSharingApp.git
   cd videoSharingApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your configuration details. Use `.env.sample` as a reference.

4. **Run the application:**
   ```bash
   npm run dev
   ```

## Usage

- **Running the Server:**
  Start the server locally using `npm run dev`. The server will run on the port specified in the `.env` file.

- **API Documentation:**
  Use tools like Postman or Swagger to explore the available endpoints.

## Project Structure

```plaintext
/videosharing-app
|-- /public
|-- /src
|   |-- /controllers
|   |-- /models
|   |-- /routes
|   |-- /utils
|   |-- /middlewares
|   |-- /db          # MongoDB connection
|   |-- app.js       # Express app setup
|   |-- index.js     # Server entry point
|   |-- constants.js
|-- .env.sample
|-- .gitignore
|-- .prettierignore
|-- package.json
|-- package-lock.json
|-- README.md
```

- **`public`**: Contains public assets.
- **`src`**: Contains the main application logic, including controllers, models, routes, and middlewares.
- **`db`**: MongoDB connection setup.
- **`app.js`**: Sets up the Express application.
- **`index.js`**: Entry point for starting the server.
- **`constants.js`**: Common constants used throughout the project.
- **`utils `**: Common used functions throughout the project.
- **`.env.sample`**: Example environment variables file.
- **`.gitignore`**: Specifies files to be ignored by Git.
- **`.prettierignore`**: Specifies files to be ignored by Prettier.
- **`README.md`**: Project documentation.

## Contributing

Contributions are welcome! 

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact [Muhammad Ammar Atique](mailto:muhammadammaratique@gmail.com).

---


