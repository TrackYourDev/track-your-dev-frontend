import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - in real implementation, this would come from a database
const mockTasks = [
  {
    _id: '1',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens',
    status: 'todo',
    priority: 'high',
    assignee: {
      _id: 'user1',
      name: 'John Doe',
      login: 'johndoe',
      avatarUrl: 'https://github.com/johndoe.png'
    },
    createdBy: {
      _id: 'user2',
      name: 'Jane Smith',
      login: 'janesmith',
      avatarUrl: 'https://github.com/janesmith.png'
    },
    organization: 'org1',
    repository: {
      _id: 'repo1',
      name: 'my-app',
      fullName: 'org/my-app'
    },
    dueDate: '2024-02-15T00:00:00.000Z',
    tags: ['frontend', 'auth'],
    estimatedHours: 8,
    actualHours: 0,
    comments: [],
    createdAt: '2024-01-20T10:30:00.000Z',
    updatedAt: '2024-01-20T10:30:00.000Z'
  },
  {
    _id: '2',
    title: 'Design dashboard layout',
    description: 'Create responsive dashboard with sidebar navigation',
    status: 'in-progress',
    priority: 'medium',
    assignee: {
      _id: 'user2',
      name: 'Jane Smith',
      login: 'janesmith',
      avatarUrl: 'https://github.com/janesmith.png'
    },
    createdBy: {
      _id: 'user1',
      name: 'John Doe',
      login: 'johndoe',
      avatarUrl: 'https://github.com/johndoe.png'
    },
    organization: 'org1',
    repository: {
      _id: 'repo1',
      name: 'my-app',
      fullName: 'org/my-app'
    },
    dueDate: '2024-02-10T00:00:00.000Z',
    tags: ['frontend', 'ui'],
    estimatedHours: 6,
    actualHours: 3,
    comments: [],
    createdAt: '2024-01-18T10:30:00.000Z',
    updatedAt: '2024-01-21T10:30:00.000Z'
  },
  {
    _id: '3',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    status: 'done',
    priority: 'low',
    assignee: {
      _id: 'user3',
      name: 'Mike Johnson',
      login: 'mikejohnson',
      avatarUrl: 'https://github.com/mikejohnson.png'
    },
    createdBy: {
      _id: 'user1',
      name: 'John Doe',
      login: 'johndoe',
      avatarUrl: 'https://github.com/johndoe.png'
    },
    organization: 'org1',
    repository: {
      _id: 'repo1',
      name: 'my-app',
      fullName: 'org/my-app'
    },
    dueDate: '2024-01-25T00:00:00.000Z',
    tags: ['documentation'],
    estimatedHours: 4,
    actualHours: 4,
    comments: [],
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-25T10:30:00.000Z'
  }
];

// GET /api/tasks/organization/[organizationId] - Get tasks for a specific organization
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters for filtering
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    const priority = searchParams.get('priority');
    const repository = searchParams.get('repository');
    
    // In real implementation, you would:
    // 1. Verify authentication
    // 2. Check if user has access to this organization
    // 3. Query database for tasks with filters
    // 4. Apply pagination if needed
    
    let filteredTasks = mockTasks.filter(task => task.organization === organizationId);
    
    // Apply filters
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (assignee) {
      filteredTasks = filteredTasks.filter(task => task.assignee._id === assignee);
    }
    
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    if (repository) {
      filteredTasks = filteredTasks.filter(task => task.repository._id === repository);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tasks fetched successfully',
      data: filteredTasks
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch tasks',
        errors: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 