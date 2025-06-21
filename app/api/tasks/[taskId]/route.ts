import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - in real implementation, this would come from a database
let mockTasks = [
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

// GET /api/tasks/[taskId] - Get a specific task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // In real implementation, you would:
    // 1. Verify authentication
    // 2. Check if user has access to this task
    // 3. Query database for the specific task
    // 4. Populate related data (assignee, createdBy, etc.)
    
    const task = mockTasks.find(t => t._id === taskId);
    
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Task fetched successfully',
      data: task
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch task',
        errors: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[taskId] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const body = await request.json();
    
    // In real implementation, you would:
    // 1. Verify authentication
    // 2. Check if user has permission to update this task
    // 3. Validate request body
    // 4. Update task in database
    // 5. Return updated task with populated data
    
    const taskIndex = mockTasks.findIndex(t => t._id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found'
        },
        { status: 404 }
      );
    }
    
    // Update the task
    const updatedTask = {
      ...mockTasks[taskIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    mockTasks[taskIndex] = updatedTask;
    
    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update task',
        errors: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[taskId] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // In real implementation, you would:
    // 1. Verify authentication
    // 2. Check if user has permission to delete this task (creator or org owner)
    // 3. Delete task from database
    // 4. Handle related data cleanup if needed
    
    const taskIndex = mockTasks.findIndex(t => t._id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found'
        },
        { status: 404 }
      );
    }
    
    // Remove the task
    mockTasks.splice(taskIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
      data: null
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete task',
        errors: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 