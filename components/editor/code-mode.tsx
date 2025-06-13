"use client";

import { useState, useEffect } from "react";
import { useEditorStore, CodeFile, DesignElement } from "@/lib/store/editor-store";
import { ElementStyle } from "@/lib/types/editor-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, File, Folder, Code2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper function to get language from file extension
const getLanguageFromExtension = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  
  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "jsx":
      return "javascript";
    case "tsx":
      return "typescript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "py":
      return "python";
    case "java":
      return "java";
    case "kt":
      return "kotlin";
    case "swift":
      return "swift";
    case "md":
      return "markdown";
    case "scss":
    case "sass":
      return "scss";
    case "less":
      return "less";
    case "xml":
      return "xml";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
};

// Function to generate code based on design elements
const generateComponentCode = (element: DesignElement, language: string): string => {
  // Ensure we have size and style objects with defaults
  const size = element.size || { width: 100, height: 100 };
  const style = (element.style || {}) as Partial<ElementStyle>;
  const position = element.position || { x: 0, y: 0 };

  // Define default style properties
  const flexDirection = style.flexDirection || "column";
  const justifyContent = style.justifyContent || "flex-start";
  const alignItems = style.alignItems || "flex-start";
  const gap = style.gap || 8;

  if (language === "typescript" || language === "javascript") {
    // React component
    if (element.type === "container") {
      return `import React from 'react';

export const ${element.name.replace(/\s+/g, '')} = () => {
  return (
    <div 
      style={{ 
        width: ${size.width}px,
        height: ${size.height}px,
        position: 'relative',
        backgroundColor: '${style.backgroundColor || "transparent"}',
        padding: ${style.padding || 0}px,
        margin: ${style.margin || 0}px,
        borderRadius: ${style.borderRadius || 0}px,
        display: 'flex',
        flexDirection: '${flexDirection}',
        justifyContent: '${justifyContent}',
        alignItems: '${alignItems}',
        ${style.boxShadow ? `boxShadow: '${style.boxShadow}',` : ''}
      }}
    >
      {/* Add child components here */}
    </div>
  );
};
`;
    } else if (element.type === "button") {
      return `import React from 'react';

export const ${element.name.replace(/\s+/g, '')} = () => {
  const handleClick = () => {
    console.log('Button clicked');
    // Add your click handler logic here
  };

  return (
    <button 
      onClick={handleClick}
      style={{ 
        width: ${size.width}px,
        height: ${size.height}px,
        backgroundColor: '${style.backgroundColor || "#3b82f6"}',
        color: '${style.color || "#ffffff"}',
        borderRadius: ${style.borderRadius || 4}px,
        padding: ${style.padding || 8}px,
        margin: ${style.margin || 0}px,
        border: 'none',
        cursor: 'pointer',
        fontWeight: '${style.fontWeight || "normal"}',
        fontSize: ${style.fontSize || 16}px,
        textAlign: '${style.textAlign || "center"}',
        position: 'relative',
        left: ${position.x}px,
        top: ${position.y}px,
      }}
    >
      ${element.props.text || "Button"}
    </button>
  );
};
`;
    } else if (element.type === "text") {
      return `import React from 'react';

export const ${element.name.replace(/\s+/g, '')} = () => {
  return (
    <p
      style={{ 
        width: ${size.width}px,
        height: ${size.height}px,
        position: 'relative',
        left: ${position.x}px,
        top: ${position.y}px,
        color: '${style.color || "#000000"}',
        fontFamily: '${style.fontFamily || "inherit"}',
        fontSize: ${style.fontSize || 16}px,
        fontWeight: '${style.fontWeight || "normal"}',
        textAlign: '${style.textAlign || "left"}',
        margin: ${style.margin || 0}px,
        padding: ${style.padding || 0}px,
      }}
    >
      ${element.props.text || "Text content"}
    </p>
  );
};
`;
    } else if (element.type === "input") {
      return `import React, { useState } from 'react';

export const ${element.name.replace(/\s+/g, '')} = () => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <input
      type="${element.props.type || "text"}"
      placeholder="${element.props.placeholder || "Enter text..."}"
      value={value}
      onChange={handleChange}
      style={{ 
        width: ${size.width}px,
        height: ${size.height}px,
        position: 'relative',
        left: ${position.x}px,
        top: ${position.y}px,
        padding: ${style.padding || 8}px,
        margin: ${style.margin || 0}px,
        borderRadius: ${style.borderRadius || 4}px,
        borderWidth: ${style.borderWidth || 1}px,
        borderColor: '${style.borderColor || "#d1d5db"}',
        borderStyle: 'solid',
        fontSize: ${style.fontSize || 16}px,
      }}
    />
  );
};
`;
    } else if (element.type === "image") {
      return `import React from 'react';

export const ${element.name.replace(/\s+/g, '')} = () => {
  return (
    <img
      src="${element.props.src || "/placeholder.jpg"}"
      alt="${element.props.alt || "Image"}"
      style={{ 
        width: ${size.width}px,
        height: ${size.height}px,
        position: 'relative',
        left: ${position.x}px,
        top: ${position.y}px,
        objectFit: 'cover',
        borderRadius: ${style.borderRadius || 0}px,
      }}
    />
  );
};
`;
    } else if (element.type === "card") {
      return `import React from 'react';

export const ${element.name.replace(/\s+/g, '')} = () => {
  return (
    <div 
      style={{ 
        width: ${size.width}px,
        height: ${size.height}px,
        position: 'relative',
        left: ${position.x}px,
        top: ${position.y}px,
        backgroundColor: '${style.backgroundColor || "#ffffff"}',
        padding: ${style.padding || 16}px,
        margin: ${style.margin || 0}px,
        borderRadius: ${style.borderRadius || 8}px,
        boxShadow: '${style.boxShadow || "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"}',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '18px', 
        fontWeight: 'bold' 
      }}>
        ${element.props.title || "Card Title"}
      </h3>
      <div>
        {/* Card content goes here */}
      </div>
    </div>
  );
};
`;
    }
  } else if (language === "swift") {
    // SwiftUI component
    if (element.type === "container") {
      return `import SwiftUI

struct ${element.name.replace(/\s+/g, '')}: View {
    var body: some View {
        VStack(alignment: .leading, spacing: ${gap}) {
            // Add child components here
        }
        .frame(width: ${size.width}, height: ${size.height})
        .background(Color(hex: "${style.backgroundColor || "#ffffff"}"))
        .cornerRadius(${style.borderRadius || 0})
        .padding(${style.padding || 0})
        .position(x: ${position.x}, y: ${position.y})
    }
}

// Helper for hex color support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`;
    } else if (element.type === "button") {
      return `import SwiftUI

struct ${element.name.replace(/\s+/g, '')}: View {
    var body: some View {
        Button(action: {
            print("Button tapped")
            // Add your action here
        }) {
            Text("${element.props.text || "Button"}")
                .foregroundColor(Color(hex: "${style.color || "#ffffff"}"))
                .frame(width: ${size.width}, height: ${size.height})
                .font(.system(size: ${style.fontSize || 16}, weight: .${style.fontWeight || "medium"}))
        }
        .background(Color(hex: "${style.backgroundColor || "#3b82f6"}"))
        .cornerRadius(${style.borderRadius || 4})
        .padding(${style.padding || 0})
        .position(x: ${position.x}, y: ${position.y})
    }
}

// Helper for hex color support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`;
    } else if (element.type === "text") {
      return `import SwiftUI

struct ${element.name.replace(/\s+/g, '')}: View {
    var body: some View {
        Text("${element.props.text || "Text content"}")
            .foregroundColor(Color(hex: "${style.color || "#000000"}"))
            .font(.system(size: ${style.fontSize || 16}, weight: .${style.fontWeight || "regular"}))
            .frame(width: ${size.width}, height: ${size.height}, alignment: .${style.textAlign || "leading"})
            .position(x: ${position.x}, y: ${position.y})
    }
}

// Helper for hex color support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`;
    }
  }
  
  // Default empty code
  return `// Generated code for ${element.name} (${element.type})
// Add your implementation here
`;
};

