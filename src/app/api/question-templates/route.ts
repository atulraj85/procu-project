// src/app/api/question-templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, desc } from 'drizzle-orm';
import { QuestionTemplateTable, ProductCategoryTable, UserTable } from '@/drizzle/schema';
import { db } from '@/lib/db';

// GET question templates - all or by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    
    // Base query with joins
    let query = db
      .select({
        id: QuestionTemplateTable.id,
        categoryId: QuestionTemplateTable.categoryId,
        categoryName: ProductCategoryTable.name,
        questions: QuestionTemplateTable.questions,
        version: QuestionTemplateTable.version,
        isActive: QuestionTemplateTable.isActive,
        createdBy: UserTable.name,
        createdByEmail: UserTable.email,
        createdAt: QuestionTemplateTable.createdAt,
        updatedAt: QuestionTemplateTable.updatedAt
      })
      .from(QuestionTemplateTable)
      .leftJoin(ProductCategoryTable, eq(QuestionTemplateTable.categoryId, ProductCategoryTable.id))
      .leftJoin(UserTable, eq(QuestionTemplateTable.createdBy, UserTable.id))
      .orderBy(desc(QuestionTemplateTable.createdAt));

    // Apply filters
    const whereConditions = [];
    
    if (templateId) {
      whereConditions.push(eq(QuestionTemplateTable.id, templateId));
    }
    
    if (categoryId) {
      whereConditions.push(eq(QuestionTemplateTable.categoryId, categoryId));
    }
    
    if (isActive !== null && isActive !== undefined) {
      whereConditions.push(eq(QuestionTemplateTable.isActive, isActive === 'true'));
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    const templates = await query;
    
    // If specific ID requested, return single object instead of array
    if (templateId) {
      const template = templates[0];
      if (!template) {
        return NextResponse.json(
          { message: 'Question template not found' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(template);
    }
    
    return NextResponse.json(templates);
    
  } catch (error) {
    console.error('Error fetching question templates:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST create a new question template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      categoryId,
      questions,
      version,
      isActive,
      createdBy
    } = body;

    // Validate required fields
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { message: 'Questions array is required and must not be empty' }, 
        { status: 400 }
      );
    }

    if (!createdBy) {
      return NextResponse.json(
        { message: 'Created by field is required' }, 
        { status: 400 }
      );
    }

    // Validate each question structure
    for (const question of questions) {
      if (!question.id || !question.question || !question.type) {
        return NextResponse.json(
          { message: 'Each question must have id, question text, and type' }, 
          { status: 400 }
        );
      }
      
      // Validate question types
      const validTypes = ['text', 'textarea', 'radio', 'select', 'checkbox', 'number', 'date'];
      if (!validTypes.includes(question.type)) {
        return NextResponse.json(
          { message: `Invalid question type: ${question.type}. Valid types: ${validTypes.join(', ')}` }, 
          { status: 400 }
        );
      }
    }

    // Verify user exists
    const userCheck = await db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(eq(UserTable.id, createdBy))
      .limit(1);

    if (userCheck.length === 0) {
      return NextResponse.json(
        { message: 'User not found' }, 
        { status: 404 }
      );
    }

    // If categoryId provided, verify category exists
    if (categoryId) {
      const categoryCheck = await db
        .select({ id: ProductCategoryTable.id })
        .from(ProductCategoryTable)
        .where(eq(ProductCategoryTable.id, categoryId))
        .limit(1);

      if (categoryCheck.length === 0) {
        return NextResponse.json(
          { message: 'Category not found' }, 
          { status: 404 }
        );
      }
    }

    // Create question template
    const [newTemplate] = await db
      .insert(QuestionTemplateTable)
      .values({
        categoryId: categoryId || null,
        questions: questions,
        version: version || 1,
        isActive: isActive !== undefined ? isActive : true,
        createdBy,
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json({
      data: newTemplate,
      message: 'Question template created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating question template:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
