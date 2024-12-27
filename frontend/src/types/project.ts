export interface Project {
    id: number;
    title: string;
    description: string;
    status: 'active' | 'frozen' | 'completed';
    createdAt: string;
    updatedAt: string;
}