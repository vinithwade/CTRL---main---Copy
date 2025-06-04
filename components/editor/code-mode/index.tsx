import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileIcon, FolderIcon, PlusIcon, FileTextIcon, Search, ChevronRight, X } from "lucide-react";
import { useEditorStore } from "@/lib/store/editor-store";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

// Define file content type
interface FileContents {
  [key: string]: string;
}

export default function CodeMode() {
  const { projectLanguage } = useEditorStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [fileContent, setFileContent] = useState<FileContents>({});
  
  // Initialize default file structure and content based on project language
  useEffect(() => {
    const mainFileName = getMainFileName(projectLanguage);
    const indexFileName = getIndexFileName(projectLanguage);
    
    setSelectedFile(mainFileName);
    
    // Create file structure based on language
    const newFileStructure: FileNode[] = [
      {
        name: "(root)",
        path: "/",
        type: "folder",
        children: [
          { name: mainFileName, path: `/${mainFileName}`, type: "file" }
        ]
      },
      {
        name: "src",
        path: "/src",
        type: "folder",
        children: [
          { name: indexFileName, path: `/src/${indexFileName}`, type: "file" }
        ]
      }
    ];
    
    setFileStructure(newFileStructure);
    
    // Create content based on language
    const newFileContent: FileContents = {};
    newFileContent[mainFileName] = getDefaultMainContent(projectLanguage);
    newFileContent[indexFileName] = getDefaultIndexContent(projectLanguage);
    
    setFileContent(newFileContent);
  }, [projectLanguage]);

  // Helper function to get file names based on language
  const getMainFileName = (language: string): string => {
    switch (language.toLowerCase()) {
      case 'swift':
        return 'ContentView.swift';
      case 'javascript':
        return 'App.js';
      case 'typescript':
        return 'App.tsx';
      case 'react':
        return 'App.jsx';
      case 'python':
        return 'main.py';
      case 'java':
        return 'MainActivity.java';
      case 'kotlin':
        return 'MainActivity.kt';
      default:
        return 'App.js';
    }
  };
  
  // Helper function to get index file name based on language
  const getIndexFileName = (language: string): string => {
    switch (language.toLowerCase()) {
      case 'swift':
        return 'index.swift';
      case 'javascript':
        return 'index.js';
      case 'typescript':
        return 'index.tsx';
      case 'react':
        return 'index.jsx';
      case 'python':
        return '__init__.py';
      case 'java':
        return 'Application.java';
      case 'kotlin':
        return 'Application.kt';
      default:
        return 'index.js';
    }
  };
  
  // Helper function to get default main content based on language
  const getDefaultMainContent = (language: string): string => {
    switch (language.toLowerCase()) {
      case 'swift':
        return `import SwiftUI

struct ContentView: View {
  @State private var text = "Hello, World!"
  
  var body: some View {
    VStack {
      Text(text)
        .padding()
      Button("Change Text") {
        text = "Hello, SwiftUI!"
      }
    }
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}`;
      case 'javascript':
      case 'react':
        return `import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('Hello, World!');
  
  return (
    <div className="App">
      <header className="App-header">
        <p>{text}</p>
        <button onClick={() => setText('Hello, React!')}>
          Change Text
        </button>
      </header>
    </div>
  );
}

export default App;`;
      case 'typescript':
        return `import React, { useState } from 'react';
import './App.css';

function App(): JSX.Element {
  const [text, setText] = useState<string>('Hello, World!');
  
  return (
    <div className="App">
      <header className="App-header">
        <p>{text}</p>
        <button onClick={() => setText('Hello, TypeScript!')}>
          Change Text
        </button>
      </header>
    </div>
  );
}

export default App;`;
      case 'python':
        return `class MainApp:
    def __init__(self):
        self.message = "Hello, World!"
    
    def change_message(self):
        self.message = "Hello, Python!"
        
    def get_message(self):
        return self.message
        
if __name__ == "__main__":
    app = MainApp()
    print(app.get_message())
    app.change_message()
    print(app.get_message())`;
      case 'java':
        return `package com.example.app;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {
    private String message = "Hello, World!";
    private TextView textView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        textView = findViewById(R.id.text_view);
        textView.setText(message);
        
        Button button = findViewById(R.id.button);
        button.setOnClickListener(view -> {
            message = "Hello, Java!";
            textView.setText(message);
        });
    }
}`;
      case 'kotlin':
        return `package com.example.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button
import android.widget.TextView

class MainActivity : AppCompatActivity() {
    private var message = "Hello, World!"
    private lateinit var textView: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        textView = findViewById(R.id.text_view)
        textView.text = message
        
        val button = findViewById<Button>(R.id.button)
        button.setOnClickListener {
            message = "Hello, Kotlin!"
            textView.text = message
        }
    }
}`;
      default:
        return `// Default code template
        
function main() {
  console.log("Hello, World!");
}

main();`;
    }
  };
  
  // Helper function to get default index content based on language
  const getDefaultIndexContent = (language: string): string => {
    switch (language.toLowerCase()) {
      case 'swift':
        return `import SwiftUI

@main
struct MyApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
    }
  }
}`;
      case 'javascript':
      case 'react':
        return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
      case 'typescript':
        return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
      case 'python':
        return `from main import MainApp

def run_application():
    app = MainApp()
    print("Starting application...")
    print(app.get_message())
    
if __name__ == "__main__":
    run_application()`;
      case 'java':
        return `package com.example.app;

public class Application {
    public static void main(String[] args) {
        System.out.println("Application starting...");
    }
}`;
      case 'kotlin':
        return `package com.example.app

fun main() {
    println("Application starting...")
}`;
      default:
        return `// Main application entry point

import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Application starting...');
});`;
    }
  };

  // Function to add syntax highlighting based on file language
  const highlightCode = (code: string, fileName: string): React.ReactNode => {
    if (!code) return null;
    
    // Determine language from file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const language = getLanguageFromExtension(fileExtension);
    
    // Split code into lines for line numbering
    const lines = code.split('\n');
    
    // Apply language-specific highlighting
    switch (language) {
      case 'swift':
        return renderHighlightedCode(lines, line => 
          line.replace(/(import|struct|class|enum|func|var|let|if|else|for|while|return|self|static|@State|private)(\s|[({])/g, '<span class="text-sky-500 font-semibold">$1</span>$2')
              .replace(/(@main|View|App|Scene|WindowGroup|VStack|Text|Button|PreviewProvider)/g, '<span class="text-violet-500 font-semibold">$1</span>')
              .replace(/(".*?")/g, '<span class="text-emerald-500">$1</span>')
              .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
        );
        
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
        return renderHighlightedCode(lines, line => 
          line.replace(/(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|static|async|await)(\s|[({])/g, '<span class="text-sky-500 font-semibold">$1</span>$2')
              .replace(/(React|useState|useEffect|JSX|Component)(\.|,|\s|;|\))/g, '<span class="text-violet-500 font-semibold">$1</span>$2')
              .replace(/(<[\/]?[a-zA-Z0-9]+)(\s|>)/g, '<span class="text-amber-500 font-semibold">$1</span>$2')
              .replace(/({.*?})/g, '<span class="text-cyan-500">$1</span>')
              .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-emerald-500">$1</span>')
              .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
              .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500">$1</span>')
        );
        
      case 'python':
        return renderHighlightedCode(lines, line => 
          line.replace(/(def|class|import|from|if|elif|else|for|while|return|with|as|try|except|finally|raise)(\s|:)/g, '<span class="text-sky-500 font-semibold">$1</span>$2')
              .replace(/(__init__|__main__|self|print|len|str|int|float|bool|list|dict|set|tuple)/g, '<span class="text-violet-500 font-semibold">$1</span>')
              .replace(/(".*?"|'.*?')/g, '<span class="text-emerald-500">$1</span>')
              .replace(/(#.*)/g, '<span class="text-slate-500">$1</span>')
        );
        
      case 'java':
      case 'kotlin':
        return renderHighlightedCode(lines, line => 
          line.replace(/(package|import|class|interface|enum|fun|val|var|private|public|protected|static|final|override|abstract|extension|return|if|else|for|while|try|catch|finally|throw)(\s|[({])/g, '<span class="text-sky-500 font-semibold">$1</span>$2')
              .replace(/(String|Int|Boolean|Bundle|Activity|AppCompatActivity|TextView|Button)(\s|,|\.|:|\)|\(|<)/g, '<span class="text-violet-500 font-semibold">$1</span>$2')
              .replace(/(".*?")/g, '<span class="text-emerald-500">$1</span>')
              .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
              .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500">$1</span>')
        );
        
      default:
        // For other languages, return lines with line numbers but no highlighting
        return renderPlainCode(lines);
    }
  };
  
  // Helper to get language from file extension
  const getLanguageFromExtension = (extension: string): string => {
    switch (extension) {
      case 'swift': return 'swift';
      case 'js': return 'javascript';
      case 'jsx': return 'jsx';
      case 'ts': return 'typescript';
      case 'tsx': return 'tsx';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'kt': return 'kotlin';
      default: return extension;
    }
  };
  
  // Render highlighted code with line numbers
  const renderHighlightedCode = (lines: string[], highlightFn: (line: string) => string) => {
    return (
      <div className="relative">
        {/* Line numbers column */}
        <div className="absolute left-0 top-0 flex flex-col items-end pr-3 text-slate-500 select-none border-r border-slate-700 h-full pt-[0.125rem] bg-slate-900/30 line-numbers">
          {lines.map((_, i) => (
            <div key={i} className="h-6 text-xs leading-6">
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Code with syntax highlighting */}
        <div className="pl-12">
          {lines.map((line, i) => {
            const highlightedLine = highlightFn(line);
            
            return (
              <div key={i} className="h-6 leading-6 hover:bg-slate-800/30">
                <div dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render plain code with line numbers
  const renderPlainCode = (lines: string[]) => {
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 flex flex-col items-end pr-3 text-slate-500 select-none border-r border-slate-700 h-full pt-[0.125rem]">
          {lines.map((_, i) => (
            <div key={i} className="h-6 text-xs">
              {i + 1}
            </div>
          ))}
        </div>
        
        <div className="pl-12">
          {lines.map((line, i) => (
            <div key={i} className="h-6">
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filteredFiles = (): FileNode[] => {
    if (!searchQuery.trim()) return fileStructure;
    
    // Simple recursive filter function
    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        // Clone the node
        const newNode = {...node};
        
        // If it has children, filter them
        if (newNode.type === 'folder' && newNode.children) {
          newNode.children = filterNodes(newNode.children).filter(n => n !== null);
          // Return the folder if it has matching children or its name matches
          return (newNode.children.length > 0 || newNode.name.toLowerCase().includes(searchQuery.toLowerCase())) 
            ? newNode 
            : null;
        }
        
        // For files, return them only if they match the search
        return newNode.name.toLowerCase().includes(searchQuery.toLowerCase()) ? newNode : null;
      }).filter((n): n is FileNode => n !== null);
    };
    
    return filterNodes(fileStructure);
  };

  const handleFileClick = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
        {node.type === 'folder' ? (
          <div>
            <div className="flex items-center py-1 px-2 hover:bg-accent/50 rounded-md cursor-pointer">
              <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
              <FolderIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{node.name}</span>
            </div>
            {node.children && renderFileTree(node.children, level + 1)}
          </div>
        ) : (
          <div 
            className={`flex items-center py-1 px-2 hover:bg-accent/50 rounded-md cursor-pointer group ${selectedFile === node.name ? 'bg-accent/50' : ''}`}
            onClick={() => handleFileClick(node.name)}
          >
            <FileTextIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{node.name}</span>
            {selectedFile === node.name && (
              <X 
                className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar: File browser */}
      <div className="w-64 border-r flex flex-col h-full">
        <Tabs defaultValue="files" className="flex flex-col h-full">
          <div className="w-full border-b">
            <TabsList className="w-full rounded-none justify-start">
              <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
              <TabsTrigger value="components" className="flex-1">Components</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="files" className="flex-1 flex flex-col px-2 pt-2 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Files</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search files..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="overflow-auto flex-1">
              {renderFileTree(filteredFiles())}
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="p-4">
            <p className="text-sm text-muted-foreground">Components will be shown here</p>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right content: Code editor */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {selectedFile ? (
          <div className="flex-1 flex flex-col">
            <div className="border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center">
                <FileTextIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile}</span>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2">
                  Format
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2">
                  Save
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-sm font-mono whitespace-pre bg-slate-950 text-slate-100 rounded-md min-h-[500px] w-full shadow-inner code-editor">
                <code className="block leading-6 text-[14px]">
                  {highlightCode(fileContent[selectedFile] || 'No content available', selectedFile)}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-8 py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg max-w-md">
              <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-1 text-lg font-medium">No file selected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a file from the sidebar to view and edit code
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                const files = filteredFiles();
                if (files.length > 0 && files[0].children && files[0].children.length > 0) {
                  handleFileClick(files[0].children[0].name);
                }
              }}>
                Open first file
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 