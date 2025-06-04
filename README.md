# CTRL - Visual No-Code/Low-Code App Builder

CTRL is a powerful cross-platform desktop application (macOS and Windows) for visually creating no-code/low-code applications using three synchronized modes: Design, Logic, and Code.

## Features

### 🎨 Design Mode (Figma-like UI Editor)
- **Draggable/Resizable Canvas** in the center for building UIs visually
- **Left Panel** for layers and component selection
- **Right Panel** for layout, properties, and styling
- **Component Library** including:
  - Text, Buttons, Input fields
  - Containers, Stacks (HStack, VStack, ZStack)
  - Images, Videos, SVGs
  - Grid layouts and more

### 🔌 Logic Mode (Visual Node-Based Logic)
- Seamless switch from Design mode
- **Visual Node Editor** to connect application logic
- Nodes for:
  - State management
  - Conditionals (if-else)
  - Loops
  - API calls
  - Database integration (Firebase, Supabase, MongoDB)
- Event handling for onClick, onHover, onLoad, etc.

### 💻 Code Mode (Live Code Sync)
- Real-time code generation synchronized with Design and Logic modes
- Support for multiple languages:
  - JavaScript/TypeScript
  - Swift
  - Kotlin
  - Flutter/Dart
- Export to various platforms (web, mobile, desktop)
- Custom code editing for advanced needs

### Additional Features
- **Preview Mode** to test your application
- **Multi-platform Export** (React, SwiftUI, Flutter, etc.)
- **Plugin System** for extending functionality
- **Dark/Light Themes**
- **Project Management** with cloud syncing
- **Offline Support**

## Getting Started

### Installation

#### From Releases
Download the latest release for your platform:
- macOS (.dmg)
- Windows (.exe)

#### From Source
```bash
# Clone the repository
git clone https://github.com/ctrl-app/ctrl.git
cd ctrl/ctrl-app

# Install dependencies
npm install

# Run in development mode
npm run electron-dev

# Build the desktop app
npm run electron-build
```

### Quick Start Guide
1. Launch CTRL
2. Create a new project or open an existing one
3. Use Design mode to create your UI
4. Switch to Logic mode to add application behavior
5. Preview your app with the Preview button
6. Export your project to your desired platform

## Development

### Requirements
- Node.js 18+
- npm or yarn

### Development Commands
- `npm run dev`: Run the Next.js app in development mode
- `npm run electron-dev`: Run the Electron app in development mode
- `npm run electron-build`: Build the Electron app for production

## Architecture

CTRL is built on a modern stack with:
- **Next.js** for the core application
- **Electron** for desktop deployment
- **React** for UI components
- **Zustand** for state management
- **TailwindCSS** for styling
- **ReactFlow** for node-based logic editor
- **Monaco Editor** for code editing

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
