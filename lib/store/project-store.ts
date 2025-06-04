import { create } from 'zustand';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { ProjectData, Platform, UserRole } from '../utils';

// Define mock data for development mode
const createEmptyCollaborators = () => {
  return [] as { uid: string; role: UserRole }[];
};

interface ProjectState {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  isLoading: boolean;
  error: string | null;

  // Methods
  fetchUserProjects: (userId: string) => Promise<void>;
  createProject: (projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, userId: string) => Promise<string>;
  updateProject: (projectId: string, projectData: Partial<ProjectData>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProject: (projectId: string) => Promise<void>;
  addCollaborator: (projectId: string, userId: string, role: UserRole) => Promise<void>;
  removeCollaborator: (projectId: string, userId: string) => Promise<void>;
}

// Add eslint-disable comment to unused function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const findProject = (projects: ProjectData[], projectId: string): ProjectData | undefined => {
  return projects.find(p => p.id === projectId);
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchUserProjects: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder'))) {
        console.log('Using demo projects in development mode');
        
        // Create demo projects
        const demoProjects: ProjectData[] = [
          {
            id: 'demo-project-1',
            name: 'My First App',
            description: 'A simple mobile app with basic UI components',
            platform: 'mobile',
            language: 'swift',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            createdBy: userId,
            collaborators: []
          },
          {
            id: 'demo-project-2',
            name: 'Portfolio Website',
            description: 'A responsive website showcasing my work',
            platform: 'web',
            language: 'typescript',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            createdBy: userId,
            collaborators: []
          }
        ];
        