// Function to generate complete code from design
const generateCodeFromDesign = (designElements: DesignElement[], projectLanguage: string): CodeFile[] => {
  const files: CodeFile[] = [];
  
  // Generate file for each component
  designElements.forEach(element => {
    if (element.type === "container" || element.type === "text" || element.type === "button") {
      const fileName = `${element.name.replace(/\s+/g, '')}.${projectLanguage === "typescript" ? "tsx" : 
                                                  projectLanguage === "javascript" ? "jsx" :
                                                  projectLanguage === "swift" ? "swift" : "py"}`;
                                                  
      files.push({
        id: uuidv4(),
        name: fileName,
        path: `/src/components/${fileName}`,
        language: getLanguageFromExtension(fileName),
        content: generateComponentCode(element, projectLanguage),
      });
    }
  });
  
  // Add index file
  const indexExtension = projectLanguage === "typescript" || projectLanguage === "javascript" ? 
    (projectLanguage === "typescript" ? "tsx" : "jsx") : 
    (projectLanguage === "swift" ? "swift" : "py");
  
  let indexContent = "";
  
  if (projectLanguage === "typescript" || projectLanguage === "javascript") {
    indexContent = `import React from 'react';
${designElements
  .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
  .map(el => `import { ${el.name.replace(/\s+/g, '')} } from './components/${el.name.replace(/\s+/g, '')}';`)
  .join('\n')}

export default function App() {
  return (
    <div className="App">
      ${designElements
        .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
        .map(el => `<${el.name.replace(/\s+/g, '')} />`)
        .join('\n      ')}
    </div>
  );
}
`;
  } else if (projectLanguage === "swift") {
    indexContent = `import SwiftUI

${designElements
  .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
  .map(el => `import ${el.name.replace(/\s+/g, '')}`)
  .join('\n')}

struct ContentView: View {
    var body: some View {
        VStack {
            ${designElements
              .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
              .map(el => `${el.name.replace(/\s+/g, '')}()`)
              .join('\n            ')}
        }
        .padding()
    }
}
`;
  } else {
    indexContent = `# Main application file
${designElements
  .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
  .map(el => `from components.${el.name.replace(/\s+/g, '')} import ${el.name.replace(/\s+/g, '')}`)
  .join('\n')}

def main():
    print("Application started")
    ${designElements
      .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
      .map(el => `    ${el.name.replace(/\s+/g, '')}().render()`)
      .join('\n')}

if __name__ == "__main__":
    main()
`;
  }
  
  files.push({
    id: uuidv4(),
    name: `index.${indexExtension}`,
    path: `/src/index.${indexExtension}`,
    language: getLanguageFromExtension(`index.${indexExtension}`),
    content: indexContent,
  });
  
  // Add default files if no elements exist
  if (designElements.length === 0) {
    if (projectLanguage === "typescript" || projectLanguage === "javascript") {
      files.push({
        id: uuidv4(),
        name: `App.${projectLanguage === "typescript" ? "tsx" : "jsx"}`,
        path: `/src/App.${projectLanguage === "typescript" ? "tsx" : "jsx"}`,
        language: projectLanguage,
        content: `
import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated App</h1>
        <p>This is automatically generated from your design</p>
        <button>Click me</button>
      </header>
    </div>
  );
}

export default App;
        `.trim(),
      });
      
      files.push({
        id: uuidv4(),
        name: `index.${projectLanguage === "typescript" ? "tsx" : "jsx"}`,
        path: `/src/index.${projectLanguage === "typescript" ? "tsx" : "jsx"}`,
        language: projectLanguage,
        content: `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
        `.trim(),
      });
    } else if (projectLanguage === "swift") {
      files.push({
        id: uuidv4(),
        name: "ContentView.swift",
        path: "/ContentView.swift",
        language: "swift",
        content: `
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Text("Generated App")
                .font(.title)
            Text("This is automatically generated from your design")
            Button("Click me") {
                print("Button tapped")
            }
        }
        .padding()
    }
}
        `.trim(),
      });
    } else {
      files.push({
        id: uuidv4(),
        name: "main.py",
        path: "/main.py",
        language: "python",
        content: `
print("Generated Python App")
print("This is automatically generated from your design")

def main():
    print("Main function")

if __name__ == "__main__":
    main()
        `.trim(),
      });
    }
  }
  
  return files;
};

