// /api/vendor/search/route.ts
import { UserTable, VendorTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, ilike, or, sql, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - AJAX search for vendors by specializations and keywords
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");
    const status = searchParams.get("status") || "APPROVED";
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

    // Split search term by spaces or commas to handle multiple skills
    const searchTerms = searchTerm.split(/[\s,]+/).filter(term => term.length > 1);
    console.log('Split search terms:', searchTerms);

    // Build search conditions - EACH term must match (AND logic)
    const termConditions = searchTerms.map(term => {
      return or(
        // Search in company name
        ilike(VendorTable.companyName, `%${term}%`),
        
        // Search in dealing keywords array using PostgreSQL array contains
        sql`${VendorTable.dealingKeywords} && ARRAY[${term}]::text[]`,
        
        // Search in specializations array
        sql`${VendorTable.specializations} && ARRAY[${term}]::text[]`,
        
        // Partial match in dealing keywords (case-insensitive)
        sql`EXISTS (
          SELECT 1 FROM unnest(${VendorTable.dealingKeywords}) AS keyword 
          WHERE keyword ILIKE '%' || ${term} || '%'
        )`,
        
        // Partial match in specializations (case-insensitive)
        sql`EXISTS (
          SELECT 1 FROM unnest(${VendorTable.specializations}) AS spec 
          WHERE spec ILIKE '%' || ${term} || '%'
        )`
      );
    });

    // Build where conditions - ALL terms must match (AND logic)
    const whereConditions = [
      and(...termConditions) // This ensures ALL terms must match
    ];
    
    // Add status filter
    if (!includeInactive) {
      whereConditions.push(eq(VendorTable.status, "APPROVED"));
    }

    // Execute search query
    const vendors = await db
      .select({
        id: VendorTable.id,
        companyName: UserTable.name,
        legalName: VendorTable.legalName,
        location: sql`CONCAT(${VendorTable.city}, ', ', ${VendorTable.state})`.as('location'),
        phone: VendorTable.phone,
        email: VendorTable.email,
        website: VendorTable.website,
        specializations: VendorTable.specializations,
        dealingKeywords: VendorTable.dealingKeywords,
        status: VendorTable.status,
      })
      .from(VendorTable)
      .leftJoin(UserTable, eq(VendorTable.id, UserTable.vendorId))
      .where(and(...whereConditions))
      .limit(limit);

    // Process results to highlight matching terms
    const processedResults = vendors.map(vendor => {
      // Find matching keywords and specializations for all search terms
      const allMatchingKeywords: string[] = [];
      const allMatchingSpecializations: string[] = [];
      const matchedTerms: string[] = [];
      
      searchTerms.forEach(term => {
        let termMatched = false;
        
        // Check if company name matches this term
        if (vendor.companyName?.toLowerCase().includes(term.toLowerCase())) {
          termMatched = true;
        }
        
        // Check matching keywords for this term
        const matchingKeywords = vendor.dealingKeywords?.filter(keyword =>
          keyword.toLowerCase().includes(term.toLowerCase())
        ) || [];
        
        if (matchingKeywords.length > 0) {
          allMatchingKeywords.push(...matchingKeywords);
          termMatched = true;
        }
        
        // Check matching specializations for this term
        const matchingSpecializations = vendor.specializations?.filter(spec =>
          spec.toLowerCase().includes(term.toLowerCase())
        ) || [];

        if (matchingSpecializations.length > 0) {
          allMatchingSpecializations.push(...matchingSpecializations);
          termMatched = true;
        }
        
        if (termMatched) {
          matchedTerms.push(term);
        }
      });

      // Remove duplicates
      const uniqueMatchingKeywords = [...new Set(allMatchingKeywords)];
      const uniqueMatchingSpecializations = [...new Set(allMatchingSpecializations)];

      // Calculate relevance score based on multiple terms
      let relevanceScore = 0;
      
      // Company name matches
      matchedTerms.forEach(term => {
        if (vendor.companyName?.toLowerCase().includes(term.toLowerCase())) {
          relevanceScore += 10;
        }
      });
      
      relevanceScore += uniqueMatchingKeywords.length * 5;
      relevanceScore += uniqueMatchingSpecializations.length * 3;
      
      // Bonus points for matching ALL search terms
      if (matchedTerms.length === searchTerms.length) {
        relevanceScore += 20;
      }

      return {
        id: vendor.id,
        vendorName: vendor.companyName,
        legalName: vendor.legalName,
        location: vendor.location,
        phone: vendor.phone,
        email: vendor.email,
        website: vendor.website,
        specializations: vendor.specializations,
        dealingKeywords: vendor.dealingKeywords,
        status: vendor.status,
        relevanceScore,
      };
    });

    // Sort by relevance score
    processedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(VendorTable)
      .leftJoin(UserTable, eq(VendorTable.id, UserTable.vendorId))
      .where(and(...whereConditions));

    return NextResponse.json({
      results: processedResults,
      total: parseInt(totalCount[0].count as string),
      limit,
      hasMore: processedResults.length === limit,
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

// POST - Batch search with ALL terms required
export async function POST(request: NextRequest) {
  try {
    const { searchTerms, status = "APPROVED", limit = 5, matchAll = true } = await request.json();

    if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
      return NextResponse.json(
        { error: "searchTerms must be a non-empty array" },
        { status: 400 }
      );
    }

    if (matchAll) {
      // Search for vendors that match ALL terms
      const termConditions = searchTerms.map((term: string) => {
        if (!term || term.trim().length < 2) return null;
        
        return or(
          ilike(VendorTable.companyName, `%${term}%`),
          sql`${VendorTable.dealingKeywords} && ARRAY[${term}]::text[]`,
          sql`${VendorTable.specializations} && ARRAY[${term}]::text[]`,
          sql`EXISTS (
            SELECT 1 FROM unnest(${VendorTable.dealingKeywords}) AS keyword 
            WHERE keyword ILIKE '%' || ${term} || '%'
          )`
        );
      }).filter(condition => condition !== null);

      if (termConditions.length === 0) {
        return NextResponse.json({ results: [] });
      }

      const vendors = await db
        .select({
          id: VendorTable.id,
          vendorName: VendorTable.companyName,
          location: sql`CONCAT(${VendorTable.city}, ', ', ${VendorTable.state})`.as('location'),
          specializations: VendorTable.specializations,
          dealingKeywords: VendorTable.dealingKeywords,
          status: VendorTable.status,
        })
        .from(VendorTable)
        .where(
          and(
            and(...termConditions), // ALL terms must match
            eq(VendorTable.status, status as any)
          )
        )
        .limit(limit);

      return NextResponse.json({ 
        searchTerms,
        vendors,
      });
    } else {
      // Original behavior - match ANY term
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
              vendorName: VendorTable.companyName,
              location: sql`CONCAT(${VendorTable.city}, ', ', ${VendorTable.state})`.as('location'),
              specializations: VendorTable.specializations,
              dealingKeywords: VendorTable.dealingKeywords,
              status: VendorTable.status,
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

      return NextResponse.json({ 
        results,
        matchingStrategy: "ANY_TERM_MATCHES"
      });
    }

  } catch (error: any) {
    console.error("Error in batch vendor search:", error);
    return NextResponse.json(
      { error: "Failed to perform batch search" },
      { status: 500 }
    );
  }
}