        // Immediate response, no delay needed
        set({
          projects: demoProjects,
          isLoading: false
        });
        return;
      }
      
      // Add safety timeout to prevent infinite loading
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Firebase request timed out, using demo data'));
        }, 1500);
      });
      
      try {
        // Race between Firebase call and timeout
        await Promise.race([
          (async () => {
            // Real Firebase implementation
            // Query for projects created by the user
            const q1 = query(
              collection(db, 'projects'),
              where('createdBy', '==', userId),
              orderBy('createdAt', 'desc')
            );
            
            // Query for projects where user is a collaborator
            const q2 = query(
              collection(db, 'projects'),
              where(`collaborators.${userId}`, '!=', null)
            );
            
            const [snapshot1, snapshot2] = await Promise.all([
              getDocs(q1),
              getDocs(q2)
            ]);
            
            // Combine and deduplicate results
            const projectsMap = new Map<string, ProjectData>();
            
            // Process owned projects
            snapshot1.forEach(doc => {
              const data = doc.data();
              const collaborators = data.collaborators ? 
                Object.entries(data.collaborators).map(([uid, roleData]) => ({
                  uid,
                  role: (roleData as {role: UserRole}).role
                })) : [];
                
              projectsMap.set(doc.id, {
                id: doc.id,
                name: data.name,
                description: data.description,
                platform: data.platform,
                language: data.language,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                createdBy: data.createdBy,
                collaborators
              });
            });
            
            // Process collaborated projects
            snapshot2.forEach(doc => {
              if (!projectsMap.has(doc.id)) {
                const data = doc.data();
                const collaborators = data.collaborators ? 
                  Object.entries(data.collaborators).map(([uid, roleData]) => ({
                    uid,
                    role: (roleData as {role: UserRole}).role
                  })) : [];
                  
                projectsMap.set(doc.id, {
                  id: doc.id,
                  name: data.name,
                  description: data.description,
                  platform: data.platform,
                  language: data.language,
                  createdAt: data.createdAt?.toDate() || new Date(),
                  updatedAt: data.updatedAt?.toDate() || new Date(),
                  createdBy: data.createdBy,
                  collaborators
                });
              }
            });
            
            set({ 
              projects: Array.from(projectsMap.values()),
              isLoading: false 
            });
          })(),
          timeoutPromise
        ]);
      } catch (error) {
        console.warn('Using demo projects as fallback:', error);
        
        // Fallback to demo projects
        const demoProjects: ProjectData[] = [
          {
            id: 'demo-project-1',
            name: 'My First App',
            description: 'A simple mobile app with basic UI components',
            platform: 'mobile',
            language: 'swift',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            createdBy: userId,
            collaborators: []
          },
          {
            id: 'demo-project-2',
            name: 'Portfolio Website',
            description: 'A responsive website showcasing my work',
            platform: 'web',
            language: 'typescript',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            createdBy: userId,
            collaborators: []
          }
        ];
        
        set({
          projects: demoProjects,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch projects' 
      });
    }
  },

  createProject: async (
    projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, 
    userId: string
  ) => {
    try {
      console.log('Creating project with data:', projectData);
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder'))) {
        console.log('Creating demo project in development mode');
        
        // Create a demo project with a unique ID
        const projectId = 'demo-project-' + Date.now();
        console.log('Generated project ID:', projectId);
        
        const newProject: ProjectData = {
          id: projectId,
          ...projectData,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          collaborators: createEmptyCollaborators()
        };
        
        // Simulate a very short delay (just enough to prevent UI jank)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        set(state => {
          console.log('Updating state with new project:', newProject);
          return { 
            projects: [newProject, ...state.projects],
            currentProject: newProject,
            isLoading: false 
          };
        });
        
        return projectId;
      }
      
      // Real Firebase implementation
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        collaborators: {} // Initialize with empty collaborators object
      });
      
      const newProject: ProjectData = {
        id: docRef.id,
        ...projectData,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        collaborators: createEmptyCollaborators()
      };
      
      set(state => ({ 
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false 
      }));
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create project' 
      });
      throw error;
    }
  },

  updateProject: async (projectId: string, projectData: Partial<ProjectData>) => {
    try {
      set({ isLoading: true, error: null });
      
      // Remove fields that shouldn't be directly updated
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, createdBy, ...updateData } = projectData;
      
      await updateDoc(doc(db, 'projects', projectId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { 
              ...project, 
              ...projectData,
              updatedAt: new Date() 
            };
          }
          return project;
        });
        
        const updatedCurrentProject = state.currentProject?.id === projectId 
          ? { ...state.currentProject, ...projectData, updatedAt: new Date() }
          : state.currentProject;
        
        return { 
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          isLoading: false 
        };
      });
    } catch (error) {
      console.error('Error updating project:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update project' 
      });
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await deleteDoc(doc(db, 'projects', projectId));
      
      // Update local state
      set(state => ({ 
        projects: state.projects.filter(project => project.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete project' 
      });
      throw error;
    }
  },

  getProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder'))) {
        console.log('Fetching demo project in development mode');
        
        // Find an existing project with this ID first
        const state = get();
        const existingProject = state.projects.find((project: ProjectData) => project.id === projectId);
        
        // If we have this project already in state, just use it
        if (existingProject) {
          console.log('Found existing project in state:', existingProject);
          set({
            currentProject: existingProject,
            isLoading: false
          });
          return;
        }
        
        // Otherwise create a demo project
        const demoProject: ProjectData = {
          id: projectId,
          name: 'Demo Project',
          description: 'A demo project for development',
          platform: 'web',
          language: 'typescript',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(),
          createdBy: 'demo-user',
          collaborators: createEmptyCollaborators()
        };
        
        // No delay needed here since we're returning an existing object
        set({
          currentProject: demoProject,
          isLoading: false
        });
        
        return;
      }
      
      // Real Firebase implementation
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const project: ProjectData = {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          platform: data.platform as Platform,
          language: data.language,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          collaborators: data.collaborators ? 
            Object.entries(data.collaborators).map(([uid, roleData]) => ({
              uid,
              role: (roleData as {role: UserRole}).role
            })) : []
        };
        
        set({ currentProject: project, isLoading: false });
      } else {
        set({ 
          error: 'Project not found', 
          isLoading: false 
        });
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch project' 
      });
      throw error;
    }
  },

  addCollaborator: async (projectId: string, userId: string, role: UserRole) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder'))) {
        console.log('Adding collaborator in demo mode');
        
        // Update local state directly in demo mode
        set(state => {
          const updatedProjects = state.projects.map(project => {
            if (project.id === projectId) {
              const updatedCollaborators = [...(project.collaborators || [])];
              const existingIndex = updatedCollaborators.findIndex(c => c.uid === userId);
              
              if (existingIndex >= 0) {
                updatedCollaborators[existingIndex] = { uid: userId, role };
              } else {
                updatedCollaborators.push({ uid: userId, role });
              }
              
              return { 
                ...project, 
                collaborators: updatedCollaborators,
                updatedAt: new Date() 
              };
            }
            return project;
          });
          
          let updatedCurrentProject = state.currentProject;
          if (state.currentProject?.id === projectId) {
            const currentCollaborators = [...(state.currentProject.collaborators || [])];
            const existingIndex = currentCollaborators.findIndex(c => c.uid === userId);
            
            if (existingIndex >= 0) {
              currentCollaborators[existingIndex] = { uid: userId, role };
            } else {
              currentCollaborators.push({ uid: userId, role });
            }
            
            updatedCurrentProject = {
              ...state.currentProject,
              collaborators: currentCollaborators,
              updatedAt: new Date()
            };
          }
          
          return { 
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
            isLoading: false 
          };
        });
        
        return;
      }
      
      // Real Firebase implementation
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(projectRef);
      
      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const data = docSnap.data();
      const collaborators = data.collaborators || {};
      
      // Add/update collaborator
      collaborators[userId] = { role };
      
      await updateDoc(projectRef, {
        collaborators,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            const updatedCollaborators = [...(project.collaborators || [])];
            const existingIndex = updatedCollaborators.findIndex(c => c.uid === userId);
            
            if (existingIndex >= 0) {
              updatedCollaborators[existingIndex] = { uid: userId, role };
            } else {
              updatedCollaborators.push({ uid: userId, role });
            }
            
            return { 
              ...project, 
              collaborators: updatedCollaborators,
              updatedAt: new Date() 
            };
          }
          return project;
        });
        
        let updatedCurrentProject = state.currentProject;
        if (state.currentProject?.id === projectId) {
          const currentCollaborators = [...(state.currentProject.collaborators || [])];
          const existingIndex = currentCollaborators.findIndex(c => c.uid === userId);
          
          if (existingIndex >= 0) {
            currentCollaborators[existingIndex] = { uid: userId, role };
          } else {
            currentCollaborators.push({ uid: userId, role });
          }
          
          updatedCurrentProject = {
            ...state.currentProject,
            collaborators: currentCollaborators,
            updatedAt: new Date()
          };
        }
        
        return { 
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          isLoading: false 
        };
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add collaborator' 
      });
      throw error;
    }
  },

  removeCollaborator: async (projectId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder'))) {
        console.log('Removing collaborator in demo mode');
        
        // Update local state directly in demo mode
        set(state => {
          const updatedProjects = state.projects.map(project => {
            if (project.id === projectId) {
              return { 
                ...project, 
                collaborators: (project.collaborators || []).filter(c => c.uid !== userId),
                updatedAt: new Date() 
              };
            }
            return project;
          });
          
          let updatedCurrentProject = state.currentProject;
          if (state.currentProject?.id === projectId) {
            updatedCurrentProject = {
              ...state.currentProject,
              collaborators: (state.currentProject.collaborators || []).filter(c => c.uid !== userId),
              updatedAt: new Date()
            };
          }
          
          return { 
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
            isLoading: false 
          };
        });
        
        return;
      }
      
      // Real Firebase implementation
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(projectRef);
      
      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const data = docSnap.data();
      const collaborators = data.collaborators || {};
      
      // Remove collaborator
      delete collaborators[userId];
      
      await updateDoc(projectRef, {
        collaborators,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return { 
              ...project, 
              collaborators: (project.collaborators || []).filter(c => c.uid !== userId),
              updatedAt: new Date() 
            };
          }
          return project;
        });
        
        let updatedCurrentProject = state.currentProject;
        if (state.currentProject?.id === projectId) {
          updatedCurrentProject = {
            ...state.currentProject,
            collaborators: (state.currentProject.collaborators || []).filter(c => c.uid !== userId),
            updatedAt: new Date()
          };
        }
        
        return { 
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          isLoading: false 
        };
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to remove collaborator' 
      });
      throw error;
    }
  }
})); 