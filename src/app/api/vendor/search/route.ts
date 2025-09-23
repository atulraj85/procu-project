// /api/vendor/search/route.ts
import { VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, ilike, or, sql, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - AJAX search for vendors by specializations and keywords
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");
    const status = searchParams.get("status") || "VERIFIED"; // Default to verified vendors
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Validate query parameter
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { 
          error: "Search query must be at least 2 characters long",
          results: [],
          total: 0
        },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();
    console.log('Searching vendors for:', searchTerm);

    // Build search conditions
    const searchConditions = [
      // Search in company name
      ilike(VendorTable.companyName, `%${searchTerm}%`),
      
      // Search in dealing keywords array using PostgreSQL array contains
      sql`${VendorTable.dealingKeywords} && ARRAY[${searchTerm}]::text[]`,
      
      // Search in specializations array
      sql`${VendorTable.specializations} && ARRAY[${searchTerm}]::text[]`,
      
      // Partial match in dealing keywords (case-insensitive)
      sql`EXISTS (
        SELECT 1 FROM unnest(${VendorTable.dealingKeywords}) AS keyword 
        WHERE keyword ILIKE '%' || ${searchTerm} || '%'
      )`,
      
      // Partial match in specializations (case-insensitive)
      sql`EXISTS (
        SELECT 1 FROM unnest(${VendorTable.specializations}) AS spec 
        WHERE spec ILIKE '%' || ${searchTerm} || '%'
      )`,
      
      // Search in description
      ilike(VendorTable.description, `%${searchTerm}%`),
    ];

    // Build where conditions
    const whereConditions = [or(...searchConditions)];
    
    // Add status filter
    if (!includeInactive) {
      whereConditions.push(
        or(
          eq(VendorTable.status, "APPROVED"),
        )
      );
    }

    // Execute search query
    const vendors = await db
      .select({
        id: VendorTable.id,
        companyName: VendorTable.companyName,
        legalName: VendorTable.legalName,
        city: VendorTable.city,
        state: VendorTable.state,
        phone: VendorTable.phone,
        email: VendorTable.email,
        website: VendorTable.website,
        specializations: VendorTable.specializations,
        dealingKeywords: VendorTable.dealingKeywords,
        status: VendorTable.status,
        logo: VendorTable.logo,
        description: VendorTable.description,
      })
      .from(VendorTable)
      .where(and(...whereConditions))
      .limit(limit)
      .orderBy(sql`
        CASE 
          WHEN ${VendorTable.companyName} ILIKE ${`%${searchTerm}%`} THEN 1
          WHEN array_to_string(${VendorTable.dealingKeywords}, ',') ILIKE ${`%${searchTerm}%`} THEN 2
          WHEN array_to_string(${VendorTable.specializations}, ',') ILIKE ${`%${searchTerm}%`} THEN 3
          ELSE 4
        END
      `);

    // Process results to highlight matching terms
    const processedResults = vendors.map(vendor => {
      // Find matching keywords and specializations
      const matchingKeywords = vendor.dealingKeywords?.filter(keyword =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];
      
      const matchingSpecializations = vendor.specializations?.filter(spec =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

      // Calculate relevance score
      let relevanceScore = 0;
      if (vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase())) relevanceScore += 10;
      relevanceScore += matchingKeywords.length * 5;
      relevanceScore += matchingSpecializations.length * 3;

      return {
        ...vendor,
        matchingKeywords,
        matchingSpecializations,
        relevanceScore,
        // Formatted display name
        displayName: `${vendor.companyName}${vendor.legalName && vendor.legalName !== vendor.companyName ? ` (${vendor.legalName})` : ''}`,
        // Location string
        location: `${vendor.city}, ${vendor.state}`,
        // Match summary
        matchSummary: [
          ...matchingKeywords.map(k => `Keyword: ${k}`),
          ...matchingSpecializations.map(s => `Specialization: ${s}`)
        ].slice(0, 3), // Limit to top 3 matches
      };
    });

    // Sort by relevance score
    processedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Get total count for pagination (optional)
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(VendorTable)
      .where(and(...whereConditions));

    return NextResponse.json({
      query: searchTerm,
      results: processedResults,
      total: parseInt(totalCount[0].count as string),
      limit,
      hasMore: processedResults.length === limit
    });

  } catch (error: any) {
    console.error("Error searching vendors:", error);
    return NextResponse.json(
      { 
        error: "Failed to search vendors",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        results: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST - Batch search for multiple terms
export async function POST(request: NextRequest) {
  try {
    const { searchTerms, status = "VERIFIED", limit = 5 } = await request.json();

    if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
      return NextResponse.json(
        { error: "searchTerms must be a non-empty array" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      searchTerms.map(async (term: string) => {
        if (!term || term.trim().length < 2) return { term, vendors: [] };

        const searchConditions = [
          ilike(VendorTable.companyName, `%${term}%`),
          sql`${VendorTable.dealingKeywords} && ARRAY[${term}]::text[]`,
          sql`${VendorTable.specializations} && ARRAY[${term}]::text[]`,
          sql`EXISTS (
            SELECT 1 FROM unnest(${VendorTable.dealingKeywords}) AS keyword 
            WHERE keyword ILIKE '%' || ${term} || '%'
          )`,
        ];

        const vendors = await db
          .select({
            id: VendorTable.id,
            companyName: VendorTable.companyName,
            city: VendorTable.city,
            state: VendorTable.state,
            specializations: VendorTable.specializations,
            dealingKeywords: VendorTable.dealingKeywords,
          })
          .from(VendorTable)
          .where(
            and(
              or(...searchConditions),
              eq(VendorTable.status, status as any)
            )
          )
          .limit(limit);

        return { term, vendors };
      })
    );

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error("Error in batch vendor search:", error);
    return NextResponse.json(
      { error: "Failed to perform batch search" },
      { status: 500 }
    );
  }
}
