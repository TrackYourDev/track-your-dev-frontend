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

// GET /api/tasks - Get all tasks (for demonstration)
export async function GET(request: NextRequest) {
  try {
    // In real implementation, you would:
    // 1. Verify authentication
    // 2. Get organization ID from query params or user context
    // 3. Query database for tasks
    // 4. Apply filters
    
    return NextResponse.json({
      success: true,
      message: 'Tasks fetched successfully',
      data: mockTasks
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

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In real implementation, you would:
    // 1. Verify authentication
    // 2. Validate request body
    // 3. Check if user has permission to create tasks in the organization
    // 4. Create task in database
    // 5. Return created task with populated user data
    
    const newTask = {
      _id: Date.now().toString(),
      ...body,
      assignee: {
        _id: body.assigneeId,
        name: 'John Doe', // In real implementation, fetch from database
        login: 'johndoe',
        avatarUrl: 'https://github.com/johndoe.png'
      },
      createdBy: {
        _id: 'user1', // In real implementation, get from auth context
        name: 'Jane Smith',
        login: 'janesmith',
        avatarUrl: 'https://github.com/janesmith.png'
      },
      repository: {
        _id: body.repositoryId,
        name: 'my-app', // In real implementation, fetch from database
        fullName: 'org/my-app'
      },
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock data
    mockTasks.push(newTask);
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create task',
        errors: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 