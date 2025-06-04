"use client";

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define project type
export interface OfflineProject {
  id: string;
  name: string;
  description: string;
  platform: string;
  language: string;
  lastModified: number;
  lastSynced?: number;
}

// Define editor state type
export interface EditorStateData {
  projectId: string;
  state: unknown;
  lastModified: number;
  lastSynced?: number;
}

interface CTRLDatabase extends DBSchema {
  projects: {
    key: string;
    value: OfflineProject;
    indexes: { 'by-last-modified': number };
  };
  editorState: {
    key: string;
    value: EditorStateData;
  };
}

let db: IDBPDatabase<CTRLDatabase> | null = null;

export async function initDB() {
  if (!db) {
    db = await openDB<CTRLDatabase>('ctrl-app-db', 1, {
      upgrade(database) {
        const projectStore = database.createObjectStore('projects', {
          keyPath: 'id',
        });
        projectStore.createIndex('by-last-modified', 'lastModified');
        
        database.createObjectStore('editorState', {
          keyPath: 'projectId',
        });
      },
    });
  }
  return db;
}

export async function saveProjectOffline(project: OfflineProject) {
  const database = await initDB();
  project.lastModified = Date.now();
  await database.put('projects', project);
}

export async function getProjectOffline(id: string) {
  const database = await initDB();
  return await database.get('projects', id);
}

export async function getAllProjectsOffline() {
  const database = await initDB();
  return await database.getAll('projects');
}

export async function saveEditorStateOffline(projectId: string, state: unknown) {
  const database = await initDB();
  const editorState: EditorStateData = {
    projectId,
    state,
    lastModified: Date.now(),
  };
  await database.put('editorState', editorState);
}

export async function getEditorStateOffline(projectId: string) {
  const database = await initDB();
  const result = await database.get('editorState', projectId);
  return result?.state;
}

export async function deleteProjectOffline(id: string) {
  const database = await initDB();
  await database.delete('projects', id);
  await database.delete('editorState', id);
}

export async function syncWithCloud() {
  // This function would handle synchronizing offline data with the cloud
  // when the application comes back online
  console.log('Syncing data with cloud...');
  
  // 1. Get all offline changes
  const database = await initDB();
  const offlineProjects = await database.getAll('projects');
  
  // 2. For each project, check if it needs to be synced
  for (const project of offlineProjects) {
    if (!project.lastSynced || project.lastModified > project.lastSynced) {
      // Project needs syncing
      try {
        // 3. Sync with cloud (implementation would depend on your backend)
        // const result = await syncProjectWithCloud(project);
        
        // 4. Update sync timestamp
        project.lastSynced = Date.now();
        await database.put('projects', project);
      } catch (error) {
        console.error(`Failed to sync project ${project.id}:`, error);
      }
    }
  }
  
  // 5. Do the same for editor states
  const tx = database.transaction('editorState', 'readonly');
  const editorStateStore = tx.objectStore('editorState');
  const editorStates = await editorStateStore.getAll();
  
  for (const state of editorStates) {
    if (!state.lastSynced || state.lastModified > state.lastSynced) {
      try {
        // Sync editor state with cloud
        // const result = await syncEditorStateWithCloud(state);
        
        state.lastSynced = Date.now();
        await database.put('editorState', state);
      } catch (error) {
        console.error(`Failed to sync editor state for project ${state.projectId}:`, error);
      }
    }
  }
  
  return true;
}

// Initialize the network status detection
export function initOfflineSupport() {
  window.addEventListener('online', () => {
    console.log('App is online. Starting sync...');
    syncWithCloud().then(() => {
      console.log('Sync completed');
    });
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline. Changes will be saved locally.');
  });
} 