export default function CodeMode() {
  const {
    codeFiles,
    currentFileId,
    projectLanguage,
    designElements,
    setCurrentFile,
    addCodeFile,
    updateCodeFile,
    removeCodeFile,
  } = useEditorStore();
  
  const [newFileName, setNewFileName] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("files");
  const [selectedFolder, setSelectedFolder] = useState("/");
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Generate initial code files if none exist
  useEffect(() => {
    if (codeFiles.length === 0) {
      const generatedFiles = generateCodeFromDesign(designElements, projectLanguage);
      generatedFiles.forEach((file) => {
        addCodeFile(file);
      });
      
      if (generatedFiles.length > 0) {
        setCurrentFile(generatedFiles[0].id);
      }
    }
  }, [codeFiles.length, projectLanguage, designElements, addCodeFile, setCurrentFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (currentFileId && value !== undefined) {
      updateCodeFile(currentFileId, { content: value });
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const filePath = selectedFolder === "/" ? `/${newFileName}` : `${selectedFolder}/${newFileName}`;
    
    const newFile: CodeFile = {
      id: uuidv4(),
      name: newFileName,
      path: filePath,
      language: getLanguageFromExtension(newFileName),
      content: `// ${newFileName}\n// Created on ${new Date().toLocaleString()}\n`,
    };
    
    addCodeFile(newFile);
    setCurrentFile(newFile.id);
    setNewFileName("");
    setFileDialogOpen(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      removeCodeFile(fileId);
    }
  };

  const handleRegenerateCode = () => {
    if (confirm("This will replace all your code files with newly generated code based on your design elements. Are you sure?")) {
      setIsRegenerating(true);
      
      // Clear existing code files
      codeFiles.forEach(file => {
        removeCodeFile(file.id);
      });
      
      // Generate new code files
      const generatedFiles = generateCodeFromDesign(designElements, projectLanguage);
      generatedFiles.forEach((file) => {
        addCodeFile(file);
      });
      
      if (generatedFiles.length > 0) {
        setCurrentFile(generatedFiles[0].id);
      }
      
      setIsRegenerating(false);
    }
  };

  const currentFile = codeFiles.find((file) => file.id === currentFileId);
  
  // Organize files by folder structure
  const fileTree: Record<string, CodeFile[]> = {};
  codeFiles.forEach(file => {
    const pathParts = file.path.split('/');
    pathParts.pop(); // Remove the file name
    const dirPath = pathParts.join('/') || '/';
    
    if (!fileTree[dirPath]) {
      fileTree[dirPath] = [];
    }
    
    fileTree[dirPath].push(file);
  });
  
  // Get list of unique folders
  const folders = Object.keys(fileTree).sort();

  return (
    <div className="flex h-full">
      {/* Left sidebar with Tabs */}
      <div className="w-64 border-r bg-background flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
            <TabsTrigger value="components" className="flex-1">Components</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="overflow-auto flex-1 px-2 py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium">Files</div>
              <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    + New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Folder</label>
                      <select 
                        className="mt-1 w-full rounded-md border-input border px-3 py-2 text-sm"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                      >
                        {folders.map(folder => (
                          <option key={folder} value={folder}>{folder === "/" ? "/ (root)" : folder}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">File Name</label>
                      <Input
                        placeholder="example.js"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setFileDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFile}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* File tree */}
            <div>
              {folders.map(folder => (
                <div key={folder} className="mb-2">
                  <div className="flex items-center py-1">
                    <Folder className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{folder === "/" ? "/ (root)" : folder}</span>
                  </div>
                  <div className="ml-3 space-y-1">
                    {fileTree[folder].map(file => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-xs ${
                          currentFileId === file.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                        }`}
                      >
                        <div 
                          className="flex items-center flex-1 overflow-hidden"
                          onClick={() => setCurrentFile(file.id)}
                        >
                          <File className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="flex-1 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium">Generated Components</div>
              <Button 
                size="sm" 
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                variant="outline"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Regenerate</span>
              </Button>
            </div>
            
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Generate from design</AlertTitle>
              <AlertDescription>
                Create code components from your design elements automatically.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              {designElements.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No design elements found. Create elements in the Design mode to generate code.
                </div>
              ) : (
                designElements
                  .filter(el => el.type === "container" || el.type === "text" || el.type === "button")
                  .map(element => (
                    <div 
                      key={element.id}
                      className="border rounded-md p-2 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const fileName = `${element.name.replace(/\s+/g, '')}.${
                          projectLanguage === "typescript" ? "tsx" : 
                          projectLanguage === "javascript" ? "jsx" :
                          projectLanguage === "swift" ? "swift" : "py"
                        }`;
                        
                        const file = codeFiles.find(f => f.name === fileName);
                        if (file) {
                          setCurrentFile(file.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{element.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Component
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Code editor */}
      <div className="flex-1 h-full overflow-hidden">
        {currentFile ? (
          <Editor
            height="100%"
            defaultLanguage={currentFile.language}
            language={currentFile.language}
            value={currentFile.content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              formatOnPaste: true,
              formatOnType: true,
              suggest: {
                showClasses: true,
                showFunctions: true,
                showVariables: true,
              },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No file selected
          </div>
        )}
      </div>
    </div>
  );
} 